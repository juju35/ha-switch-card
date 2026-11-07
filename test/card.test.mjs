import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCard } from "./load.mjs";

const { HaSwitchCardEditor, esc } = loadCard("ha-switch-card.js", ["HaSwitchCardEditor", "esc"]);

test("the editor keeps its form while HA states change, rebuilds it on a language change", () => {
  const editor = new HaSwitchCardEditor();
  editor.setConfig({ type: "custom:ha-switch-card" });
  editor.hass = { language: "en", states: {} };
  const form = editor._form;
  const schema = form.schema;
  assert.ok(schema);

  const next = { language: "en", states: { "sensor.x": { state: "1" } } };
  editor.hass = next;
  assert.equal(editor._form, form);
  assert.equal(form.schema, schema, "schema not reassigned on a state change");
  assert.equal(form.hass, next, "the form still gets the new hass");

  editor.hass = { language: "fr", states: {} };
  assert.notEqual(form.schema, schema, "schema rebuilt for the new language");
});

test("esc escapes HTML text and attributes", () => {
  assert.equal(esc(`<"'&>`), "&lt;&quot;&#39;&amp;&gt;");
});

test("isSafeUrl accepts http(s) and relative paths, rejects javascript:/data:", () => {
  const { isSafeUrl } = loadCard("ha-switch-card.js", ["isSafeUrl"]);
  for (const u of ["http://switch.local", "https://switch.local/admin", "/local/admin"]) assert.equal(isSafeUrl(u), true, u);
  for (const u of ["javascript:alert(1)", "data:text/html,x", "vbscript:x", " javascript:alert(1)", "//evil.com", "//evil.com/admin"]) assert.equal(isSafeUrl(u), false, u);
  // The URL parser reads "\\" as "/" and drops tabs and newlines: these would open evil.com.
  for (const u of ["/\\evil.com", "/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\\/evil.com"]) assert.equal(isSafeUrl(u), false, JSON.stringify(u));
});

test("ports drawn and ports watched agree when ports is not a number", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  for (const ports of ["", "abc", 0, 5]) {
    const card = new HaSwitchCard();
    card.setConfig({ ports, port_pattern: "sensor.p{n}" });
    const watched = card._watched().filter((id) => id.startsWith("sensor.p"));
    assert.equal(watched.length, card._portCount());
    assert.equal(card._portCount(), ports === 5 ? 5 : 8);
  }
});

test("configWarnings flags configs the editor would not produce", () => {
  const { configWarnings } = loadCard("ha-switch-card.js", ["configWarnings"]);
  const base = { ports: 8, port_pattern: "sensor.p{n}" };
  assert.deepEqual([...configWarnings(base)], []);
  assert.equal(configWarnings({ ...base, port_pattern: "sensor.p" }).length, 1);
  assert.equal(configWarnings({ ...base, ports: 60 }).length, 1);
  assert.match(configWarnings({ ...base, ports: 10, model: "gs308t" })[0], /ports 9 to 10/);
  assert.deepEqual([...configWarnings({ ...base, ports: 10, model: "gs308t", image: "/local/x.png" })], []);
});

test("a config warning is logged once, not on every setConfig from the editor", () => {
  const warns = [];
  const console = { info() {}, log() {}, error() {}, warn: (msg) => warns.push(msg) };
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"], { console });
  const card = new HaSwitchCard();
  // Typing "sensor.sw_port_{n}_status" in the editor: HA calls setConfig on the preview at each keystroke.
  const target = "sensor.sw_port_{n}_status";
  for (let i = 1; i <= target.length; i++) card.setConfig({ port_pattern: target.slice(0, i) });
  assert.equal(warns.length, 1);
  assert.match(warns[0], /port_pattern has no \{n\}/);
  // Another card with the same mistake does not repeat it either; a different mistake is reported.
  new HaSwitchCard().setConfig({ port_pattern: "sensor.p" });
  new HaSwitchCard().setConfig({ port_pattern: "sensor.p{n}", ports: 60 });
  assert.equal(warns.length, 2);
  assert.match(warns[1], /ports is 60/);
});

test("ports, tiles and chips are keyboard buttons", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 2, port_pattern: "sensor.p{n}", status_entity: "sensor.s", traffic_in_entity: "sensor.in" });
  card.hass = { language: "en", states: { "sensor.p1": { state: "up", attributes: {} }, "sensor.s": { state: "x", attributes: {} }, "sensor.in": { state: "1", attributes: {} } } };
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<g class="port" data-entity="sensor\.p1" role="button" tabindex="0">/);
  assert.match(html, /class="tile" style="[^"]*" data-entity="sensor\.in" role="button" tabindex="0"/);
  assert.match(html, /class="chip"[^>]*data-entity="sensor\.s" role="button" tabindex="0"/);
});

test("the header icon and the admin link are reachable from the keyboard", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 2, port_pattern: "sensor.p{n}", status_entity: "sensor.s", url: "http://switch.local" });
  card.hass = { language: "en", states: { "sensor.s": { state: "x", attributes: { friendly_name: "Status" } } } };
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /class="ic big"[^>]*data-entity="sensor\.s" role="button" tabindex="0" aria-label="Status"/);
  assert.match(html, /class="device" data-url="http:\/\/switch\.local" role="link" tabindex="0"/);
});

