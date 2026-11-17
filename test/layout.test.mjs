// Browser test (Chromium through Playwright) of the cards' width in the places Home Assistant puts them: a sections
// column (6 columns on a phone, 245 px), a 1fr 1fr grid or a horizontal stack, and parents sized by their content
// (inline-block, a grid `auto` column, layout-card). The cards keep a usable width and never overflow, full and mini,
// compact and expanded. Skipped when Playwright or Chromium is not installed, except in CI, where it must run.
// CHROMIUM_PATH points to a local Chromium if needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const src = readFileSync(new URL("../src/ha-switch-card.js", import.meta.url), "utf8");

const STUBS = `
customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });
customElements.define("ha-icon", class extends HTMLElement {
  connectedCallback() { if (!this.firstChild) this.innerHTML = "<svg viewBox='0 0 24 24' style='width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)'></svg>"; }
});
customElements.define("ha-switch", class extends HTMLElement {
  connectedCallback() { this.style.cssText = "display:inline-block;width:36px;height:20px"; }
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

const states = Object.fromEntries(
  [
    ["switch.sw", "on"],
    ["sensor.s", "Online"],
    ["binary_sensor.c", "on"],
    ["sensor.up", "109530000"],
    ["sensor.in", "5"],
    ["sensor.out", "2"],
    ...Array.from({ length: 8 }, (_, i) => [`sensor.p${i + 1}`, i % 3 ? "1" : "2"]),
  ].map(([id, state]) => [id, { entity_id: id, state, attributes: id.startsWith("sensor.in") || id.startsWith("sensor.out") ? { unit_of_measurement: "Mbit/s" } : {} }])
);
const config = {
  name: "Office switch",
  subtitle: "Netgear GS308T",
  model: "gs308t",
  ports: 8,
  port_pattern: "sensor.p{n}",
  switch_entity: "switch.sw",
  status_entity: "sensor.s",
  connectivity_entity: "binary_sensor.c",
  uptime_entity: "sensor.up",
  traffic_in_entity: "sensor.in",
  traffic_out_entity: "sensor.out",
  show_history: false,
};

test("in a container sized by its content, a sections column, a 1fr 1fr grid or a horizontal stack, the cards keep a usable width and never overflow", { timeout: 60000 }, async (t) => {
  if (skip) return t.skip(skip);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent("<!doctype html><body style='margin:0;font-family:Roboto,Arial,sans-serif'></body>");
  await page.addScriptTag({ content: STUBS });
  await page.addScriptTag({ content: src });
  const results = await page.evaluate(
    async ({ states, config }) => {
      const out = [];
      // [name, box css, cards in the box, minimum width of a card sized by its content]
      const contexts = [
        ["inline-block", "display:inline-block", 1, true],
        ["grid auto", "display:grid;grid-template-columns:auto", 1, true],
        ["sections column 245px", "display:grid;grid-template-columns:minmax(0,1fr);width:245px", 1, false],
        ["phone, 6 columns 165px", "display:grid;grid-template-columns:minmax(0,1fr);width:165px", 1, false],
        ...[320, 360, 500].map((w) => [`grid 1fr 1fr ${w}px`, `display:grid;grid-template-columns:1fr 1fr;gap:8px;width:${w}px`, 2, false]),
        // hui-horizontal-stack-card: a flex row whose cards take an equal share.
        ...[320, 500].map((w) => [`horizontal stack ${w}px`, `display:flex;gap:8px;width:${w}px`, 2, false]),
      ];
      for (const type of ["ha-switch-card", "ha-switch-mini-card"])
        for (const expanded of type === "ha-switch-mini-card" ? [false, true] : [false])
          for (const wrapped of [false, true])
            for (const [name, css, n, intrinsic] of contexts) {
              const box = document.createElement("div");
              box.style.cssText = css;
              document.body.appendChild(box);
              const cards = [];
              for (let i = 0; i < n; i++) {
                const el = document.createElement(type);
                el.setConfig({ type: `custom:${type}`, ...config });
                el.hass = { states, language: "en", locale: { language: "en" }, callService: async () => {}, callWS: async () => ({}) };
                if (name.startsWith("horizontal")) el.style.cssText = "flex:1 1 0;min-width:0";
                if (wrapped) {
                  const div = document.createElement("div");
                  if (name.startsWith("horizontal")) div.style.cssText = "flex:1 1 0;min-width:0";
                  div.appendChild(el);
                  box.appendChild(div);
                } else box.appendChild(el);
                if (expanded) el._setZoom(true);
                cards.push(el);
              }
              await new Promise((r) => requestAnimationFrame(r));
              const boxRect = box.getBoundingClientRect();
              const widths = cards.map((el) => el.shadowRoot.querySelector("ha-card").getBoundingClientRect().width);
              // Overflow: a card past the box, past the half of the box it should get with two cards, or its own
              // content wider than the card.
              const overflow = Math.max(
                box.scrollWidth - box.clientWidth,
                ...cards.map((el, i) => {
                  const card = el.shadowRoot.querySelector("ha-card");
                  const r = card.getBoundingClientRect();
                  const cellRight = n === 2 ? boxRect.left + ((i + 1) * (boxRect.width - 8)) / 2 + i * 8 : boxRect.right;
                  return Math.max(r.right - cellRight, r.right - boxRect.right, card.scrollWidth - card.clientWidth);
                })
              );
              out.push({ label: `${type}${expanded ? " expanded" : ""} ${wrapped ? "in a div" : "direct"} ${name}`, n, intrinsic, boxWidth: boxRect.width, widths, overflow });
              box.remove();
            }
      return out;
    },
    { states, config }
  );
  await page.close();
  const failures = [];
  for (const r of results) {
    const ws = r.widths.map((w) => w.toFixed(0)).join("/");
    if (r.overflow > 0.5) failures.push(`${r.label}: overflows by ${r.overflow.toFixed(0)} px (widths ${ws})`);
    else if (r.intrinsic ? r.widths[0] < 240 : r.widths.some((w) => w < (r.n === 2 ? (r.boxWidth - 8) / 2 : r.boxWidth) - 0.5))
      failures.push(`${r.label}: ${ws} px in ${r.boxWidth} px`);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
});
