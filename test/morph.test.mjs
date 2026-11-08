// Browser test (Chromium through Playwright) of the card's in-place DOM patch (morph): a new traffic rate only
// rewrites its text, the nodes, the focus on the power toggle and its single listener survive, and the patched DOM
// matches a fresh render. Skipped when Playwright or Chromium is not installed, except in CI, where it must run.
// CHROMIUM_PATH points to a local Chromium if needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const src = readFileSync(new URL("../src/ha-switch-card.js", import.meta.url), "utf8");

// Stand-ins for Home Assistant's elements: ha-icon draws into itself (as the screenshot stub does), ha-switch is
// focusable through its shadow root and counts its `change` listeners.
const STUBS = `
customElements.define("ha-card", class extends HTMLElement {});
customElements.define("ha-icon", class extends HTMLElement {
  connectedCallback() { if (!this.firstChild) this.innerHTML = "<svg></svg>"; }
});
customElements.define("ha-switch", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true }).innerHTML = "<input type='checkbox'>";
    this.listeners = 0;
  }
  addEventListener(type, fn, o) { if (type === "change") this.listeners++; super.addEventListener(type, fn, o); }
});`;

let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

test("a new rate patches its text in place: nodes, focus on the power toggle and its listener are kept", async (t) => {
  if (skip) return t.skip(skip);
  const page = await browser.newPage();
  await page.setContent("<!doctype html><body></body>");
  await page.addScriptTag({ content: STUBS });
  await page.addScriptTag({ content: src });
  const r = await page.evaluate(async () => {
    const card = document.createElement("ha-switch-card");
    document.body.appendChild(card);
    card.setConfig({ ports: 2, port_pattern: "sensor.p{n}", switch_entity: "switch.sw", traffic_in_entity: "sensor.in", show_history: false });
    // Fixed sample times, whatever the time the evaluation takes.
    const now = Date.now();
    const at = (s) => new Date(now - s * 1000).toISOString();
    const hass = (bytes, s) => ({
      language: "en",
      states: {
        "switch.sw": { state: "on", attributes: {} },
        "sensor.p1": { state: "1", attributes: {} },
        "sensor.p2": { state: "2", attributes: {} },
        "sensor.in": { state: String(bytes), attributes: { unit_of_measurement: "B" }, last_updated: at(s) },
      },
      callService: async () => {},
    });
    card.hass = hass(1000, 20);
    card.hass = hass(3000, 10);
    const root = card.shadowRoot;
    const tile = root.querySelector(".tile .v");
    const before = tile.textContent;
    const toggle = root.querySelector("ha-switch");
    const icon = root.querySelector(".tile ha-icon");
    toggle.focus();
    const focusedBefore = root.activeElement === toggle;
    card.hass = hass(7000, 0);
    const out = {
      before,
      after: root.querySelector(".tile .v").textContent,
      sameTile: root.querySelector(".tile .v") === tile,
      sameToggle: root.querySelector("ha-switch") === toggle,
      iconKept: root.querySelector(".tile ha-icon") === icon && !!icon.firstChild,
      focusedBefore,
      focusedAfter: root.activeElement === toggle,
      listeners: toggle.listeners,
      label: toggle.getAttribute("aria-label"),
      patched: root.innerHTML,
    };
    // The same state drawn from scratch.
    root.innerHTML = "";
    card._key = "";
    card._render();
    out.fresh = root.innerHTML;
    return out;
  });
  await page.close();
  assert.equal(r.before, "200 B/s");
  assert.equal(r.after, "400 B/s");
  assert.ok(r.sameTile, "the rate's node is kept");
  assert.ok(r.sameToggle, "the power toggle is kept");
  assert.ok(r.iconKept, "an icon keeps what it drew in itself");
  assert.ok(r.focusedBefore && r.focusedAfter, "the power toggle keeps the focus");
  assert.equal(r.listeners, 1);
  assert.equal(r.label, "Power: Switch");
  assert.equal(r.patched, r.fresh);
});