test("the GS308T front panel lines up its ports and their link LEDs", () => {
  const { gs308tSvg, COLORS } = loadCard("ha-switch-card.js", ["gs308tSvg", "COLORS"]);
  const ports = [1, 2, 3, 4, 5, 6].map((n) => ({ n, id: `switch.p${n}`, colors: [n === 4 ? COLORS.red : COLORS.green, "#000"] }));
  const svg = gs308tSvg(ports, COLORS.green, "Port");
  const num = (re) => [...svg.matchAll(re)].map((m) => Number(m[1]));
  const portX = num(/<rect x="([\d.]+)" y="52" width="62" height="44"/g);
  const ledX = num(/<rect x="([\d.]+)" y="42" width="12" height="6"/g);
  assert.equal(portX.length, 8); // the 8 ports are always drawn, ports 7-8 inactive here
  assert.deepEqual(ledX, portX.map((x) => x + 3)); // one LED at the top-left corner of each port
  const steps = portX.slice(1).map((x, i) => x - portX[i]);
  assert.deepEqual(steps, [70, 70, 70, 86, 70, 70, 70]); // even spacing, wider gap between the two groups
  assert.equal((svg.match(/class="port"/g) || []).length, 6); // only configured ports are clickable
  assert.match(svg, /<rect x="363" y="42" width="12" height="6" rx="1" style="fill:#2a2b2e"\/>/); // port 4 down: LED off
});

test("online / idle states: English and French by default, case-insensitive, shown in the card's language", () => {
  const { HaSwitchCard, COLORS } = loadCard("ha-switch-card.js", ["HaSwitchCard", "COLORS"]);
  const show = (state, config = {}, language = "en") => {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s", ...config });
    card.hass = { language, states: { "sensor.s": { state, attributes: {} } } };
    return { color: card._statusColor(), html: card.shadowRoot.innerHTML };
  };
  // Existing configs relying on the former French default keep working.
  for (const s of ["En ligne", "en ligne", "Online", "ONLINE"]) assert.equal(show(s).color, COLORS.green, s);
  for (const s of ["Inactif", "idle"]) assert.equal(show(s).color, COLORS.orange, s);
  assert.equal(show("Offline").color, COLORS.red);
  assert.match(show("En ligne").html, /mdi:check-circle[\s\S]*>Online</);
  assert.match(show("online", {}, "fr").html, />En ligne</);
  assert.match(show("idle", {}, "fr").html, />Inactif</);
  // A configured value replaces the defaults.
  assert.equal(show("up", { online_state: "UP" }).color, COLORS.green);
  assert.equal(show("Online", { online_state: "up" }).color, COLORS.red);
});

test("I18N parity: every language has exactly the keys of en, placeholders included", () => {
  const { I18N, HaSwitchCard } = loadCard("ha-switch-card.js", ["I18N", "HaSwitchCard"]);
  const flat = (o, p = "") =>
    Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
  const ref = new Map(flat(I18N.en));
  const placeholders = (s) => String(s).match(/\{\w+\}/g) || [];
  for (const lang of ["fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"]) {
    assert.ok(I18N[lang], lang);
    const entries = new Map(flat(I18N[lang]));
    assert.deepEqual([...entries.keys()].sort(), [...ref.keys()].sort(), lang);
    for (const [k, v] of entries) {
      assert.deepEqual(placeholders(v), placeholders(ref.get(k)), `${lang}.${k}`);
      assert.ok(String(v).trim(), `${lang}.${k} is empty`);
    }
  }
  // The card is drawn in each language when the dashboard uses it.
  const idle = [["de", "Inaktiv"], ["es", "Inactivo"], ["sr", "Неактиван"], ["sr-Latn", "Neaktivan"]];
  idle.push(["it", "Inattivo"], ["nl", "Inactief"], ["pt", "Inativo"], ["pl", "Bezczynny"]);
  idle.push(["ro", "Inactiv"], ["da", "Inaktiv"], ["sv", "Inaktiv"], ["bg", "Неактивен"], ["ru", "Неактивен"], ["uk", "Неактивний"], ["hu", "Inaktív"]);
  idle.push(["sk", "Nečinný"], ["cs", "Nečinný"], ["sl", "Nedejavno"], ["lv", "Dīkstāvē"], ["el", "Ανενεργό"]);
  for (const [language, label] of idle) {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s" });
    card.hass = { language, states: { "sensor.s": { state: "idle", attributes: {} } } };
    assert.match(card.shadowRoot.innerHTML, new RegExp(`>${label}<`));
  }
});

test("traffic tiles: unavailable reads as Home Assistant shows it, other units are formatted by Home Assistant", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", traffic_in_entity: "sensor.in" });
  card.hass = { language: "en", states: {}, formatEntityState: (st) => (st.state === "unavailable" ? "Unavailable" : `fmt:${st.state}`) };
  const fmt = (state, unit) => card._formatTraffic({ state, attributes: unit ? { unit_of_measurement: unit } : {} });
  assert.equal(fmt("unavailable", "MB"), "Unavailable");
  assert.equal(fmt("1234.56789", "kB/s"), "fmt:1234.56789");
  assert.equal(fmt("2048", "B"), "2.00 KB");
  assert.equal(fmt("2048"), "2.00 KB");
});

test("unavailable / unknown ports, status and connectivity are grey, not red", () => {
  const { HaSwitchCard, COLORS } = loadCard("ha-switch-card.js", ["HaSwitchCard", "COLORS"]);
  for (const state of ["unavailable", "unknown"]) {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 2, port_pattern: "sensor.p{n}", connectivity_entity: "binary_sensor.c" });
    card.hass = { language: "en", states: { "sensor.p1": { state, attributes: {} }, "sensor.p2": { state: "2", attributes: {} }, "binary_sensor.c": { state, attributes: {} } } };
    assert.equal(card._statusColor(), COLORS.grey, state);
    const html = card.shadowRoot.innerHTML;
    assert.match(html, /mdi:help-network-outline/);
    assert.doesNotMatch(html, /mdi:network-off-outline/);
    const ports = [...html.matchAll(/data-entity="sensor\.p\d"[\s\S]*?style="fill:([^"]+)"/g)].map((m) => m[1]);
    // Port 2 has no link: grey (nothing plugged in) unless it is watched, then red.
    assert.deepEqual(ports, [COLORS.grey, COLORS.grey], state);
    card.setConfig({ ports: 2, port_pattern: "sensor.p{n}", connectivity_entity: "binary_sensor.c", watched_ports: [2] });
    const watched = [...card.shadowRoot.innerHTML.matchAll(/data-entity="sensor\.p\d"[\s\S]*?style="fill:([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(watched, [COLORS.grey, COLORS.red], state);

    const card2 = new HaSwitchCard();
    card2.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s", connectivity_entity: "binary_sensor.c" });
    card2.hass = { language: "en", states: { "sensor.s": { state, attributes: {} }, "binary_sensor.c": { state: "on", attributes: {} } } };
    assert.equal(card2._statusColor(), COLORS.grey, state);
  }
});

