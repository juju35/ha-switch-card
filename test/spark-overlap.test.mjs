// Browser test (Chromium through Playwright): the 24 h sparklines of the traffic tiles and the mini card's rate chips
// never cross the text of their tile, light or dark, compact or zoomed, from 245 to 500 px. Skipped when
// Playwright or Chromium is not installed, except in CI, where it must run.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const states = Object.fromEntries(
  [
    ["switch.sw", "on", {}],
    ["sensor.s", "Online", {}],
    ["sensor.in", "184412876800", { unit_of_measurement: "B" }],
    ["sensor.out", "39728447488", { unit_of_measurement: "B" }],
    ...Array.from({ length: 8 }, (_, i) => [`sensor.p${i + 1}`, i % 3 ? "1" : "2", {}]),
  ].map(([id, state, attributes]) => [id, { entity_id: id, state, attributes }])
);
const config = {
  name: "Office switch",
  ports: 8,
  port_pattern: "sensor.p{n}",
  switch_entity: "switch.sw",
  status_entity: "sensor.s",
  traffic_in_entity: "sensor.in",
  traffic_out_entity: "sensor.out",
};

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

const HA_CARD = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });
customElements.define("ha-icon", class extends HTMLElement {
  connectedCallback() { if (!this.firstChild) this.innerHTML = "<svg class='icon' viewBox='0 0 24 24' style='width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)'></svg>"; }
});
customElements.define("ha-switch", class extends HTMLElement {
  connectedCallback() { this.style.cssText = "display:inline-block;width:36px;height:20px"; }
});`;

// Each sparkline against the glyphs of its own tile or row (text nodes and icons outside the sparkline).
const overlaps = async (cards) => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1600 } });
  await page.setContent(`<!doctype html><html><body style="margin:0;font-family:Roboto,Arial,sans-serif"><div id="root"></div></body></html>`);
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  const out = await page.evaluate(
    async ({ cards, states, config }) => {
      const res = [];
      const callWS = async (msg) => {
        const t0 = Date.parse(msg.start_time) || Date.now() - 288 * 300000;
        return Object.fromEntries(
          (msg.statistic_ids || []).map((id) => [id, Array.from({ length: 288 }, (_, i) => ({ start: t0 + i * 300000, change: 1048576 * (100 + 900 * Math.abs(Math.sin(i / 20))) }))])
        );
      };
      for (const { type, width, zoom } of cards) {
        const box = document.createElement("div");
        box.style.width = `${width}px`;
        document.getElementById("root").replaceChildren(box);
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, ...config });
        el.hass = { states, entities: {}, devices: {}, language: "en", locale: { language: "en" }, callService: async () => {}, callWS };
        box.appendChild(el);
        if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        await new Promise((r) => setTimeout(r, 300));
        el.hass = { ...el.hass };
        await new Promise((r) => setTimeout(r, 100));
        const sparks = [...el.shadowRoot.querySelectorAll(".spark")];
        const hits = [];
        for (const sp of sparks) {
          const s = sp.getBoundingClientRect();
          const host = sp.parentElement;
          const boxes = [];
          const walk = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
          while (walk.nextNode()) {
            if (!walk.currentNode.textContent.trim() || sp.contains(walk.currentNode)) continue;
            const range = document.createRange();
            range.selectNodeContents(walk.currentNode);
            for (const b of range.getClientRects()) boxes.push([walk.currentNode.textContent.trim(), b]);
          }
          for (const ic of host.querySelectorAll("svg.icon")) boxes.push(["icon", ic.getBoundingClientRect()]);
          for (const [txt, b] of boxes)
            if (b.width && b.height && b.left < s.right - 0.5 && b.right > s.left + 0.5 && b.top < s.bottom - 0.5 && b.bottom > s.top + 0.5)
              hits.push(`${host.className}: "${txt}"`);
        }
        res.push({ at: `${type}${zoom ? " zoomed" : ""} ${width}px`, sparks: sparks.length, hits });
      }
      return res;
    },
    { cards, states, config }
  );
  await page.close();
  return out;
};

test("sparklines sit in their own band: no text or icon of the tile or row under them", async (t) => {
  if (skip) return t.skip(skip);
  const cards = [];
  for (const width of [245, 300, 400, 500])
    for (const [type, zoom] of [
      ["ha-switch-card", false],
      ["ha-switch-mini-card", false],
      ["ha-switch-mini-card", true],
    ])
      cards.push({ type, width, zoom });
  for (const m of await overlaps(cards)) {
    assert.ok(m.sparks > 0, `${m.at}: no sparkline drawn`);
    assert.deepEqual(m.hits, [], `${m.at}: text under a sparkline`);
  }
});
