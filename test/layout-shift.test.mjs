// Browser test (Chromium through Playwright): the card does not move the dashboard. A state change of an entity the
// card does not show writes nothing in its shadow DOM; a change of its own entities patches it in place (no node
// replaced, its pictures and icons kept) and its height stays the same on every animation frame, so the sections
// grid never reflows under the user. Skipped when Playwright or Chromium is not installed, except in CI, where it
// must run. CHROMIUM_PATH points to a local Chromium if needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const src = readFileSync(new URL("../src/ha-switch-card.js", import.meta.url), "utf8");

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

const STUBS = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });
customElements.define("ha-icon", class extends HTMLElement { connectedCallback() { this.style.cssText = "display:inline-block;width:24px;height:24px"; } });
customElements.define("ha-switch", class extends HTMLElement { connectedCallback() { this.style.cssText = "display:inline-block;width:36px;height:20px"; } });`;
const state = (entity_id, s, attributes = {}) => [entity_id, { entity_id, state: s, attributes, last_updated: "2026-11-20T08:00:00Z" }];
const ports = (up) => Array.from({ length: 8 }, (_, i) => state(`sensor.switch_port_${i + 1}_status`, up.includes(i + 1) ? "1" : "2"));
const HASS = () => ({
  states: Object.fromEntries([
    state("switch.office_switch", "on"),
    state("sensor.office_switch_status", "Online"),
    state("binary_sensor.office_switch_connectivity", "on", { device_class: "connectivity" }),
    state("sensor.office_switch_uptime", "109530000"),
    state("sensor.office_switch_in", "184412876800", { unit_of_measurement: "B" }),
    state("sensor.office_switch_out", "39728447488", { unit_of_measurement: "B" }),
    ...ports([1, 2, 3, 5, 6, 8]),
  ]),
  entities: {},
  devices: {},
  language: "en",
  locale: { language: "en" },
  themes: { darkMode: false },
});
const CONFIG = {
  name: "Office switch",
  subtitle: "Netgear GS308T",
  switch_entity: "switch.office_switch",
  status_entity: "sensor.office_switch_status",
  connectivity_entity: "binary_sensor.office_switch_connectivity",
  uptime_entity: "sensor.office_switch_uptime",
  traffic_in_entity: "sensor.office_switch_in",
  traffic_out_entity: "sensor.office_switch_out",
  port_names: ["NAS", "Box", "", "", "AP", "", "TV", ""],
};

// Mounts the card, then sends 20 hass updates (even: an unrelated entity, odd: the card's own entities, through
// `mutate`) and records the card's height on every frame and the shadow DOM's mutations of each kind of update.
const probe = async (tag, config, width) => {
  const page = await browser.newPage({ viewport: { width: 800, height: 1400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(`<!doctype html><body style="margin:0"><div id="root" style="width:${width}px"></div></body>`);
  if (STUBS) await page.addScriptTag({ content: STUBS });
  await page.addScriptTag({ content: src });
  const r = await page.evaluate(
    async ({ tag, config, hass, mutate }) => {
      const frames = (n) => new Promise((done) => { const f = (k) => (k ? requestAnimationFrame(() => f(k - 1)) : done()); f(n); });
      const el = document.createElement(tag);
      el.setConfig({ type: `custom:${tag}`, ...config });
      hass.callWS = () => new Promise(() => {});
      hass.callService = async () => {};
      el.hass = hass;
      document.getElementById("root").appendChild(el);
      await frames(6);
      await new Promise((done) => setTimeout(done, 300));
      await frames(3);
      const step = new Function("states", "i", mutate);
      const counts = { unrelated: 0, removed: 0 };
      let kind = "unrelated";
      const count = (list) => {
        for (const m of list) {
          if (kind === "unrelated") counts.unrelated++;
          else if (m.type === "childList") counts.removed += [...m.removedNodes].filter((n) => n.nodeType === 1).length;
        }
      };
      const mo = new MutationObserver(count);
      const media = [...el.shadowRoot.querySelectorAll("img, svg")];
      mo.observe(el.shadowRoot, { subtree: true, childList: true, attributes: true, characterData: true });
      const heights = new Set();
      let run = true;
      const tick = () => {
        heights.add(Math.round(el.getBoundingClientRect().height));
        if (run) requestAnimationFrame(tick);
      };
      tick();
      let h = hass;
      for (let i = 0; i < 20; i++) {
        kind = i % 2 ? "related" : "unrelated";
        const states = { ...h.states };
        if (kind === "unrelated") states["sensor.layout_probe"] = { entity_id: "sensor.layout_probe", state: String(i), attributes: {} };
        else step(states, i);
        h = { ...h, states };
        el.hass = h;
        count(mo.takeRecords());
        await frames(2);
      }
      run = false;
      mo.disconnect();
      return { ...counts, heights: [...heights], mediaKept: media.every((n) => n.isConnected), media: media.length };
    },
    { tag, config, hass: HASS(), mutate: MUTATE }
  );
  await page.close();
  return { ...r, errors };
};

const MUTATE = `// The byte counters go up every 30 s (their rate changes), the uptime too.
const at = new Date(Date.UTC(2026, 10, 20, 8, 0, 30 * i)).toISOString();
for (const id of ["sensor.office_switch_in", "sensor.office_switch_out"]) {
  states[id] = { ...states[id], state: String(Number(states[id].state) + 1e6 * (1 + ((i * 37) % 50))), last_updated: at };
}
states["sensor.office_switch_uptime"] = { ...states["sensor.office_switch_uptime"], state: String(109530000 + 30 * i), last_updated: at };`;

for (const [tag, config, width] of [["ha-switch-mini-card", CONFIG, 260], ["ha-switch-mini-card", CONFIG, 480], ["ha-switch-card", CONFIG, 300], ["ha-switch-card", CONFIG, 480]]) {
  test(`${tag} at ${width} px: no write on unrelated updates, patched in place, constant height`, async (t) => {
    if (skip) return t.skip(skip);
    const r = await probe(tag, config, width);
    assert.deepEqual(r.errors, []);
    assert.equal(r.unrelated, 0, "an unrelated state change writes nothing");
    assert.equal(r.removed, 0, "no element replaced by an update of the card's own entities");
    assert.ok(r.media > 0 && r.mediaKept, "the pictures and icons are kept");
    assert.equal(r.heights.length, 1, `one height on every frame, got ${r.heights}`);
  });
}