// A card with a fake power toggle and manual timers. click(checked) flips the toggle as ha-switch does and fires `change`.
// Window and document listeners are recorded (`on`), so that Escape and outside clicks can be fired.
function toggleCard({ callService, state = "off", config = {} } = {}) {
  const timers = [];
  const setTimeout = (fn, ms) => timers.push({ fn, ms }) && timers.length;
  const clearTimeout = (id) => {
    if (timers[id - 1]) timers[id - 1].fn = null;
  };
  const on = { keydown: new Set(), click: new Set() };
  const addEventListener = (type, fn) => on[type]?.add(fn);
  const removeEventListener = (type, fn) => on[type]?.delete(fn);
  const document = { documentElement: { lang: "en" }, createElement: () => ({}), addEventListener, removeEventListener };
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"], { setTimeout, clearTimeout, addEventListener, removeEventListener, document });
  const card = new HaSwitchCard();
  const toggle = { checked: false, disabled: false, listeners: [], addEventListener(_, fn) { this.listeners.push(fn); } };
  card.shadowRoot.querySelector = (sel) => (sel === "ha-switch" ? toggle : null);
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", switch_entity: "switch.sw", ...config });
  const hass = (s) => ({ language: "en", states: { "switch.sw": { state: s, attributes: {} } }, callService: callService ?? (() => Promise.resolve()) });
  card.hass = hass(state);
  const click = async (checked) => {
    toggle.checked = checked;
    toggle.listeners.at(-1)({ target: toggle });
    await new Promise((r) => setImmediate(r));
  };
  const runTimers = () => {
    for (const t of timers.splice(0)) t.fn?.();
  };
  return { card, toggle, click, runTimers, timers, on, setState: (s) => (card.hass = hass(s)) };
}

// A click on the element carrying data-action `action` (the confirmation's buttons and backdrop).
const press = (card, action) => {
  const el = { dataset: { action } };
  card._onClick({ composedPath: () => [el], stopPropagation() {} });
};

// Turning the switch off can cut the network Home Assistant runs on: it asks first, turning it on does not.
function powerCard(opts = {}) {
  const calls = [];
  const callService = (domain, service, data) => calls.push([domain, service, data.entity_id]) && Promise.resolve();
  return { calls, ...toggleCard({ callService, state: "on", ...opts }) };
}

test("power toggle: turning off asks for a confirmation at the top of the card, without calling the service", async () => {
  const { card, toggle, click, calls } = powerCard();
  await click(false);
  assert.deepEqual(calls, []);
  assert.equal(toggle.checked, true, "the toggle shows the real state until confirmed");
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<ha-card class="dialog-open">/);
  assert.match(html, /class="backdrop" data-action="confirm_backdrop">\s*<div class="modal" role="dialog"/);
  assert.match(html, /Turn off Switch\?/);
  assert.match(html, /data-action="confirm_cancel">Cancel<\/button>/);
  assert.match(html, /data-action="confirm_ok">Turn off<\/button>/);
  // At the top of the card, not centred; buttons not filled.
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  assert.match(cssRule(HaSwitchCard.styles, ".backdrop"), /align-items: flex-start/);
  assert.match(cssRule(HaSwitchCard.styles, ".modal-actions .btn.primary"), /color-mix\(in srgb, var\(--primary-color, #03a9f4\) 15%, transparent\)/);
});

test("power toggle: turning on calls the service at once, without a confirmation", async () => {
  const { card, click, calls, setState } = powerCard();
  setState("off");
  await click(true);
  assert.deepEqual(calls, [["switch", "turn_on", "switch.sw"]]);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /class="dialog-open"|confirm_ok/);
});

test("power toggle: Turn off in the confirmation calls the service and closes it", async () => {
  const { card, click, calls, on } = powerCard();
  await click(false);
  press(card, "confirm_ok");
  assert.deepEqual(calls, [["switch", "turn_off", "switch.sw"]]);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /confirm_ok/);
  assert.equal(on.keydown.size + on.click.size, 0, "no listener left behind");
});

test("power toggle: Cancel, the backdrop, Escape and a click outside the card close it without calling", async () => {
  const { card, click, calls, on } = powerCard();
  const cancels = [
    () => press(card, "confirm_cancel"),
    () => press(card, "confirm_backdrop"),
    () => [...on.keydown][0]({ key: "Escape", stopPropagation() {} }),
    () => [...on.click][0]({ composedPath: () => [{}] }),
  ];
  for (const cancel of cancels) {
    await click(false);
    assert.match(card.shadowRoot.innerHTML, /confirm_ok/);
    // A click inside the popup (its text) keeps it open.
    card._onClick({ composedPath: () => [{ dataset: {} }, { dataset: { action: "confirm_backdrop" } }], stopPropagation() {} });
    assert.match(card.shadowRoot.innerHTML, /confirm_ok/);
    cancel();
    assert.doesNotMatch(card.shadowRoot.innerHTML, /confirm_ok/);
    assert.equal(on.keydown.size + on.click.size, 0);
  }
  assert.deepEqual(calls, []);
});

test("power toggle: confirm_off: false turns the switch off at once", async () => {
  const { card, click, calls } = powerCard({ config: { confirm_off: false } });
  await click(false);
  assert.deepEqual(calls, [["switch", "turn_off", "switch.sw"]]);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /confirm_ok/);
});

test("power toggle: the confirmation closes when the switch is turned off elsewhere", async () => {
  const { card, click, calls, on, setState } = powerCard();
  await click(false);
  setState("off");
  assert.doesNotMatch(card.shadowRoot.innerHTML, /confirm_ok/);
  assert.equal(on.keydown.size + on.click.size, 0);
  assert.deepEqual(calls, []);
});

test("editor: confirm_off is a toggle shown on by default, kept out of the YAML while on", () => {
  const listeners = {};
  const document = { documentElement: { lang: "en" }, createElement: () => ({ addEventListener: (type, fn) => (listeners[type] = fn) }) };
  const { I18N, HaSwitchCardEditor } = loadCard("ha-switch-card.js", ["I18N", "HaSwitchCardEditor"], {
    document,
    CustomEvent: class {
      constructor(_type, init) {
        this.detail = init.detail;
      }
    },
  });
  const editor = new HaSwitchCardEditor();
  let sent;
  editor.dispatchEvent = (ev) => (sent = ev.detail.config);
  editor.setConfig({ type: "custom:ha-switch-card" });
  editor.hass = { language: "en", states: {} };
  const entities = editor._form.schema.find((s) => s.name === "entities").schema;
  assert.equal(JSON.stringify(entities.find((s) => s.name === "confirm_off").selector), JSON.stringify({ boolean: {} }));
  assert.equal(editor._form.data.confirm_off, true);
  assert.equal(editor._form.computeLabel({ name: "confirm_off" }), I18N.en.fields.confirm_off);
  const change = (value) => listeners["value-changed"]({ stopPropagation() {}, detail: { value } });
  change({ type: "custom:ha-switch-card", confirm_off: true });
  assert.deepEqual({ ...sent }, { type: "custom:ha-switch-card" });
  change({ type: "custom:ha-switch-card", confirm_off: false });
  assert.deepEqual({ ...sent }, { type: "custom:ha-switch-card", confirm_off: false });
  editor.setConfig(sent);
  assert.equal(editor._form.data.confirm_off, false);
});

test("a failed power toggle call redraws the toggle from the real state at once", async () => {
  const { toggle, click } = toggleCard({ callService: () => Promise.reject(new Error("x")) });
  await click(true);
  assert.equal(toggle.checked, false);
});

test("a successful power toggle call does not bounce the toggle back before the new state arrives", async () => {
  // MQTT, cloud or polled SNMP switches report their new state after the service call has returned.
  const { toggle, click, runTimers, setState } = toggleCard();
  await click(true);
  assert.equal(toggle.checked, true, "no redraw from the old state right after the call");
  setState("on");
  assert.equal(toggle.checked, true);
  runTimers();
  assert.equal(toggle.checked, true, "state changed: no forced redraw");
});

test("a successful power toggle call on a switch that keeps its state is redrawn after a delay", async () => {
  const { card, toggle, click, runTimers, timers } = toggleCard();
  await click(true);
  assert.equal(toggle.checked, true);
  assert.ok(timers.some((t) => t.ms >= 1000), "a delayed check is scheduled");
  // An attribute-only update keeps the render key: the toggle would stay flipped without the delayed redraw.
  card.hass = { ...card._hass, states: { "switch.sw": { state: "off", attributes: { x: 1 } } } };
  runTimers();
  assert.equal(toggle.checked, false);
});

test("a second toggle click replaces the pending delayed check", async () => {
  const { toggle, click, runTimers, timers } = toggleCard({ config: { confirm_off: false } });
  await click(true);
  await click(false);
  assert.equal(timers.filter((t) => t.fn).length, 1);
  runTimers();
  assert.equal(toggle.checked, false);
});

test("language option overrides the Home Assistant language; default helper separator per language", () => {
  const { HaSwitchCard, HaSwitchCardEditor } = loadCard("ha-switch-card.js", ["HaSwitchCard", "HaSwitchCardEditor"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s", language: "fr" });
  card.hass = { language: "en", states: { "sensor.s": { state: "idle", attributes: {} } } };
  assert.match(card.shadowRoot.innerHTML, />Inactif</);

  const helper = (language, config = { type: "custom:ha-switch-card" }) => {
    const editor = new HaSwitchCardEditor();
    editor.setConfig(config);
    editor.hass = { language, states: {} };
    return editor._form.computeHelper({ name: "ports" });
  };
  assert.equal(helper("en"), "Default: 8");
  assert.equal(helper("de"), "Standard: 8");
  assert.equal(helper("es"), "Predeterminado: 8");
  assert.equal(helper("fr"), "Défaut : 8");
  assert.equal(helper("sr"), "Подразумевано: 8");
  assert.equal(helper("sr-Latn"), "Podrazumevano: 8");
  assert.equal(helper("it"), "Predefinito: 8");
  assert.equal(helper("nl"), "Standaard: 8");
  assert.equal(helper("pt"), "Predefinição: 8");
  assert.equal(helper("pl"), "Domyślnie: 8");
  assert.equal(helper("ru"), "По умолчанию: 8");
  assert.equal(helper("hu"), "Alapértelmezett: 8");
  assert.equal(helper("el"), "Προεπιλογή: 8");
  assert.equal(helper("en", { language: "fr" }), "Défaut : 8");
});

test("non-numeric port overlay positions fall back to their defaults and are reported", () => {
  const { HaSwitchCard, configWarnings } = loadCard("ha-switch-card.js", ["HaSwitchCard", "configWarnings"]);
  const config = { ports: 2, port_pattern: "sensor.p{n}", image: "/local/x.png", port_start: "abc", port_step: "x", port_bottom: "y" };
  const card = new HaSwitchCard();
  card.setConfig(config);
  card.hass = { language: "en", states: {} };
  const html = card.shadowRoot.innerHTML;
  assert.doesNotMatch(html, /NaN/);
  assert.match(html, /left:21%/);
  assert.match(html, /left:31%/);
  assert.match(html, /bottom:39%/);
  assert.equal(configWarnings(config).length, 3);
  assert.equal(configWarnings({ ...config, port_start: 5, port_step: "2.5", port_bottom: 0 }).length, 0);
});

test("the status pill sits on the title line, right of the name; other chips stay under the header", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const states = {
    "sensor.s": { state: "Online", attributes: {} },
    "binary_sensor.c": { state: "on", attributes: {} },
    "sensor.up": { state: "100", attributes: {} },
  };
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s", connectivity_entity: "binary_sensor.c", uptime_entity: "sensor.up" });
  card.hass = { language: "en", states };
  const html = card.shadowRoot.innerHTML;
  const [header, body] = html.split('<div class="chips">');
  assert.match(header, /<div class="title-row"><div class="name">Switch<\/div><div class="chip"[^>]*data-entity="sensor\.s"/);
  assert.match(body, /data-entity="binary_sensor\.c"/);
  assert.match(body, /data-entity="sensor\.up"/);
  assert.doesNotMatch(body, /data-entity="sensor\.s"/);
  // Without a status sensor, connectivity is the header pill.
  const card2 = new HaSwitchCard();
  card2.setConfig({ ports: 1, port_pattern: "sensor.p{n}", connectivity_entity: "binary_sensor.c" });
  card2.hass = { language: "en", states };
  assert.match(card2.shadowRoot.innerHTML, /<div class="title-row"><div class="name">Switch<\/div><div class="chip"[^>]*data-entity="binary_sensor\.c"/);
  assert.doesNotMatch(card2.shadowRoot.innerHTML, /class="chips"/);
});

test("a configured status_entity missing from Home Assistant is grey with a question mark, not the connectivity colour", () => {
  const { HaSwitchCard, COLORS } = loadCard("ha-switch-card.js", ["HaSwitchCard", "COLORS"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.renamed", connectivity_entity: "binary_sensor.c" });
  const hass = { language: "en", states: { "binary_sensor.c": { state: "on", attributes: {} } } };
  card.hass = hass;
  assert.equal(card._statusColor(), COLORS.grey);
  const html = card.shadowRoot.innerHTML;
  const pill = html.match(/<div class="title-row">[\s\S]*?<\/div>\s*<\/div>/)[0];
  assert.match(pill, /mdi:help-circle/);
  assert.doesNotMatch(pill, /mdi:alert-circle/);
  assert.ok(html.includes(`class="ic big" style="--c:${COLORS.grey}"`), "header icon grey");
  // Without a status_entity, connectivity still drives the colour.
  const card2 = new HaSwitchCard();
  card2.setConfig({ ports: 1, port_pattern: "sensor.p{n}", connectivity_entity: "binary_sensor.c" });
  card2.hass = hass;
  assert.equal(card2._statusColor(), COLORS.green);
});

test("an empty or non-text port_pattern in YAML does not break the card", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  // `port_pattern:` with no value is null in YAML: the default pattern is used.
  const card = new HaSwitchCard();
  card.setConfig({ ports: 2, port_pattern: null });
  assert.deepEqual([...card._watched()], ["sensor.switch_port_1_status", "sensor.switch_port_2_status"]);
  // A number is used as text, like the editor would store it.
  const card2 = new HaSwitchCard();
  card2.setConfig({ ports: 1, port_pattern: 5 });
  assert.deepEqual([...card2._watched()], ["5"]);
});

test("other empty YAML keys fall back to their defaults too", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", name: null, icon: null, model: null });
  assert.equal(card._config.name, "Switch");
  assert.equal(card._config.icon, "mdi:switch");
  assert.equal(card._config.model, "generic");
  card.hass = { language: "en", states: { "sensor.p1": { state: "1" } } };
  assert.match(card.shadowRoot.innerHTML, /Switch/);
});

test("I18N: every editor section label is shown by the editor (no orphan section keys)", () => {
  const { I18N, HaSwitchCardEditor } = loadCard("ha-switch-card.js", ["I18N", "HaSwitchCardEditor"]);
  for (const lang of ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"]) {
    const t = I18N[lang];
    const titles = new HaSwitchCardEditor()._schema(t).filter((s) => s.type === "expandable").map((s) => s.title);
    for (const [key, label] of Object.entries(t.sections)) {
      assert.ok(titles.includes(label), `${lang}.sections.${key} is never shown`);
    }
    // Each expandable section has its own label.
    assert.equal(new Set(titles).size, titles.length, lang);
  }
});

test("language resolution: full code if it has a dictionary, else its base language, else English", () => {
  const { getLang } = loadCard("ha-switch-card.js", ["getLang"]);
  const cases = [["fr-FR", "fr"], ["sr-Latn", "sr-Latn"], ["sr", "sr"], ["de", "de"], ["en-GB", "en"]];
  // Italian, Dutch, Portuguese (European, also picked for pt-BR) and Polish; unknown languages fall back to English.
  cases.push(["it-IT", "it"], ["nl-BE", "nl"], ["pt", "pt"], ["pt-BR", "pt"], ["pl-PL", "pl"], ["ja", "en"]);
  cases.push(["ro-RO", "ro"], ["da", "da"], ["sv-SE", "sv"], ["bg", "bg"], ["ru-RU", "ru"], ["uk", "uk"], ["hu", "hu"]);
  cases.push(["sk", "sk"], ["cs-CZ", "cs"], ["sl", "sl"], ["lv-LV", "lv"], ["el-GR", "el"]);
  for (const [language, want] of cases) {
    assert.equal(getLang({ language }), want, `hass.language ${language}`);
    assert.equal(getLang({ language: "en", locale: { language } }), want, `hass.locale.language ${language}`);
    assert.equal(getLang({ language: "en" }, { language }), want, `config.language ${language}`);
  }
  // The card option still wins over Home Assistant, and the locale over hass.language.
  assert.equal(getLang({ language: "sr-Latn", locale: { language: "sr-Latn" } }, { language: "fr" }), "fr");
  assert.equal(getLang({ language: "en", locale: { language: "sr-Latn" } }), "sr-Latn");
});

test("I18N: the editor offers every language of the dictionary, Serbian in both scripts", () => {
  const { I18N, HaSwitchCardEditor } = loadCard("ha-switch-card.js", ["I18N", "HaSwitchCardEditor"]);
  const find = (schema) => {
    for (const s of schema) {
      if (s.name === "language") return s;
      const inner = s.schema && find(s.schema);
      if (inner) return inner;
    }
  };
  const options = find(new HaSwitchCardEditor()._schema(I18N.en)).selector.select.options;
  assert.deepEqual([...options.map((o) => o.value).filter(Boolean)].sort(), [...Object.keys(I18N)].sort());
  assert.equal(options.find((o) => o.value === "sr").label, "Српски");
  assert.equal(options.find((o) => o.value === "sr-Latn").label, "Srpski (latinica)");
  const labels = [["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"]];
  labels.push(["ro", "Română"], ["da", "Dansk"], ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"]);
  labels.push(["sk", "Slovenčina"], ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"]);
  for (const [value, label] of labels) {
    assert.equal(options.find((o) => o.value === value)?.label, label, value);
  }
});

test("I18N: sr is written in Cyrillic and sr-Latn in Latin (acronyms and units aside)", () => {
  const { I18N } = loadCard("ha-switch-card.js", ["I18N"]);
  const flat = (o) => Object.values(o).flatMap((v) => (v && typeof v === "object" ? flat(v) : [String(v)]));
  // Allowed Latin in sr: acronyms (URL, SNMP) and placeholders. The uptime units are Cyrillic too.
  const strip = (s) => s.replace(/\{\w+\}|\bURL\b|\bSNMP\b/g, "");
  for (const v of flat(I18N.sr)) assert.doesNotMatch(strip(v), /[A-Za-z]/, `sr: ${v}`);
  for (const v of flat(I18N["sr-Latn"])) assert.doesNotMatch(v, /[\u0400-\u04FF]/, `sr-Latn: ${v}`);
});

const cssRule = (css, selector) => {
  const m = css.match(new RegExp(`(?:^|\\}|\\*/)\\s*${selector.replace(/[.*+?^${}()|[\]\\>]/g, "\\$&")} \\{([^}]*)\\}`));
  assert.ok(m, `rule ${selector}`);
  return m[1];
};

// Narrow header (6 columns of the Sections view, ~230 px): the status pill used to keep its full width
// ("Niedostępny", "Unavailable") and squeeze the name down to a lone "…". Then (1.8.6 draft) the name took its
// whole text width first (flex-basis auto) and a 50% cap plus a 280px container query cut the pill, or reduced
// it to its icon, on cards up to 304 px wide, where its whole text fits.
test("narrow header: the name gives way to the pill down to a few characters, then the pill wraps under it", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const css = HaSwitchCard.styles.replace(/\s+/g, " ");
  const rule = (selector) => cssRule(css, selector);
  const name = rule(".title-row > .name");
  assert.match(name, /flex: 1 1 0[;\s]/);
  assert.match(name, /min-width: (?:[4-9]|\d{2,})(?:\.\d+)?ch/);
  const pill = rule(".title-row > .chip");
  assert.match(pill, /flex: 0 1 auto/);
  assert.match(pill, /min-width: 0/);
  assert.match(pill, /overflow: hidden/);
  // No cap: the pill is only cut when it does not fit even on a line of its own.
  assert.doesNotMatch(pill, /max-width/);
  assert.match(rule(".title-row"), /flex-wrap: wrap/);
  assert.match(rule(".titles"), /flex: 1 1 0[;\s]/);
  const text = rule(".chip span");
  assert.match(text, /min-width: 0/);
  assert.match(text, /text-overflow: ellipsis/);
  assert.match(text, /white-space: nowrap/);
  assert.match(rule(".title-row > .chip ha-icon"), /flex: none/);
  assert.match(rule("ha-switch"), /flex: none/);
  assert.match(rule(".ic"), /flex: none/);
  // No size container: inline-size containment drops the element's intrinsic width, which collapses a card
  // placed in a shrink-to-fit parent (inline-block, a grid "auto" column, layout-card, button-card).
  // Only the mini card is one (ha-card.mini), with a minimum width from its host for such parents.
  assert.doesNotMatch(css.replace(/ha-card\.mini \{[^}]*\}/, ""), /container-type|container:/);
  assert.doesNotMatch(cssRule(css, "ha-card"), /container/);
  assert.match(cssRule(css, ":host([mini])::before"), /grid-template-columns: minmax\(0, 240px\)/);
});

// pl / sr-Latn traffic labels ("Ruch przychodzący", "Dolazni saobraćaj") were cut to "Ruch przychod…" in the two
// 140px tiles of a 320 px card, and "Eingehender Datenverkehr" (de) at most widths.
test("traffic tile labels wrap instead of being cut", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const k = cssRule(HaSwitchCard.styles.replace(/\s+/g, " "), ".tile .k");
  assert.doesNotMatch(k, /nowrap|ellipsis/);
  assert.match(k, /overflow-wrap: anywhere/);
});

// Focus restored after a redraw must not scroll the dashboard: a state change while a port has the focus
// would otherwise jump the view back to the card.
test("the focus is restored after a redraw without scrolling", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 2, port_pattern: "sensor.p{n}" });
  card.hass = { language: "en", states: { "sensor.p1": { state: "1", attributes: {} } } };
  const attrs = { class: "port", "data-entity": "sensor.p1", tabindex: "0" };
  const el = (calls) => ({ getAttribute: (n) => attrs[n] ?? null, focus: (...a) => calls.push(a) });
  const calls = [];
  card.shadowRoot.activeElement = el([]);
  card.shadowRoot.querySelectorAll = () => [el(calls)];
  card.hass = { language: "en", states: { "sensor.p1": { state: "2", attributes: {} } } };
  assert.equal(calls.length, 1, "focus restored once");
  // The card runs in its own realm (vm): compare by value.
  assert.equal(JSON.stringify(calls[0]), JSON.stringify([{ preventScroll: true }]));
});

test("the status pill carries its full text in title and aria-label, so a truncated or icon-only pill stays readable", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", status_entity: "sensor.s", language: "pl" });
  card.hass = { language: "en", states: { "sensor.s": { state: "unavailable", attributes: {} } }, formatEntityState: () => "Niedostępny" };
  const pill = card.shadowRoot.innerHTML.match(/<div class="title-row">.*?<div class="chip"([^>]*)>/s)[1];
  // The ports up out of all follow the status.
  assert.match(pill, /title="Niedostępny · 0\/1"/);
  assert.match(pill, /aria-label="Niedostępny · 0\/1"/);
  // Escaped like the visible text.
  card.hass = { language: "en", states: { "sensor.s": { state: "x", attributes: {} } }, formatEntityState: () => `a"<b` };
  assert.match(card.shadowRoot.innerHTML, /title="a&quot;&lt;b · 0\/1"/);
});

// sr (Cyrillic) showed "12d 16h 15min" in the middle of a Cyrillic card.
test("uptime units follow the card language (Cyrillic in sr), every language has them", () => {
  const { HaSwitchCard, I18N } = loadCard("ha-switch-card.js", ["HaSwitchCard", "I18N"]);
  const uptime = (language, state, unit) => {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", uptime_entity: "sensor.up", language, ...(unit ? { uptime_unit: unit } : {}) });
    const states = state === undefined ? {} : { "sensor.up": { state, attributes: {} } };
    card.hass = { language: "en", states, formatEntityState: (st) => (st.state === "unavailable" ? "Недоступно" : st.state) };
    return card.shadowRoot.innerHTML.match(/data-entity="sensor\.up"[^>]*>\s*<ha-icon[^>]*><\/ha-icon><span>([^<]*)<\/span>/)[1];
  };
  // 12 d 16 h 15 min, in SNMP timeticks.
  assert.equal(uptime("sr", "109530000"), "12д 16ч 15мин");
  assert.equal(uptime("sr-Latn", "109530000"), "12d 16h 15min");
  assert.equal(uptime("en", "109530000"), "12d 16h 15min");
  assert.equal(uptime("fr", "109530000"), "12j 16h 15min");
  // Under a day: no day part; seconds unit.
  assert.equal(uptime("sr", "3720", "seconds"), "1ч 2мин");
  // Unavailable: Home Assistant's translated state, never "NaN" or a duration; missing entity: a dash.
  assert.equal(uptime("sr", "unavailable"), "Недоступно");
  assert.equal(uptime("sr", undefined), "—");
  for (const [lang, t] of Object.entries(I18N)) for (const k of ["day", "hour", "minute"]) assert.ok(t[k], `${lang}.${k}`);
});

// A Sections view section is 320 px wide at its narrowest: 6 of its 12 columns (~155 px) left the name and the
// status pill under the power toggle. 8 columns (~210 px) keep the icon, about four characters of the name,
// the icon-only pill and the toggle side by side.
test("getGridOptions: the card cannot be made narrower than 8 columns", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const o = new HaSwitchCard().getGridOptions();
  assert.equal(o.columns, 12);
  assert.equal(o.min_columns, 8);
});

const portsHass = (extra = {}) => ({
  language: "en",
  states: {
    "sensor.p1": { state: "1", attributes: {} },
    "sensor.p2": { state: "2", attributes: {} },
    "sensor.p3": { state: "1", attributes: {} },
    "sensor.s": { state: "Online", attributes: {} },
    ...extra,
  },
});

test("port names: shortened under the drawn port, whole in its tooltip; a list or a map", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  for (const port_names of [["NAS", "", "Living room AP"], { 1: "NAS", 3: "Living room AP" }]) {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 3, port_pattern: "sensor.p{n}", port_names });
    card.hass = portsHass();
    const html = card.shadowRoot.innerHTML;
    assert.match(html, /<title>Port 1 · NAS<\/title>/);
    assert.match(html, /<title>Port 2<\/title>/);
    assert.match(html, /<title>Port 3 · Living room AP<\/title>/);
    assert.match(html, /class="hs-label">NAS<\/text>/);
    assert.match(html, /class="hs-label">2<\/text>/);
    assert.match(html, /class="hs-label">Living…<\/text>/);
  }
});

test("status pill: followed by the ports up out of all", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 3, port_pattern: "sensor.p{n}", status_entity: "sensor.s" });
  card.hass = portsHass();
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /title="Online · 2\/3"/);
  assert.match(html, /<span>Online<\/span><span class="cnt" data-n="2\/3">· 2\/3<\/span>/);
});

test("watched_ports: a list, or a text such as \"1, 3\"", () => {
  const { watchedPorts } = loadCard("ha-switch-card.js", ["watchedPorts"]);
  assert.deepEqual([...watchedPorts({ watched_ports: [1, "3"] })], [1, 3]);
  assert.deepEqual([...watchedPorts({ watched_ports: "1, 3;8" })], [1, 3, 8]);
  assert.deepEqual([...watchedPorts({})], []);
});

test("drawn front panels have 1px corners and are not clipped; a custom image keeps its rounded frame", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const css = HaSwitchCard.styles.replace(/\s+/g, " ");
  assert.doesNotMatch(cssRule(css, ".device"), /border-radius|overflow/);
  assert.match(cssRule(css, ".device.img"), /border-radius: 10px; overflow: hidden/);
  for (const model of ["generic", "gs308t"]) {
    const card = new HaSwitchCard();
    card.setConfig({ ports: 3, port_pattern: "sensor.p{n}", model });
    card.hass = portsHass();
    assert.match(card.shadowRoot.innerHTML, /<rect x="\d+" y="\d+" width="\d+" height="\d+" rx="1" fill="url\(#(hs|ng)-body\)"/, model);
  }
});

test("traffic: a byte counter shows its rate from two states, with its total; a counter going down is skipped", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", traffic_in_entity: "sensor.in", show_history: false });
  const at = (v, s) => ({ ...portsHass(), states: { "sensor.in": { state: String(v), attributes: { unit_of_measurement: "B" }, last_updated: `2026-11-07T10:00:${s}Z` } } });
  card.hass = at(1000, "00");
  assert.match(card.shadowRoot.innerHTML, /class="v">—<\/div><div class="t">Total 1000 B<\/div>/);
  card.hass = at(1000 + 30 * 2048, "30");
  assert.match(card.shadowRoot.innerHTML, /class="v">2.0 KB\/s<\/div>/);
  // A reset: no negative rate, the last one stays.
  card.hass = at(10, "40");
  assert.match(card.shadowRoot.innerHTML, /class="v">2.0 KB\/s<\/div>/);
  // A sensor already in a rate unit is shown as Home Assistant formats it.
  card.hass = { ...portsHass(), states: { "sensor.in": { state: "12", attributes: { unit_of_measurement: "Mbit/s" } } }, formatEntityState: () => "12 Mbit/s" };
  assert.match(card.shadowRoot.innerHTML, /class="v">12 Mbit\/s<\/div>/);
});

test("traffic history: 24 h of 5-minute statistics, a counter's change as a rate; the latest bucket until two states", async () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  const calls = [];
  const card = new HaSwitchCard();
  card.setConfig({ ports: 1, port_pattern: "sensor.p{n}", traffic_in_entity: "sensor.in" });
  card.hass = {
    ...portsHass(),
    states: { "sensor.in": { state: "5000", attributes: { unit_of_measurement: "B" } } },
    callWS: async (msg) => {
      calls.push(msg);
      return { "sensor.in": [{ change: 3000 }, { change: 6000 }] };
    },
  };
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "recorder/statistics_during_period");
  assert.equal(calls[0].period, "5minute");
  await new Promise((r) => setImmediate(r));
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /<svg class="spark"/);
  // 6000 B in 5 minutes: 20 B/s until the sensor changes twice.
  assert.match(html, /class="v">20 B\/s<\/div>/);
});

test("mini card: compact front panel and rates, no power toggle; the detail button switches to the full card", () => {
  const { HaSwitchMiniCard } = loadCard("ha-switch-card.js", ["HaSwitchMiniCard"]);
  const card = new HaSwitchMiniCard();
  card.setConfig({ ports: 3, port_pattern: "sensor.p{n}", status_entity: "sensor.s", switch_entity: "switch.sw", traffic_in_entity: "sensor.in", uptime_entity: "sensor.up" });
  card.hass = portsHass({ "switch.sw": { state: "on", attributes: {} }, "sensor.in": { state: "5", attributes: { unit_of_measurement: "Mbit/s" } }, "sensor.up": { state: "100", attributes: {} } });
  let html = card.shadowRoot.innerHTML;
  assert.match(html, /<ha-card class="mini">/);
  assert.match(html, /<div class="mb"><div class="device"/);
  assert.match(html, /class="rt" style="[^"]*" data-entity="sensor\.in"/);
  assert.match(html, /<button class="zoom" title="Show the full card"/);
  assert.doesNotMatch(html, /<ha-switch>|class="chips"|class="traffic"/);
  assert.deepEqual({ ...card.getGridOptions() }, { columns: 6, min_columns: 6 });
  card._onClick({ composedPath: () => [{ classList: { contains: (c) => c === "zoom" } }], stopPropagation() {}, detail: 1 });
  html = card.shadowRoot.innerHTML;
  assert.match(html, /<ha-card class="">/);
  assert.match(html, /<ha-switch><\/ha-switch><button class="zoom" title="Back to the compact view"/);
  assert.match(html, /class="chips"/);
  assert.equal(card.getGridOptions().min_columns, 8);
  card.setConfig({ ports: 3, port_pattern: "sensor.p{n}", zoom: false });
  assert.doesNotMatch(card.shadowRoot.innerHTML, /class="zoom"/);
});

test("mini card: the header icon keeps the full card's size", () => {
  const { HaSwitchCard } = loadCard("ha-switch-card.js", ["HaSwitchCard"]);
  assert.doesNotMatch(HaSwitchCard.styles, /ha-card\.mini \.ic/);
});
