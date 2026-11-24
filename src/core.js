/**
 * ha-switch-card — custom Lovelace card for Home Assistant
 * Displays a managed network switch (SNMP): status, uptime, port states, traffic.
 * Pure JavaScript, no dependencies (no mushroom / card-mod / button-card required).
 */
import { pickerDefine } from "./card-picker.js";
import { I18N } from "./i18n/i18n.js";

export const VERSION = '__VERSION__';


export const DEFAULTS = {
  name: 'Switch',
  icon: 'mdi:switch',
  ports: 8,
  port_pattern: 'sensor.switch_port_{n}_status',
  port_on_state: '1',
  uptime_unit: 'timeticks',
  model: 'generic',
  port_start: 21,
  port_step: 10,
  port_bottom: 39,
};

// Values of `status_entity` meaning online / idle when `online_state` / `idle_state` are not set: the English
// and French ones (1.x defaulted to the French `En ligne` / `Inactif`, which still match). Compared case-insensitively.
export const STATUS_DEFAULTS = {
  online_state: ['Online', 'En ligne'],
  idle_state: ['Idle', 'Inactif'],
};

// Whether a status state is the configured `online_state` / `idle_state` (or one of its defaults).
export const statusIs = (state, config, key) => {
  if (state == null) return false;
  const norm = (v) => String(v).trim().toLowerCase();
  const wanted = config[key] != null && config[key] !== '' ? [config[key]] : STATUS_DEFAULTS[key];
  return wanted.some((v) => norm(v) === norm(state));
};

// Theme colors with the Home Assistant defaults as fallbacks, like the other juju35 cards.
export const COLORS = {
  green: 'var(--success-color, #43a047)',
  orange: 'var(--warning-color, #ffa600)',
  red: 'var(--error-color, #db4437)',
  blue: 'var(--info-color, #039be5)',
  grey: 'var(--disabled-text-color, #9e9e9e)',
  neutral: 'var(--secondary-text-color, #727272)',
};

// Darker shade of a port color, for its contacts and LEDs.
export const shade = (color) => `color-mix(in srgb, ${color} 45%, #000)`;

// `language` from the card config wins over the Home Assistant language. The full code when it has its own
// dictionary (`sr-Latn`), else its base language (`fr-FR` → `fr`), else English.
export const getLang = (hass, config) => {
  const l = String(config?.language || hass?.locale?.language || hass?.language || navigator.language || 'en');
  const base = l.split('-')[0];
  return I18N[l] ? l : I18N[base] ? base : 'en';
};

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Admin URLs opened on a tap: only http(s) and same-origin relative paths, never javascript:/data:
// or protocol-relative //evil.com from a YAML config. The browser's URL parser reads `\` as `/` and drops
// tabs and newlines, so `/\evil.com` or `/<tab>/evil.com` would also open evil.com: a relative path with
// any of these characters is rejected.
export const isSafeUrl = (url) => {
  const s = String(url ?? '');
  return /^https?:\/\//i.test(s) || (/^\/(?!\/)/.test(s) && !/[\\\t\n\r]/.test(s));
};

// After a successful power toggle call, how long to wait for the switch to report its new state
// before redrawing the toggle from the unchanged one.
export const TOGGLE_CHECK_MS = 2000;

// After the power-off confirmation closes, clicks on the card are ignored for this long: the second click of a
// double click on Turn off would otherwise land on what lies under the button (a port, opening its more-info).
export const CONFIRM_GUARD_MS = 400;

// An entity Home Assistant has no value for: drawn grey (state unknown), not red (off / down).
export const isUnavailable = (st) => st?.state === 'unavailable' || st?.state === 'unknown';

// A config number (port overlay position), or its default when the YAML value is not a number.
export const num = (v, def) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : def);

// Locale for Intl: Home Assistant's full locale when its base matches the card's language (keeps the region, e.g.
// de-CH), otherwise the card's language. Home Assistant's "pt" is European Portuguese, which Intl would format as
// Brazilian, so bare "pt" becomes "pt-PT".
export const fmtLang = (hass, config) => {
  const l = getLang(hass, config);
  const ha = hass?.locale?.language || hass?.language;
  const loc = ha && ha.split('-')[0] === l.split('-')[0] && l !== 'sr-Latn' ? ha : l;
  return loc === 'pt' ? 'pt-PT' : loc;
};

// The number formats, made once per language, decimals and kind (a render formats many numbers).
export const _numFormats = new Map();
export const numFormat = (loc, min, max) => {
  const key = `${loc}|${min}|${max}`;
  let f = _numFormats.get(key);
  if (!f) _numFormats.set(key, (f = new Intl.NumberFormat(loc, { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: false })));
  return f;
};

// A number with exactly `d` decimals, with the decimal separator of `loc` (no grouping, as before).
export const fmtNum = (v, d, loc) => {
  try {
    return numFormat(loc, d, d).format(v);
  } catch {
    return v.toFixed(d);
  }
};

// Sizes in powers of 1024 with binary prefixes; up to 2 decimals under 10, 1 under 100, none above (trailing zeros
// dropped: "1.5 KiB", "20 GiB"), as in the system-monitor and docker cards.
export const fmtNumMax = (v, d, loc) => {
  try {
    return numFormat(loc, 0, d).format(v);
  } catch {
    return String(Number(v.toFixed(d)));
  }
};
export const formatBytes = (v, loc = 'en') => {
  if (!Number.isFinite(v)) return '—';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${fmtNumMax(v, i === 0 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2, loc)} ${units[i]}`;
};

// Uptime as "12d 16h 15min", with the unit letters of the card language (day / hour / minute of its I18N entry).
// A number is SNMP timeticks or seconds (`unit`); a date (a timestamp sensor: the boot time) gives now − boot.
export const formatUptime = (raw, unit, u = { day: 'd', hour: 'h', minute: 'min' }) => {
  const s = String(raw ?? '').trim();
  let t;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = parseInt(s, 10);
    t = unit === 'seconds' ? n : Math.floor(n / 100);
  } else {
    const boot = Date.parse(s);
    if (!Number.isFinite(boot)) return '—';
    t = Math.max(0, Math.floor((Date.now() - boot) / 1000));
  }
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${d > 0 ? `${d}${u.day} ` : ''}${h}${u.hour} ${m}${u.minute}`;
};

// Byte counters (an SNMP ifInOctets sensor): their unit's size in bytes. A traffic sensor in one of these units is a
// running total, from which the card computes a rate; any other unit (kB/s, Mbit/s…) is already a rate.
export const BYTE_UNITS = { B: 1, bytes: 1, octets: 1, o: 1, kB: 1e3, KB: 1024, KiB: 1024, MB: 1e6, MiB: 1048576, GB: 1e9, GiB: 1073741824 };
// A rate with three significant digits at most ("3.2 MB/s", "584 KB/s"), so it fits beside the mini card's panel.
// Rates in powers of 1000 ("3.2 MB/s", "584 kB/s"): 1 decimal under 100, none above, as in the other cards.
export const formatRate = (bps, loc = 'en') => {
  if (!Number.isFinite(bps)) return '—';
  const units = ['B/s', 'kB/s', 'MB/s', 'GB/s', 'TB/s'];
  let v = bps;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  return `${fmtNumMax(v, i === 0 || v >= 100 ? 0 : 1, loc)} ${units[i]}`;
};

// Ports whose loss of link is an alarm (red): `watched_ports` as a list (YAML or the editor) or "1, 3, 8".
export const watchedPorts = (c) =>
  new Set((Array.isArray(c.watched_ports) ? c.watched_ports : String(c.watched_ports ?? '').split(/[\s,;]+/)).map((n) => parseInt(n, 10)).filter(Number.isFinite));

// The name given to a port: `port_names` as a list in port order (YAML or the editor) or a map { 3: NAS }.
export const portName = (c, n) => {
  const names = c.port_names;
  const v = Array.isArray(names) ? names[n - 1] : names && typeof names === 'object' ? names[n] : undefined;
  return v == null ? '' : String(v).trim();
};
// Under a drawn port, its name fits in about 7 characters: shortened with an ellipsis beyond (the tooltip has it whole).
export const shortName = (name) => (name.length > 7 ? `${name.slice(0, 6)}…` : name);

// 24 h curve of a series (rates) of { t, v } points (t in ms, the 5-minute bucket's start), scaled from 0 to its
// peak, on a real time axis ending at `end`: where buckets are missing (more than two periods apart) the curve
// breaks instead of joining across the hole. Nothing under two points.
export const HIST_REFRESH = 5 * 60000;
export const HIST_WINDOW = 864e5;
export const HIST_PERIOD = 300000;
export const spark = (points, end) => {
  const start = end - HIST_WINDOW;
  const pts = (points || []).filter((p) => p.t >= start && p.t <= end);
  if (pts.length < 2) return '';
  const peak = Math.max(...pts.map((p) => p.v)) || 1;
  const x = (t) => (((t - start) / HIST_WINDOW) * 100).toFixed(2);
  const y = (v) => (30 - (Math.max(0, v) / peak) * 28).toFixed(2);
  const runs = [];
  pts.forEach((p, i) => {
    if (!i || p.t - pts[i - 1].t > 2 * HIST_PERIOD) runs.push([]);
    runs.at(-1).push(p);
  });
  // A lone bucket between two holes is drawn over its own 5 minutes.
  const segs = runs.map((run) => (run.length > 1 ? run : [...run, { t: Math.min(end, run[0].t + HIST_PERIOD), v: run[0].v }]));
  const xy = (run) => run.map((p) => `${x(p.t)},${y(p.v)}`).join('L');
  const line = segs.map((run) => `M${xy(run)}`).join('');
  const area = segs.map((run) => `M${x(run[0].t)},30L${xy(run)}L${x(run.at(-1).t)},30Z`).join('');
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="spark-a" d="${area}"/><path class="spark-l" d="${line}"/></svg>`;
};

export const portSvg = (color, dark) => `
  <svg viewBox="0 0 27 25" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="25" height="20" rx="2" style="fill:${color}"/>
    <rect x="10" y="1" width="6" height="5" rx="1" style="fill:${color}"/>
    ${[4, 8, 12, 16].map((x) => `<rect x="${x}" y="8" width="2" height="10" rx="0.5" style="fill:${dark}" opacity="0.6"/>`).join('')}
  </svg>`;

/**
 * Netgear GS308T (S350) front panel, drawn as SVG: black chassis, power LED and reset on the left,
 * two groups of four ports in a silver bezel, each port with its link LED at the top-left corner.
 * The ports and LEDs are laid out on one grid, so they always line up whatever the card width.
 */
// A port's tooltip: "Port 3", or "Port 3 · NAS" when it has a name.
export const portTitle = (portLabel, p) => `${portLabel} ${p.n}${p.name ? ` · ${p.name}` : ''}`;

export const GS308T = { H: 150, CELL: 62, GAP: 8, GROUP_GAP: 16, X0: 150, BEZEL_Y: 38, PORT_Y: 52, PORT_H: 44 };
export const gs308tSvg = (ports, powerColor, portLabel) => {
  const g = GS308T;
  const portX = (i) => g.X0 + i * (g.CELL + g.GAP) + (i >= 4 ? g.GROUP_GAP : 0);
  const groupW = 4 * g.CELL + 3 * g.GAP;
  const right = portX(7) + g.CELL + 8; // right edge of the second bezel
  const W = right + 18;
  const bezel = [0, 4]
    .map((i) => `<rect x="${portX(i) - 8}" y="${g.BEZEL_Y}" width="${groupW + 16}" height="${g.PORT_Y + g.PORT_H + 8 - g.BEZEL_Y}" rx="3" fill="url(#ng-bezel)"/>`)
    .join('');
  const slots = Array.from({ length: 8 }, (_, i) => {
    const p = ports[i];
    const [col, dark] = p ? p.colors : [COLORS.grey, '#555'];
    const led = !p || col === COLORS.grey ? '#5f6368' : col === COLORS.green ? COLORS.green : '#2a2b2e';
    const x = portX(i);
    const y = g.PORT_Y;
    const cx = x + g.CELL / 2;
    const contacts = Array.from({ length: 8 }, (_, k) => `<rect x="${cx - 15 + k * 4}" y="${y + 16}" width="2" height="12" style="fill:${dark}" opacity="0.8"/>`).join('');
    const body = `
          <rect x="${x}" y="${y}" width="${g.CELL}" height="${g.PORT_H}" rx="2" fill="#0d0e10"/>
          <path d="M${x + 6} ${y + 6} h${g.CELL - 12} v${g.PORT_H - 16} h-16 v6 h-${g.CELL - 44} v-6 h-16 z" style="fill:${col}"/>
          ${contacts}
          <rect x="${x + 3}" y="${g.BEZEL_Y + 4}" width="12" height="6" rx="1" style="fill:${led}"/>
          ${led === COLORS.green ? `<rect x="${x + 1}" y="${g.BEZEL_Y + 2}" width="16" height="10" rx="2" style="fill:${led}" opacity="0.3"/>` : ''}
          <text x="${cx}" y="${g.PORT_Y + g.PORT_H + 30}" text-anchor="middle" font-size="13" fill="#d6d6d6">${esc(p?.label ?? i + 1)}</text>`;
    return p
      ? `<g class="port" data-entity="${esc(p.id)}" role="button" tabindex="0"><title>${esc(portTitle(portLabel, p))}</title>${body}</g>`
      : `<g>${body}</g>`;
  }).join('');
  return `
    <svg viewBox="0 0 ${W} ${g.H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Netgear GS308T">
      <defs>
        <linearGradient id="ng-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2b2c2f"/><stop offset=".12" stop-color="#1b1c1e"/><stop offset="1" stop-color="#141517"/>
        </linearGradient>
        <linearGradient id="ng-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e4e6e8"/><stop offset="1" stop-color="#a7abb0"/>
        </linearGradient>
      </defs>
      <rect x="18" y="136" width="44" height="10" rx="2" fill="#0b0b0c"/>
      <rect x="${W - 62}" y="136" width="44" height="10" rx="2" fill="#0b0b0c"/>
      <rect x="2" y="4" width="${W - 4}" height="134" rx="1" fill="url(#ng-body)"/>
      <rect x="2" y="4" width="${W - 4}" height="6" rx="1" fill="#ffffff" opacity="0.07"/>
      <text x="26" y="34" font-size="17" font-weight="700" letter-spacing="1.5" fill="#f2f2f2" font-family="Arial, Helvetica, sans-serif">NETGEAR</text>
      <text x="44" y="48" font-size="9" fill="#d0d0d0" font-family="Arial, Helvetica, sans-serif">S350 Series</text>
      <text x="${(g.X0 + right) / 2}" y="28" text-anchor="middle" font-size="10" fill="#e6e6e6" font-family="Arial, Helvetica, sans-serif">Green=1000M, Yellow=100M/10M, Blink=ACT</text>
      <text x="${right}" y="30" text-anchor="end" font-size="17" font-weight="700" fill="#f2f2f2" font-family="Arial, Helvetica, sans-serif">GS308T</text>
      <text x="44" y="80" text-anchor="middle" font-size="9" fill="#d0d0d0" font-family="Arial, Helvetica, sans-serif">Power</text>
      <rect x="35" y="88" width="18" height="8" rx="2" fill="#3a3b3e"/>
      <rect x="37" y="90" width="14" height="4" rx="1" style="fill:${powerColor}"/>
      <rect x="31" y="84" width="26" height="16" rx="4" style="fill:${powerColor}" opacity="0.18"/>
      <text x="100" y="80" text-anchor="middle" font-size="9" fill="#d0d0d0" font-family="Arial, Helvetica, sans-serif">Reset</text>
      <circle cx="100" cy="92" r="4.5" fill="#0b0b0c" stroke="#3a3b3e" stroke-width="1.5"/>
      ${bezel}
      ${slots}
    </svg>`;
};

/**
 * Embedded device models: drawn front panel with a fixed number of ports.
 */
export const MODELS = {
  gs308t: { label: 'Netgear GS308T (S350)', ports: 8, svg: gs308tSvg },
};

/**
 * Built-in front panel of a desktop switch, drawn as SVG.
 * Up to 12 ports on one row; beyond, odd ports on top and even ports below (like real switches).
 */
export const chassisSvg = (ports, powerColor, portLabel) => {
  const rows = ports.length > 12 ? 2 : 1;
  const perRow = Math.ceil(ports.length / rows);
  const PW = 50; // port slot width
  const X0 = 176; // first port slot
  const W = X0 + perRow * PW + 18;
  const H = rows === 1 ? 112 : 172;
  const rowY = rows === 1 ? [30] : [26, 86];

  const vents = Array.from({ length: 6 }, (_, i) =>
    `<rect x="${22 + i * 14}" y="${H / 2 - 22}" width="6" height="44" rx="3" class="hs-vent"/>`
  ).join('');

  const slots = ports
    .map((p, i) => {
      const { id, colors: [col, dark] } = p;
      const row = rows === 2 ? i % 2 : 0;
      const colIdx = rows === 2 ? Math.floor(i / 2) : i;
      const x = X0 + colIdx * PW;
      const y = rowY[row];
      const contacts = [0, 1, 2, 3, 4, 5, 6, 7]
        .map((k) => `<rect x="${x + 8 + k * 3.6}" y="${y + 9}" width="1.8" height="7" style="fill:${dark}" opacity="0.75"/>`)
        .join('');
      const labelY = rows === 2 && row === 0 ? y - 6 : y + 52;
      return `
        <g class="port" data-entity="${esc(id)}" role="button" tabindex="0">
          <title>${esc(portTitle(portLabel, p))}</title>
          <rect x="${x - 2}" y="${y - 2}" width="44" height="40" rx="4" class="hs-slot"/>
          <path d="M${x} ${y + 6} h10 v-6 h20 v6 h10 v28 h-40 z" style="fill:${col}"/>
          ${contacts}
          <rect x="${x + 4}" y="${y + 26}" width="8" height="4" rx="1" style="fill:${dark}" opacity="0.8"/>
          <rect x="${x + 28}" y="${y + 26}" width="8" height="4" rx="1" style="fill:${dark}" opacity="0.8"/>
          <text x="${x + 20}" y="${labelY}" text-anchor="middle" font-size="11" class="hs-label">${esc(p.label)}</text>
        </g>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">
      <defs>
        <linearGradient id="hs-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:var(--hs-body-top)"/>
          <stop offset="1" style="stop-color:var(--hs-body-bottom)"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="1" fill="url(#hs-body)" class="hs-edge" stroke-width="2"/>
      <rect x="6" y="5" width="${W - 12}" height="2" rx="1" fill="#ffffff" opacity="0.08"/>
      ${vents}
      <circle cx="132" cy="${H / 2 - 6}" r="5" style="fill:${powerColor}"/>
      <circle cx="132" cy="${H / 2 - 6}" r="9" style="fill:${powerColor}" opacity="0.25"/>
      <text x="132" y="${H / 2 + 18}" text-anchor="middle" font-size="10" class="hs-label">PWR</text>
      <rect x="156" y="14" width="1.5" height="${H - 28}" class="hs-divider"/>
      ${slots}
    </svg>`;
};

/* ------------------------------------------------------------------ */
/* Illustrated header                                                  */
/* ------------------------------------------------------------------ */
// Night picture: forced by `illustration_theme`, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === 'night') return true;
  if (theme === 'day') return false;
  return !!hass?.themes?.darkMode;
};

// The network background of the header's 200 × 80 scene: a dotted grid on its right side, behind the traffic flow.
export const NET_DOTS = (() => {
  const d = [];
  for (let y = 6; y < 78; y += 6) for (let x = 80; x < 200; x += 6) if ((x * 7 + y * 13) % 11 < 5) d.push(`M${x - 0.9} ${y}a.9 .9 0 1 0 1.8 0a.9 .9 0 1 0-1.8 0`);
  return d.join('');
})();

// The header's traffic flow, in its 200 × 80 scene: one lane per traffic sensor, download (green, right to left) then
// upload (blue, left to right), its rate on its left. Packets run along a lane faster as its rate grows, on a log
// scale from 4.8 s (1 kB/s or less) to 0.6 s (1 GB/s or more), snapped to a few paces that all divide 4.8 s: a small
// change of rate does not restart them, and the README GIFs loop seamlessly. A lane at rest (0, unknown, or the
// switch down) has none.
export const FLOW = { X0: 118, X1: 186, PK: 8, Y: [46, 66] };
export const FLOW_PACES = [0.6, 0.8, 1.2, 1.6, 2.4, 4.8];
export const flowDuration = (bps) => {
  if (!(bps > 0)) return 0;
  const lvl = Math.min(1, Math.max(0, (Math.log10(bps) - 3) / 6));
  const d = 4.8 * (0.6 / 4.8) ** lvl;
  return FLOW_PACES.reduce((best, p) => (Math.abs(Math.log(p / d)) < Math.abs(Math.log(best / d)) ? p : best));
};
export const flowScene = (lanes) =>
  lanes
    .map(({ dir, color, dur, label }, i) => {
      const y = FLOW.Y[i];
      const left = dir === 'in';
      const span = FLOW.X1 - FLOW.X0 - FLOW.PK;
      const x = left ? FLOW.X1 - FLOW.PK : FLOW.X0;
      const pks = dur
        ? [0, 1, 2]
            .map((k) => `<rect class="pk ${left ? 'pk-l' : 'pk-r'}" x="${x}" y="${y - 2.5}" width="${FLOW.PK}" height="5" rx="1" style="fill:${color};--d:${dur}s;--dl:-${((dur * k) / 3).toFixed(2)}s;--o:${left ? '-' : ''}${Math.round((span * k) / 3 + span / 6)}px"/>`)
            .join('')
        : '';
      return `<g class="lane-${dir}"><path class="lane" d="M${FLOW.X0} ${y}H${FLOW.X1}"/>${pks}<text class="fl" x="${FLOW.X0 - 8}" y="${y + 3}" text-anchor="end">${left ? '↓' : '↑'} ${esc(label)}</text></g>`;
    })
    .join('');

export let uidSeq = 0;

// Port count shared by the drawing and the watched entities: 8 when `ports` is not a number.
export function portCount(c) {
  return Math.max(1, Number(c.ports) || 8);
}

// Config mistakes the editor prevents but YAML allows.
// Each message is logged once per page: HA calls setConfig on the preview at every keystroke in the editor.
export const warned = new Set();
export function configWarnings(c) {
  const out = [];
  const count = portCount(c);
  if (count > 1 && !String(c.port_pattern || '').includes('{n}')) out.push('port_pattern has no {n}: every port shows the same entity');
  if (count > 52) out.push(`ports is ${count}, above the 52 the editor allows`);
  const m = !c.image && MODELS[c.model];
  if (m && count > m.ports) out.push(`model ${c.model} draws ${m.ports} ports; ports ${m.ports + 1} to ${count} are not shown`);
  for (const k of ['port_start', 'port_step', 'port_bottom']) {
    if (c[k] != null && num(c[k], null) === null) out.push(`${k} is not a number: the default ${DEFAULTS[k]} is used`);
  }
  return out;
}

// Identifies a focusable element across renders (the header icon and a chip can share an entity; the power toggle
// is focusable without a tabindex).
export const focusKey = (el) =>
  el?.tagName === 'HA-SWITCH'
    ? 'ha-switch'
    : el?.getAttribute?.('data-action') === 'power'
      ? 'power'
      : el?.getAttribute?.('tabindex') != null
        ? [el.getAttribute('class'), el.getAttribute('data-entity'), el.getAttribute('data-url')].join('|')
        : '';

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, the power toggle and its listener survive an update (a new rate every few seconds), and only
// the changed text and attributes are written. Nodes carrying a data-key are matched by it, the others by
// position. A custom element keeps the attributes the new HTML does not name (it may reflect its own state there)
// and, when the new HTML leaves it empty, its own children.
export const patchAttrs = (cur, next) => {
  if (!cur.nodeName.includes('-')) for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute('data-key') : null);
export const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it.
export const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
export const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      // An empty custom element (ha-icon, ha-switch) keeps whatever it put in itself.
      if (!o.nodeName.includes('-') || n.firstChild) patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
export const morph = (root, html) => {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
export class HaSwitchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uid = ++uidSeq;
    this._key = '';
    // Live rates of the byte counters: the last sample of each, and the rate between the last two.
    this._samples = {};
    this._rates = {};
    // The time between the last two changes of each byte counter: its polling period, after which twice without a
    // change makes its rate 0.
    this._periods = {};
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    // Ports, tiles, chips, the header icon and the admin link are focusable: Enter or Space opens them like a click.
    this.shadowRoot.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      if (!ev.composedPath().some((el) => ['button', 'link'].includes(el.getAttribute?.('role')))) return;
      ev.preventDefault();
      this._onClick(ev);
    });
    // While the power-off confirmation is open: Escape cancels it, Tab and Shift+Tab stay on its two buttons.
    // Listened on the window: a re-render or a click on its text can take the focus out of the card.
    this._onConfirmKey = (ev) => {
      if (!this._confirm) return;
      if (ev.key === 'Tab') {
        const btns = [...(this.shadowRoot.querySelectorAll?.('.modal .btn') || [])];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== 'Escape') return;
      ev.stopPropagation();
      this._closeConfirm();
    };
    // A click outside the card (and not in a dialog opened from it) cancels the confirmation.
    this._onConfirmOutside = watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        if (this._confirm) this._closeConfirm(false);
      },
    );
  }

  connectedCallback() {
    this._watchPill();
    // Back on screen: the render schedules the next timed redraw again (rate expiry, uptime minute).
    this._render();
  }

  // Off the page (view switch, editor, conditional card hidden): the power-off confirmation closes without acting,
  // like the other ha-* cards' popups, so that the card never comes back with it open.
  disconnectedCallback() {
    this._unwatchPill();
    clearTimeout(this._tick);
    this._tick = null;
    clearTimeout(this._toggleCheck);
    if (this._confirm) {
      this._dropConfirm();
      this._key = '';
    }
    window.removeEventListener('keydown', this._onConfirmKey);
    this._onConfirmOutside.off();
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (the subtitle then on one line). In the
  // banner, when title, subtitle and pill still do not fit above the ground strip (or the pill's label runs past the
  // text, over the picture), the pill keeps its dot only.
  // Measured after each render and on every new width (or once the web font is loaded), never by a fixed width.
  _fitPill() {
    // Home Assistant's <ha-card> (a Lit element) shows its content only from its first update, a microtask after it
    // is connected: measured before, everything is 0 px wide and the pill lands under the title. Fitted then.
    const card = this.shadowRoot?.querySelector?.("ha-card");
    if (card && card.hasUpdated === false) {
      if (!this._pillWait) {
        this._pillWait = (card.updateComplete?.then ? card.updateComplete : new Promise((r) => requestAnimationFrame(r))).then(() => {
          this._pillWait = null;
          this._fitPill();
        });
      }
      return;
    }
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector?.(".title-row");
      const name = row?.querySelector(".name");
      const chips = row ? [...row.children].filter((n) => n.classList.contains("chip")) : [];
      if (!name?.getBoundingClientRect || !chips.length) continue;
      t.classList.remove("pill-below", "pill-dot");
      // 200 px or less: the dot and the port count only, wherever the pill goes.
      if (this.getBoundingClientRect?.().width <= 200) t.classList.add("pill-dot");
      // The title's whole width (scrollWidth is rounded: 1 px more, so that a title that fits is never cut).
      const need = chips.reduce((w, c) => w + PILL_GAP_PX + c.getBoundingClientRect().width, name.scrollWidth + 1);
      if (need <= row.getBoundingClientRect().width + 0.5) continue;
      t.classList.add("pill-below");
      const banner = t.closest(".banner");
      if (!banner) continue;
      const box = banner.getBoundingClientRect();
      const ground = box.bottom - PILL_GROUND_PX;
      const right = t.getBoundingClientRect().right;
      const out = [name, ...t.querySelectorAll(".sub"), ...chips].some((n) => {
        const r = n.getBoundingClientRect();
        return r.height > 0 && (r.top < box.top - 0.5 || r.bottom > ground + 0.5 || r.right > right + 0.5);
      });
      if (out) t.classList.add("pill-dot");
    }
  }

  _watchPill() {
    if (typeof ResizeObserver !== "function") return;
    this._pillResize ??= new ResizeObserver((entries) => {
      const w = Math.round(entries.at(-1).contentRect.width);
      if (w === this._pillWidth) return;
      this._pillWidth = w;
      cancelAnimationFrame(this._pillFrame);
      this._pillFrame = requestAnimationFrame(() => this._fitPill());
    });
    this._pillResize.observe(this);
    document.fonts?.ready?.then(() => this._fitPill());
  }

  _unwatchPill() {
    this._pillResize?.disconnect();
    this._pillWidth = null;
  }

  static getConfigElement() {
    return document.createElement('ha-switch-card-editor');
  }

  static getStubConfig(hass) {
    const sw = Object.keys(hass?.states || {}).find((e) => e.startsWith('switch.'));
    return { name: 'Switch', ...(sw ? { switch_entity: sw } : {}) };
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    // A YAML key left empty (`port_pattern:`) is null: keep the default instead of overriding it with null.
    this._config = { ...DEFAULTS, ...Object.fromEntries(Object.entries(config).filter(([, v]) => v != null)) };
    // show_title: the header's name, hidden by the stylesheet (the status pill stays)
    this.toggleAttribute?.("hide-title", config.show_title === false);
    // Configs the editor would not produce: warn, but still draw the card as before.
    for (const msg of configWarnings(this._config)) {
      if (warned.has(msg)) continue;
      warned.add(msg);
      console.warn(`ha-switch-card: ${msg}`);
    }
    // The config part of the render key and the watched entities only change here,
    // not on every `set hass`: cache them instead of rebuilding them at each state change.
    this._configKey = JSON.stringify(this._config);
    this._watchedIds = this._watched();
    this._key = '';
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 8 };
  }

  /* --- helpers --- */
  _state(id) {
    return id ? this._hass?.states?.[id] : undefined;
  }

  _portEntity(n) {
    // String(): a YAML number (`port_pattern: 5`) has no replace().
    return String(this._config.port_pattern).replace('{n}', n);
  }

  // Ports drawn and watched: the same count, 8 when `ports` is not a number.
  _portCount() {
    return portCount(this._config);
  }

  _watched() {
    const c = this._config;
    const ids = [c.switch_entity, c.status_entity, c.connectivity_entity, c.uptime_entity, c.traffic_in_entity, c.traffic_out_entity];
    for (let n = 1; n <= this._portCount(); n++) ids.push(this._portEntity(n));
    return ids.filter(Boolean);
  }

  _statusColor() {
    const c = this._config;
    const st = this._state(c.status_entity);
    // A configured status sensor drives the colour, even when it is missing (renamed or deleted): grey, like unavailable.
    if (c.status_entity) {
      if (!st || isUnavailable(st)) return COLORS.grey;
      if (statusIs(st.state, c, 'online_state')) return COLORS.green;
      if (statusIs(st.state, c, 'idle_state')) return COLORS.orange;
      return COLORS.red;
    }
    const con = this._state(c.connectivity_entity);
    if (con) return isUnavailable(con) ? COLORS.grey : con.state === 'on' ? COLORS.green : COLORS.red;
    return COLORS.grey;
  }

  _formatState(st) {
    if (!st) return '—';
    return this._hass.formatEntityState ? this._hass.formatEntityState(st) : st.state;
  }

  _formatTraffic(st) {
    if (!st) return '—';
    const v = parseFloat(st.state);
    // `unavailable` / `unknown` (which keep their unit attribute) read as Home Assistant shows them, not "unavailable MB".
    if (!Number.isFinite(v)) return this._formatState(st);
    const unit = st.attributes?.unit_of_measurement;
    // Other units (kB/s, Mbit/s…): rounded and localized by Home Assistant, as in its own UI.
    if (unit && !['B', 'bytes', 'octets', 'o'].includes(unit)) return this._hass.formatEntityState ? this._hass.formatEntityState(st) : `${st.state} ${unit}`;
    return formatBytes(v, fmtLang(this._hass, this._config));
  }

  _moreInfo(entityId) {
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  // A traffic sensor's unit size when it counts bytes (a running total), else null (already a rate, or unknown).
  _byteFactor(st) {
    return BYTE_UNITS[st?.attributes?.unit_of_measurement] ?? null;
  }

  // The rate of a byte counter, in bytes/s: from its last two states while the card is shown (a counter reset or a
  // 32-bit wrap, going down, is skipped), else from the last 5 minutes of its statistics. A counter that stops
  // changing reads 0: as soon as Home Assistant reports the same value again (`last_reported`), or once more than
  // two polling periods (the time between its last two changes) have passed without a change.
  _rate(id) {
    const st = this._state(id);
    const f = this._byteFactor(st);
    if (!f) return null;
    const v = parseFloat(st.state) * f;
    if (Number.isFinite(v)) {
      const t = Date.parse(st.last_updated || st.last_changed || '') || Date.now();
      const seen = Math.max(t, Date.parse(st.last_reported || '') || 0);
      const prev = this._samples[id];
      if (!prev || prev.v !== v) {
        // Unchanged until prev.seen: the whole change happened since then.
        const since = prev ? Math.min(prev.seen, t) : 0;
        if (prev && t > since && v >= prev.v) {
          this._rates[id] = (v - prev.v) / ((t - since) / 1000);
          this._periods[id] = t - since;
        }
        this._samples[id] = { v, t, seen };
      } else if (seen > prev.seen) {
        prev.seen = seen;
        // Reported again without a change: the counter stands still.
        if (this._rates[id] != null) this._rates[id] = 0;
      }
    }
    const rate = this._rates[id];
    if (rate != null) {
      const sample = this._samples[id];
      const expiry = sample && this._periods[id] ? sample.seen + 2 * this._periods[id] : 0;
      if (rate && expiry && Date.now() > expiry) this._rates[id] = 0;
      else if (rate && expiry) this._nextTick = Math.min(this._nextTick ?? Number.POSITIVE_INFINITY, expiry + 1000);
      return this._rates[id];
    }
    const h = this._hist?.[id];
    return h?.length ? h[h.length - 1].v : null;
  }

  // One timer for the next timed redraw (`_nextTick`, set during the render: a rate that expires, the uptime minute),
  // only while the card is on the page.
  _schedule() {
    clearTimeout(this._tick);
    this._tick = null;
    if (this._nextTick == null || this.isConnected === false) return;
    this._tick = setTimeout(
      () => {
        this._tick = null;
        this._render();
      },
      Math.min(2 ** 31 - 1, Math.max(1000, this._nextTick - Date.now()))
    );
  }

  // 24 h of 5-minute statistics of the traffic sensors, fetched again every 5 minutes: the rate of a byte counter
  // (its 5-minute change over 300 s), the mean of a rate sensor. What is already there is returned (nothing at
  // first); the card renders again when the answer comes.
  _history(ids) {
    const key = ids.join(',');
    if (key && this._hass.callWS && (this._histKey !== key || Date.now() - this._histAt > HIST_REFRESH)) {
      this._histKey = key;
      this._histAt = Date.now();
      const end = this._histAt;
      Promise.resolve(
        this._hass.callWS({
          type: 'recorder/statistics_during_period',
          start_time: new Date(end - HIST_WINDOW).toISOString(),
          statistic_ids: ids,
          period: '5minute',
          types: ['mean', 'change'],
        })
      )
        .then((r) => {
          if (this._histKey !== key) return;
          this._histEnd = end;
          this._hist = Object.fromEntries(
            ids.map((id) => {
              const f = this._byteFactor(this._state(id));
              // `start`: milliseconds, or an ISO string from older recorders. A bucket without a value is a hole.
              const pts = (r?.[id] || []).map((p) => ({
                t: typeof p.start === 'number' ? p.start : Date.parse(p.start),
                v: f ? (Number.isFinite(p.change) ? (p.change * f) / 300 : null) : p.mean,
              }));
              return [id, pts.filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))];
            })
          );
          this._key = '';
          this._render();
        })
        // No statistics (sensor without state_class, recorder off): try again in a minute, no curve meanwhile.
        .catch(() => {
          this._histAt = Date.now() - HIST_REFRESH + 60000;
        });
    }
    return this._histKey === key ? this._hist : null;
  }

  // Overridden by the mini card: its detail button.
  _zoomButton() {
    return '';
  }

  // The power button on the illustrated header's top line: on, it turns the switch off (after the confirmation, unless
  // `confirm_off: false`); off, it turns it on.
  _powerPress() {
    const sw = this._state(this._config.switch_entity);
    if (sw?.state === 'on') {
      if (this._config.confirm_off !== false) this._openConfirm();
      else this._power('turn_off');
    } else if (sw && !isUnavailable(sw)) {
      this._power('turn_on');
    }
  }

  _onClick(ev) {
    const path = ev.composedPath();
    // Just closed: the rest of a double click on Turn off does nothing.
    if (!this._confirm && Date.now() - (this._confirmClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation?.();
      return;
    }
    // Confirmation open: only its buttons and the backdrop itself (outside the popup) act.
    if (this._confirm) {
      ev.stopPropagation?.();
      const action = path.find((el) => el.dataset?.action)?.dataset.action;
      if (action === 'confirm_ok') {
        this._closeConfirm();
        this._power('turn_off');
      } else if (action === 'confirm_cancel' || (action === 'confirm_backdrop' && path[0]?.dataset?.action === action)) {
        this._closeConfirm();
      }
      return;
    }
    if (path.some((el) => el.tagName === 'HA-SWITCH')) return;
    if (path.some((el) => el.dataset?.action === 'power')) {
      this._powerPress();
      return;
    }
    const target = path.find((el) => el.dataset && (el.dataset.entity || el.dataset.url));
    if (!target) return;
    if (target.dataset.entity) this._moreInfo(target.dataset.entity);
    else if (target.dataset.url && isSafeUrl(target.dataset.url)) window.open(target.dataset.url, '_blank', 'noopener');
  }

  /* --- render --- */
  _render() {
    if (!this._config || !this._hass) return;
    const c = this._config;
    const headerEntity = c.status_entity || c.connectivity_entity || c.switch_entity;
    // Attributes the card renders besides `.state`: the traffic unit (_formatTraffic) and the
    // header entity's friendly_name (aria-label). Hash them too, so their changes redraw the card.
    const entityKey = (id) => {
      const st = this._state(id);
      let k = st?.state ?? '';
      if (id === c.traffic_in_entity || id === c.traffic_out_entity) k += `\u0000${st?.attributes?.unit_of_measurement ?? ''}`;
      if (id === headerEntity) k += `\u0000${st?.attributes?.friendly_name ?? ''}`;
      return k;
    };
    const lang = getLang(this._hass, c);
    const loc = fmtLang(this._hass, c);
    const trafficIds = [c.traffic_in_entity, c.traffic_out_entity].filter(Boolean);
    this._nextTick = null;
    const liveRates = trafficIds.map((id) => this._rate(id));
    const hist = c.show_history === false ? null : this._history(trafficIds);
    // A timestamp uptime sensor (the boot time) changes its shown duration every minute, not with its state.
    const upMinute = c.uptime_entity && !/^\d+(\.\d+)?$/.test(String(this._state(c.uptime_entity)?.state ?? '').trim()) ? Math.floor(Date.now() / 60000) : null;
    if (upMinute != null) this._nextTick = Math.min(this._nextTick ?? Number.POSITIVE_INFINITY, (upMinute + 1) * 60000);
    this._schedule();
    const night = c.illustration !== false && isNight(this._hass, c);
    const key = loc + this._configKey + this._watchedIds.map(entityKey).join('|') + JSON.stringify([liveRates, !!hist, this._zoomed, upMinute, night]);
    if (key === this._key) return;
    this._key = key;

    const t = I18N[lang];
    const statusColor = this._statusColor();
    const sw = this._state(c.switch_entity);
    // Turned off (or gone) meanwhile, from elsewhere, or back to the compact mini card (no toggle): nothing to confirm.
    if (this._confirm && (sw?.state !== 'on' || this._compact())) this._dropConfirm();
    const confirm = this._confirm;

    /* status pill (header, right of the title) and chips */
    const chips = [];
    let conChip = '';
    let conArgs = null;
    const con = this._state(c.connectivity_entity);
    if (c.connectivity_entity) {
      const on = con?.state === 'on';
      // Unreachable (unavailable / unknown) is grey with a question mark, not the red "network off" of a real outage.
      const unknown = !con || isUnavailable(con);
      const icon = unknown ? 'mdi:help-network-outline' : on ? 'mdi:network-outline' : 'mdi:network-off-outline';
      conArgs = [c.connectivity_entity, icon, unknown ? COLORS.grey : on ? COLORS.green : COLORS.red, this._formatState(con)];
      conChip = this._chip(...conArgs);
    }
    let pill = '';
    const st = this._state(c.status_entity);
    if (c.status_entity) {
      // Online / idle read in the card's language, whatever the sensor reports; any other state as Home Assistant shows it.
      const online = statusIs(st?.state, c, 'online_state');
      const idle = !online && statusIs(st?.state, c, 'idle_state');
      const icon = online ? 'mdi:check-circle' : idle ? 'mdi:minus-circle' : !st || isUnavailable(st) ? 'mdi:help-circle' : 'mdi:alert-circle';
      pill = this._chip(c.status_entity, icon, statusColor, online ? t.online : idle ? t.idle : this._formatState(st), true);
      if (conChip) chips.push(conChip);
    } else {
      // No status sensor: connectivity is the header status.
      pill = conArgs ? this._chip(...conArgs, true) : '';
    }
    if (c.uptime_entity) {
      // Unavailable / unknown read as Home Assistant shows them (translated), not as a dash or a duration.
      const up = this._state(c.uptime_entity);
      chips.push(this._chip(c.uptime_entity, 'mdi:clock-outline', COLORS.neutral, isUnavailable(up) ? this._formatState(up) : formatUptime(up?.state, c.uptime_unit, t)));
    }

    /* ports */
    const count = this._portCount();
    const watched = watchedPorts(c);
    const portInfo = [];
    let upCount = 0;
    // The switch down (status or connectivity offline or unavailable, or turned off): its ports are drawn off (grey),
    // whatever their sensors still report, and the header's activity LEDs stop.
    const down = sw?.state === 'off' || ((c.status_entity || c.connectivity_entity) && (statusColor === COLORS.red || statusColor === COLORS.grey));
    for (let n = 1; n <= count; n++) {
      const id = this._portEntity(n);
      const ps = this._state(id);
      const up = !down && ps?.state === String(c.port_on_state);
      if (up) upCount++;
      // Missing, unavailable or unknown: grey, so a dead SNMP poll does not show every port as down. A port without
      // link is grey too (nothing plugged in), red only when it is one of the `watched_ports`.
      const color = down || !ps || isUnavailable(ps) ? COLORS.grey : up ? COLORS.green : watched.has(n) ? COLORS.red : COLORS.grey;
      const name = portName(c, n);
      portInfo.push({ n, id, name, label: name ? shortName(name) : String(n), colors: [color, shade(color)] });
    }
    const urlAttr = c.url ? `data-url="${esc(c.url)}" role="link" tabindex="0" aria-label="${esc(t.open_admin)}"` : '';
    let device;
    if (c.image) {
      const ports = portInfo.map(
        ({ n, id, name, colors }) =>
          `<div class="port" style="left:${num(c.port_start, DEFAULTS.port_start) + (n - 1) * num(c.port_step, DEFAULTS.port_step)}%" data-entity="${esc(id)}" role="button" tabindex="0" title="${esc(portTitle(t.port, { n, name }))}">${portSvg(...colors)}</div>`
      );
      device = `<div class="device img" ${urlAttr}>
           <img src="${esc(c.image)}" alt="">
           <div class="ports abs" style="bottom:${num(c.port_bottom, DEFAULTS.port_bottom)}%">${ports.join('')}</div>
         </div>`;
    }
    // The drawn front panel (the model's, else the generic one), in the body.
    const panel = c.image ? '' : (MODELS[c.model]?.svg || chassisSvg)(portInfo, statusColor, t.port);
    if (!c.image) device = `<div class="device" ${urlAttr}>${panel}</div>`;

    /* traffic: a byte counter shows its rate, with its total under it; another sensor shows its value as is */
    const value = (id) => {
      const st = this._state(id);
      return this._byteFactor(st) && Number.isFinite(parseFloat(st.state)) ? formatRate(this._rate(id), loc) : this._formatTraffic(st);
    };
    const total = (id) => {
      const st = this._state(id);
      const f = this._byteFactor(st);
      return f && Number.isFinite(parseFloat(st.state)) ? `${t.total} ${formatBytes(parseFloat(st.state) * f, loc)}` : '';
    };
    const tile = (id, icon, color, label) =>
      id
        ? `<div class="tile" style="--c:${color}" data-entity="${esc(id)}" role="button" tabindex="0">${spark(hist?.[id], this._histEnd)}
             <div class="ic"><ha-icon icon="${icon}"></ha-icon></div>
             <div class="txt"><div class="k">${label}</div><div class="v">${esc(value(id))}</div>${total(id) ? `<div class="t">${esc(total(id))}</div>` : ''}</div>
           </div>`
        : '';
    const traffic = tile(c.traffic_in_entity, 'mdi:arrow-down-bold', COLORS.green, t.in) + tile(c.traffic_out_entity, 'mdi:arrow-up-bold', COLORS.blue, t.out);
    // Mini card: the rates only, beside the front panel (under it on a narrow card), each with its curve.
    const rate = (id, icon, color, label) =>
      id
        ? `<div class="rt" style="--c:${color}" data-entity="${esc(id)}" role="button" tabindex="0" title="${esc(label)}">${spark(hist?.[id], this._histEnd)}<div><ha-icon icon="${icon}"></ha-icon><span>${esc(value(id))}</span></div></div>`
        : '';
    const compact = this._compact();
    const rates = rate(c.traffic_in_entity, 'mdi:arrow-down-bold', COLORS.green, t.in) + rate(c.traffic_out_entity, 'mdi:arrow-up-bold', COLORS.blue, t.out);
    const body = compact
      ? `<div class="mb${rates ? '' : ' solo'}">${device}${rates ? `<div class="rates">${rates}</div>` : ''}</div>`
      : `${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
        ${device}
        ${traffic ? `<div class="traffic">${traffic}</div>` : ''}`;
    const count2 = `${upCount}/${count}`;
    pill = pill.split('\u0000COUNT\u0000').join(esc(count2));

    // Illustrated header (`illustration: false`: the classic one): the traffic flowing on a network background (one
    // lane per traffic sensor, see flowScene), the title on its left, a network strip along its bottom (red dashes
    // when the switch is down).
    let banner = '';
    let flows = '';
    if (c.illustration !== false) {
      const lane = (id, dir, color) => {
        if (!id) return null;
        const st = this._state(id);
        // A byte counter flows at its rate; a sensor that is already a rate flows at a mid pace while above 0.
        const bps = this._byteFactor(st) ? this._rate(id) : parseFloat(st?.state) > 0 ? 1e5 : 0;
        return { dir, color, dur: down || sw?.state === 'off' ? 0 : flowDuration(bps), label: value(id) };
      };
      flows = flowScene([lane(c.traffic_in_entity, 'in', COLORS.green), lane(c.traffic_out_entity, 'out', COLORS.blue)].filter(Boolean));
      banner = `<svg class="scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><path class="dots" d="${NET_DOTS}"/>${flows}</svg>`;
    }

    const active = this.shadowRoot.activeElement;
    const focused = focusKey(active);
    const html = `
      <style>${HaSwitchCard.styles}</style>
      <ha-card class="${compact ? 'mini' : ''}${confirm ? 'dialog-open' : ''}">
        <div class="${banner ? `header banner${night ? ' night' : ''}${flows ? '' : ' noart'}` : 'header'}">${banner}
          <div class="ic big" style="--c:${statusColor}" ${headerEntity ? `data-entity="${esc(headerEntity)}" role="button" tabindex="0" aria-label="${esc(this._state(headerEntity)?.attributes?.friendly_name || headerEntity)}"` : ''}>
            <ha-icon icon="${esc(c.icon)}"></ha-icon>
          </div>
          <div class="titles">
            <div class="title-row"><div class="name">${esc(c.name)}</div>${pill}</div>
            ${c.subtitle && c.show_subtitle !== false ? `<div class="sub" title="${esc(c.subtitle)}">${esc(c.subtitle)}</div>` : ''}
          </div>
          ${sw && !compact ? this._powerControl(sw, statusColor, t, !!banner) : ''}${this._zoomButton()}${
            banner ? `<div class="ground ${statusColor === COLORS.red || sw?.state === 'off' ? 'g-netdown' : down ? 'g-net still' : 'g-net'}"></div>` : ''
          }
        </div>
        ${body}${confirm ? this._confirmHtml(t) : ''}
      </ha-card>`;
    // The first render writes the HTML; the next ones patch it in place (morph), keeping the nodes, the focus and
    // the power toggle's listener, so a new rate only rewrites its text.
    const patched = !!this.shadowRoot.firstChild;
    if (patched) morph(this.shadowRoot, html);
    else this.shadowRoot.innerHTML = html;
    this._fitPill();

    // The focused element was replaced (first render, or its place changed): focus its counterpart, the power toggle
    // included, so keyboard navigation keeps its place.
    if (focused && (!patched || this.shadowRoot.activeElement !== active)) {
      const again = [...this.shadowRoot.querySelectorAll('[tabindex], ha-switch, .pw')].find((el) => focusKey(el) === focused);
      again?.focus({ preventScroll: true });
    }

    const toggle = this.shadowRoot.querySelector('ha-switch');
    if (toggle && sw) {
      toggle.checked = sw.state === 'on';
      toggle.disabled = sw.state === 'unavailable' || sw.state === 'unknown';
      // Kept across renders by the patch: listened once.
      if (toggle._hscListening) return;
      toggle._hscListening = true;
      toggle.addEventListener('change', (ev) => {
        // Turning the switch off can cut the network Home Assistant itself runs on: ask first (`confirm_off: false`
        // turns it off at once). Until confirmed, the toggle shows the real state again.
        if (!ev.target.checked && this._config.confirm_off !== false) {
          ev.target.checked = true;
          this._openConfirm();
          return;
        }
        this._power(ev.target.checked ? 'turn_on' : 'turn_off');
      });
    }
  }

  // The power control: a round button (mdi:power, the status colour while on, grey while off) on the illustrated
  // header's top line, the ha-switch toggle in the classic header.
  _powerControl(sw, statusColor, t, banner) {
    const label = esc(`${t.power}${t.colon}${this._config.name}`);
    if (!banner) return `<ha-switch aria-label="${label}" title="${esc(t.power)}"></ha-switch>`;
    const on = sw.state === 'on';
    const off = isUnavailable(sw);
    return `<button class="pw${on ? ' on' : ''}" type="button" data-action="power"${on ? ` style="--c:${statusColor}"` : ''} aria-label="${label}" aria-pressed="${on}" title="${esc(on ? t.turn_off : t.power)}"${off ? ' disabled' : ''}><ha-icon icon="mdi:power"></ha-icon></button>`;
  }

  // Power toggle service call.
  _power(service) {
    const c = this._config;
    const [domain] = c.switch_entity.split('.');
    const before = this._state(c.switch_entity)?.state;
    // When the call fails, or succeeds but the entity keeps its state (a switch that does not answer),
    // the render key does not change and the toggle would stay visually flipped: redraw from the real state.
    // A failure redraws at once. A success waits: MQTT, cloud or polled SNMP switches report their new state
    // after the call returns, and an immediate redraw would bounce the toggle back until it arrives.
    const redraw = () => {
      this._key = '';
      this._render();
    };
    clearTimeout(this._toggleCheck);
    Promise.resolve(this._hass.callService(domain, service, { entity_id: c.switch_entity })).then(
      () => {
        // One pending check per card, even when the calls of quick successive clicks settle out of order.
        clearTimeout(this._toggleCheck);
        this._toggleCheck = setTimeout(() => {
          if (this._state(c.switch_entity)?.state === before) redraw();
        }, TOGGLE_CHECK_MS);
      },
      redraw
    );
  }

  // In-card confirmation before turning the switch off, at the top of the card like the other ha-* cards' popups
  // (window.confirm() is blocking and silently neutralised in some webviews). Cancel, Escape, the backdrop and a
  // click outside the card close it without acting.
  _openConfirm() {
    this._confirm = true;
    window.addEventListener('keydown', this._onConfirmKey);
    this._onConfirmOutside.on();
    this._key = '';
    this._render();
    // preventScroll: opening the popup must not bring a scrolled page back to the card.
    this.shadowRoot.querySelector('.modal .primary')?.focus?.({ preventScroll: true });
  }

  _dropConfirm() {
    this._confirm = false;
    this._confirmClosedAt = Date.now();
    window.removeEventListener('keydown', this._onConfirmKey);
    this._onConfirmOutside.off();
  }

  // restoreFocus: back on the power toggle, unless closed by a click elsewhere (the focus goes where it put it).
  _closeConfirm(restoreFocus = true) {
    this._dropConfirm();
    this._key = '';
    this._render();
    if (restoreFocus) this.shadowRoot.querySelector('ha-switch, .pw')?.focus?.({ preventScroll: true });
  }

  _confirmHtml(t) {
    return `<div class="backdrop" data-action="confirm_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
        <div class="msg" id="confirm-msg">${esc(t.confirm_text.replace('{name}', this._config.name))}</div>
        <div class="modal-actions">
          <button type="button" class="btn" tabindex="0" data-action="confirm_cancel">${esc(t.cancel)}</button>
          <button type="button" class="btn primary" tabindex="0" data-action="confirm_ok">${esc(t.turn_off)}</button>
        </div>
      </div>
    </div>`;
  }

  // `count`: the status pill, followed by the ports up out of all ("· 6/8"); on the narrowest mini card the pill keeps
  // only that count, its colour and icon telling the status.
  _chip(entity, icon, color, content, count = false) {
    // The full text also in title / aria-label: the pill may be truncated, or reduced to its icon on a narrow card.
    const full = count ? `${esc(content)} · \u0000COUNT\u0000` : esc(content);
    return `<div class="chip" style="--c:${color}" data-entity="${esc(entity)}" role="button" tabindex="0" title="${full}" aria-label="${full}">
      <ha-icon icon="${icon}"></ha-icon><span>${esc(content)}</span>${count ? '<span class="cnt" data-n="\u0000COUNT\u0000">· \u0000COUNT\u0000</span>' : ''}
    </div>`;
  }

  _compact() {
    return false;
  }

  static get styles() {
    return `
      /* A block, so that its width is measured (the status pill's place follows it, see _fitPill). */
      :host {
        display: block;
        --hs-body-top: color-mix(in srgb, var(--primary-text-color, #212121) 24%, var(--card-background-color, #fff));
        --hs-body-bottom: color-mix(in srgb, var(--primary-text-color, #212121) 14%, var(--card-background-color, #fff));
        --hs-dark: color-mix(in srgb, var(--primary-text-color, #212121) 45%, var(--card-background-color, #fff));
      }
      ha-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      /* The illustrated header and its title block are size containers, which take no width from their content: in a
         parent sized by its content (inline-block, an \`auto\` grid column, layout-card) the card would fall to its
         padding. This empty, zero-height grid gives it a natural (max-content) width of 300px without any minimum (its
         min-content width is 0): in a "1fr 1fr" grid (grid card, horizontal-stack), wrapped in a <div> or not, the card
         still shrinks to its column. A fixed-width line or a min-width would be a minimum and overflow there. The mini
         card's own rule (240px) follows. */
      :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 300px); height: 0; }
      [data-entity], [data-url] { cursor: pointer; }
      /* The body starts 8px under the header (the card gap is 10px between body blocks). */
      .header { display: flex; align-items: center; gap: 10px; margin-bottom: -2px; }
      .ic {
        --size: 32px;
        width: var(--size); height: var(--size); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; flex: none;
        color: var(--c); background: color-mix(in srgb, var(--c) 15%, transparent);
      }
      .ic.big { --size: 40px; --mdc-icon-size: 24px; background: color-mix(in srgb, var(--c) 16%, transparent); }
      .titles { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; }
      :host([hide-title]) .titles .name { display: none; }
      /* The status pill (classic header and banner): on the title row, 8 px after the name, only when the whole name
         and the pill's whole text fit there; otherwise on its own line under the subtitle, which then keeps one line.
         Its dot and the port count alone at 200 px or less, or when the banner has no room left for its text
         (pill-dot): the whole text stays in its title and aria-label. Measured after each render (_fitPill), in every
         language, never by a fixed width. */
      .title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .title-row > .name { flex: 0 1 auto; min-width: 0; }
      .title-row > .chip { flex: none; max-width: none; }
      .title-row > .chip span { overflow: visible; }
      .title-row > .chip ha-icon { flex: none; }
      .titles.pill-below .title-row { display: contents; }
      .titles.pill-below > .sub { order: 1; }
      .titles.pill-below .title-row > .chip { order: 2; align-self: flex-start; margin-top: 2px; }
      .titles.pill-dot .title-row > .chip > span:not(.cnt) { display: none; }
      .titles.pill-dot .title-row > .chip .cnt { font-size: 0; margin-left: 0; }
      .titles.pill-dot .title-row > .chip .cnt::after { content: attr(data-n); font-size: 11px; }
      .name { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      ha-switch {
        flex: none;
        --switch-checked-color: var(--success-color, #43a047);
        --switch-checked-button-color: #fff;
        --switch-checked-track-color: var(--success-color, #43a047);
        --switch-unchecked-button-color: #fff;
        --switch-unchecked-track-color: var(--error-color, #db4437);
        --ha-switch-checked-background-color: var(--success-color, #43a047);
        --ha-switch-checked-thumb-background-color: #fff;
        --ha-switch-checked-border-color: var(--success-color, #43a047);
        --ha-switch-background-color: var(--error-color, #db4437);
        --ha-switch-thumb-background-color: #fff;
        --ha-switch-border-color: var(--error-color, #db4437);
      }
      .chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .chip {
        display: inline-flex; align-items: center; gap: 6px; padding: 1px 8px 1px 5px;
        border-radius: 12px; font-size: 11px; font-weight: 500;
        background: color-mix(in srgb, var(--c) 15%, transparent); color: var(--c);
        --mdc-icon-size: 14px;
      }
      .chip ha-icon { --mdc-icon-size: 13px; }
      .chip { max-width: 100%; box-sizing: border-box; }
      .chip span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      /* A drawn front panel keeps its own (almost square) corners; a custom photo is framed with rounded ones. */
      .device { position: relative; width: 100%; }
      .device.img { border-radius: 10px; overflow: hidden; }
      .device img { width: 100%; display: block; }
      .device svg { width: 100%; height: auto; display: block; }
      .device svg .port:hover { filter: brightness(1.15); }
      .hs-edge { stroke: var(--hs-dark); }
      .hs-vent, .hs-slot, .hs-divider { fill: var(--hs-dark); }
      .hs-label { fill: var(--secondary-text-color, #727272); font-family: inherit; }
      .ports.abs { position: absolute; left: 0; width: 100%; height: 27px; }
      .ports.abs .port { position: absolute; top: 50%; transform: translate(-50%, -50%); }
      .port { width: 27px; line-height: 0; }
      .port svg { width: 100%; height: auto; }
      /* Tiles of at least 140px side by side, one per line below; never wider than the card (a 1fr 1fr grid's column). */
      .traffic { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr)); gap: 6px; }
      .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
              background: var(--secondary-background-color, rgba(127,127,127,.08)); position: relative; overflow: hidden; }
      .tile > :not(.spark) { position: relative; }
      .tile .ic { --mdc-icon-size: 20px; }
      .tile .t { font-size: 11px; color: var(--secondary-text-color); }
      /* 24 h curve of a rate, in the tile's colour, in its own 24 px band under the text, never behind it. */
      .tile:has(> .spark) { padding-bottom: 30px; }
      .spark { position: absolute; inset: auto 0 0; width: 100%; height: 24px; pointer-events: none; }
      .spark-a { fill: color-mix(in srgb, var(--c) 12%, transparent); }
      .spark-l { fill: none; stroke: color-mix(in srgb, var(--c) 50%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
      /* "Online · 6/8": the count follows the status as one text (the chip's gap is for its icon). */
      .chip .cnt { flex: none; margin-left: -3px; }

      /* Mini card: the front panel and the rates side by side; the header icon keeps the full card's size (40px). */
      /* Only the mini card is a size container (its layout follows its own width). A size container takes no width from
         its content: in a parent sized by its content (inline-block, an \`auto\` grid column) it would shrink to its
         padding. An empty, zero-height grid before it gives the host up to 240px there, and no minimum. */
      :host([mini]) { display: block; min-width: 0; }
      :host([mini])::before { content: ""; display: grid; grid-template-columns: minmax(0, 240px); height: 0; }
      ha-card.mini { gap: 8px; container: hs-card / inline-size; }
      .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%; align-self: flex-start;
              display: grid; place-items: center; color: var(--secondary-text-color); --mdc-icon-size: 16px; }
      .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 14%, transparent); color: var(--primary-text-color); }
      .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
      .mb { display: grid; grid-template-columns: minmax(0, 62%) minmax(0, 1fr); gap: 8px; align-items: center; }
      .mb.solo { grid-template-columns: minmax(0, 1fr); }
      .rates { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
      .rt { position: relative; overflow: hidden; min-width: 0; padding: 4px 8px; border-radius: 8px;
            background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .rt > div { position: relative; display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500;
                  color: var(--primary-text-color); white-space: nowrap; --mdc-icon-size: 14px; }
      .rt ha-icon { flex: none; color: var(--c); }
      .rt span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      /* The mini card's rate chips: a 14 px band under the rate. */
      .rt:has(> .spark) { padding-bottom: 16px; }
      .rt .spark { height: 14px; }
      /* A narrow mini card (a phone, 6 columns of a section): the panel takes the whole width, the rates go under it
         side by side, then one per line; the pill keeps only the port count. */
      @container (max-width: 330px) {
        .mb { grid-template-columns: minmax(0, 1fr); }
        .rates { flex-direction: row; }
        .rt { flex: 1 1 0; }
      }
      @container hs-card (max-width: 200px) {
        .rates { flex-direction: column; }
        .rt { flex: none; padding: 3px 6px; }
        .rt > div { font-size: 12px; }
      }
      .tile .txt { min-width: 0; }
      /* The label wraps rather than being cut: "Ruch przychodzący" or "Eingehender Datenverkehr" in a 140px tile. */
      .tile .k { font-size: 11px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
      .tile .v { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }

      /* Power-off confirmation: a backdrop over the card with a small popup at its top, so it stays in view. */
      ha-card.dialog-open { position: relative; min-height: 150px; }
      .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
                  padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
      .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
               box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
      .modal .msg { font-size: 14px; line-height: 1.4; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
      .modal-actions .btn { border: none; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer;
                            background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
      .modal-actions .btn.primary { background: color-mix(in srgb, var(--primary-color, #03a9f4) 15%, transparent); color: var(--primary-color, #03a9f4); }
      .modal-actions .btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }

      /* Illustrated header: 90px edge to edge at the top of the card (full and mini), the title on the network
         background at its left, the traffic flow at its right over a 10px network strip. Its own colours, day and
         night, whatever the theme. */
      .banner {
        /* A size container (it takes its width from the card, never from its content), so that the full card's
           banner follows its own width too. The scene's width is resolved where it is used (cqw: the banner's). */
        container: hs-banner / inline-size;
        --hb-scene-w: min(200px, 58cqw);
        position: relative; isolation: isolate; overflow: hidden; box-sizing: border-box;
        height: 90px; margin: -12px -12px 0; padding: 0 12px 10px;
        border-radius: var(--ha-card-border-radius, 12px) var(--ha-card-border-radius, 12px) 0 0;
        background: #eaf2fb; color: #0d2a45;
      }
      .banner.night { background: #101827; color: #fff; }
      .banner > :not(.scene, .ground) { position: relative; z-index: 1; }
      /* The title block keeps clear of the traffic flow (its rates start at a third of the scene). */
      .banner > .titles { margin-right: calc(var(--hb-scene-w) * 0.7); }
      .banner .scene { position: absolute; right: 0; bottom: 10px; height: 80px; width: var(--hb-scene-w); z-index: 0; overflow: visible; }
      .banner .scene .dots { fill: #c9dcf2; }
      .banner.night .scene .dots { fill: #22324d; }
      /* Traffic flow: a lane per traffic sensor, its rate on its left, packets running along it (see flowScene). */
      .banner .scene .lane { fill: none; stroke: #c9dcf2; stroke-width: 9; stroke-linecap: round; }
      .banner.night .scene .lane { stroke: #22324d; }
      .banner .scene .fl { font-size: 9px; font-weight: 500; fill: #33506b; }
      .banner.night .scene .fl { fill: rgba(255,255,255,.78); }
      .banner .scene .pk { animation: var(--d) linear var(--dl) infinite; }
      .banner .scene .pk-l { animation-name: hs-pk-l; }
      .banner .scene .pk-r { animation-name: hs-pk-r; }
      @keyframes hs-pk-l { 0% { transform: translateX(0); opacity: 0; } 12%, 88% { opacity: 1; } 100% { transform: translateX(-60px); opacity: 0; } }
      @keyframes hs-pk-r { 0% { transform: translateX(0); opacity: 0; } 12%, 88% { opacity: 1; } 100% { transform: translateX(60px); opacity: 0; } }
      @media (prefers-reduced-motion: reduce) { .banner .scene .pk { animation: none; transform: translateX(var(--o)); } }
      .banner .ic.big { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
      .banner.night .ic.big { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
      /* Title row: the name, then the status pill 8 px after it (a dot in the icon's colour and the status, see
         .title-row); the subtitle under them. */
      .banner .titles { justify-content: center; gap: 2px; }
      .banner .title-row > .chip { gap: 4px; padding: 1px 8px; line-height: 16px; }
      .banner .title-row > .chip ha-icon { display: none !important; }
      .banner .title-row > .chip::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--c); flex: none; }
      /* No traffic sensor: no flow in the header, the title takes the room. */
      .banner.noart > .titles { margin-right: 0; }
      /* There, the title row keeps clear of the buttons on the banner's top line (power, expand / collapse). */
      .banner.noart:has(> .pw, > .zoom) > .titles { margin-right: 22px; }
      .banner.noart:has(> .pw):has(> .zoom) > .titles { margin-right: 50px; }
      .banner .name { color: #0d2a45; }
      .banner .sub { color: #3b5b78; }
      .banner.night .name { color: #fff; }
      .banner.night .sub { color: rgba(255,255,255,.78); }
      .banner .chip { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
      .banner.night .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
      /* The expand / collapse button: 24 px, round, frosted, in the banner's top right corner. */
      .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; margin: 0; color: #33506b;
                      background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                      -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
      .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
      .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
      .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
      /* The power button: the same round frosted button, 4 px left of the expand / collapse one (or in the corner),
         its icon in the status colour while on, grey while off. */
      .banner .pw { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%;
                    display: grid; place-items: center; cursor: pointer; --mdc-icon-size: 16px; color: var(--c);
                    background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
                    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
      .banner .pw:hover { background: rgba(255,255,255,.75); }
      .banner .pw:not(.on) { color: #7b8a99; }
      .banner.night .pw:not(.on) { color: rgba(255,255,255,.5); }
      .banner.night .pw { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
      .banner.night .pw:hover { background: rgba(255,255,255,.22); }
      .banner .pw:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
      .banner .pw:disabled { cursor: default; opacity: .6; }
      .banner:has(> .zoom) > .pw { right: 33px; }
      /* Network strip: blue dashes flowing (traffic) while the switch is up, red still dashes when it is down. */
      .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; z-index: 0; background-repeat: no-repeat; background-size: calc(100% + 22px) 2px; background-position: 0 50%; }
      .g-net { background-color: #1e3a5f; background-image: repeating-linear-gradient(90deg, #4fc3f7 0 14px, transparent 14px 22px); box-shadow: inset 0 2px 0 #2f5a8a;
               animation: hb-flow 1.6s linear infinite; }
      .night .g-net { background-color: #0f1d33; box-shadow: inset 0 2px 0 #1e3a5f; }
      .g-netdown { background-color: #5a6370; background-image: repeating-linear-gradient(90deg, #e5484d 0 6px, transparent 6px 16px); box-shadow: inset 0 2px 0 #77808c; }
      .night .g-netdown { background-color: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
      @keyframes hb-flow { from { background-position: -22px 50%; } to { background-position: 0 50%; } }
      .g-net.still { animation: none; }
      @media (prefers-reduced-motion: reduce) { .g-net { animation: none; } }
      /* A card of about 300 px: a smaller flow, so the name and the whole status pill keep their room. */
      @container hs-banner (max-width: 340px) { .banner > .scene, .banner > .titles { --hb-scene-w: 46cqw; } }
      /* A narrow card (a phone, 6 columns of a section): no room for the flow beside the title, the background alone
         stays; the title keeps clear of the buttons on the top line (power toggle, expand / collapse). */
      @container hs-banner (max-width: 260px) {
        .banner > .scene { display: none; }
        .banner > .titles { margin-right: 0; }
        .banner:not(.noart):has(> .pw, > .zoom) > .titles .name { padding-right: 18px; }
        .banner:not(.noart):has(> .pw):has(> .zoom) > .titles .name { padding-right: 46px; }
      }
    `;
  }
}

// The banner's ground strip (the network strip), that the title block keeps clear of, and the gap between the name
// and the status pill on its row (.title-row).
export const PILL_GROUND_PX = 10;
export const PILL_GAP_PX = 8;

/* ------------------------------------------------------------------ */
/* Mini card                                                           */
/* ------------------------------------------------------------------ */
// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// count), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
export const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onCancel = () => {
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener('pointerdown', onDown, true);
      document.addEventListener('pointerup', onUp, true);
      document.addEventListener('pointercancel', onCancel, true);
      document.addEventListener('click', onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      downOutside = false;
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onCancel, true);
      document.removeEventListener('click', onClick, true);
    },
  };
};

// A click in a dialog opened from the card (its more-info) does not fold it back.
export const inDialog = (ev) => ev.composedPath().some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName));

/**
 * Compact card: header with the status and ports up, the front panel and the rates with their 24 h curves.
 * Its detail button (top right, `zoom: false` removes it) switches it to the full card and back; a click outside the
 * card brings the compact view back.
 */
export class HaSwitchMiniCard extends HaSwitchCard {
  constructor() {
    super();
    this._zoomed = false;
    this._onOutside = watchOutside(
      (ev) => !ev.composedPath().includes(this) && !inDialog(ev),
      () => {
        if (this._zoomed) this._setZoom(false);
      },
    );
  }

  static getConfigElement() {
    return document.createElement('ha-switch-mini-card-editor');
  }

  connectedCallback() {
    super.connectedCallback();
    this._onOutside.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._onOutside.off();
    // Left (another view, a conditional card hidden): back to the compact view, so that it never comes back expanded.
    if (this._zoomed) {
      this._zoomed = false;
      this._key = '';
    }
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _compact() {
    return !this._zoomed;
  }

  setConfig(config) {
    // The host attribute behind the mini card's styles (its size container); never set in the constructor.
    this.setAttribute?.('mini', '');
    super.setConfig(config);
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    this._key = '';
    this._render();
  }

  _zoomButton() {
    if (this._config.zoom === false) return '';
    const t = I18N[getLang(this._hass, this._config)];
    const z = this._zoomed;
    return `<button class="zoom" title="${esc(z ? t.zoom_out : t.zoom_in)}" aria-label="${esc(z ? t.zoom_out : t.zoom_in)}"><ha-icon icon="mdi:${z ? 'arrow-collapse' : 'arrow-expand'}"></ha-icon></button>`;
  }

  _onClick(ev) {
    if (ev.composedPath().some((el) => el.classList?.contains?.('zoom'))) {
      ev.stopPropagation();
      this._setZoom(!this._zoomed);
      // Keyboard use (Enter / Space: no click count) keeps the focus on the button, without scrolling the page.
      if (!ev.detail) this.shadowRoot.querySelector('.zoom')?.focus?.({ preventScroll: true });
      return;
    }
    super._onClick(ev);
  }
}

/* ------------------------------------------------------------------ */
/* Visual editor                                                       */
/* ------------------------------------------------------------------ */
// Editor toggles whose default is on, and that default.
export const EDITOR_TOGGLES = { show_title: true, show_subtitle: true, show_history: true, zoom: true, confirm_off: true, illustration: true };

// Config → form data: `port_names` as a map ({ 3: NAS }) becomes the list in port order the text fields edit
// (an empty name keeps the number), and `watched_ports` (numbers, or "1, 3, 8") the strings of the port select.
export const toForm = (config) => {
  const data = { ...EDITOR_TOGGLES, illustration_theme: 'auto', ...config };
  const names = config.port_names;
  if (names && typeof names === 'object') {
    const n = Array.isArray(names) ? names.length : Math.max(0, ...Object.keys(names).map((k) => parseInt(k, 10)).filter(Number.isFinite));
    data.port_names = Array.from({ length: n }, (_, i) => portName(config, i + 1));
  }
  if (config.watched_ports !== undefined) data.watched_ports = [...watchedPorts(config)].map(String);
  return data;
};

// Form data → config: port numbers back as numbers, trailing empty port names dropped, toggles left at their
// default and empty values kept out of the YAML.
export const fromForm = (value) => {
  const config = { ...value };
  if (Array.isArray(config.port_names)) {
    const names = config.port_names.map((v) => (v == null ? '' : String(v)));
    while (names.length && !names[names.length - 1].trim()) names.pop();
    config.port_names = names;
  }
  if (Array.isArray(config.watched_ports)) config.watched_ports = [...watchedPorts(config)];
  // The automatic theme is the default: kept out of the YAML.
  if (config.illustration_theme === 'auto') delete config.illustration_theme;
  Object.keys(config).forEach((k) => {
    const v = config[k];
    if (v === '' || v === undefined || (Array.isArray(v) && !v.length) || EDITOR_TOGGLES[k] === v) delete config[k];
  });
  return config;
};

export class HaSwitchCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    const prevLang = this._hass ? getLang(this._hass, this._config) : null;
    this._hass = hass;
    // Only a language change needs new labels: otherwise hand the new hass to the form and keep it as is.
    if (this._form && prevLang === getLang(hass, this._config)) {
      this._form.hass = hass;
      return;
    }
    this._render();
  }

  _schema(t) {
    return [
      { name: 'name', selector: { text: {} } },
      { name: 'subtitle', selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
      {
        type: 'expandable', name: 'entities', flatten: true, title: t.sections.entities, icon: 'mdi:format-list-bulleted',
        schema: [
          { name: 'switch_entity', selector: { entity: { domain: ['switch', 'input_boolean'] } } },
          { name: 'confirm_off', selector: { boolean: {} } },
          { name: 'status_entity', selector: { entity: {} } },
          { name: 'connectivity_entity', selector: { entity: { domain: 'binary_sensor' } } },
          { name: 'uptime_entity', selector: { entity: { domain: 'sensor' } } },
          { name: 'traffic_in_entity', selector: { entity: { domain: 'sensor' } } },
          { name: 'traffic_out_entity', selector: { entity: { domain: 'sensor' } } },
        ],
      },
      {
        type: 'expandable', name: 'ports_section', flatten: true, title: t.sections.ports, icon: 'mdi:ethernet',
        schema: [
          { name: 'ports', selector: { number: { min: 1, max: 52, mode: 'box' } } },
          { name: 'port_pattern', selector: { text: {} } },
          { name: 'port_on_state', selector: { text: {} } },
          { name: 'port_names', selector: { text: { multiple: true } } },
          {
            name: 'watched_ports',
            selector: {
              select: {
                multiple: true,
                mode: 'dropdown',
                options: Array.from({ length: Math.min(52, portCount(this._config || {})) }, (_, i) => ({ value: String(i + 1), label: `${t.port} ${i + 1}` })),
              },
            },
          },
        ],
      },
      {
        type: 'expandable', name: 'status_section', flatten: true, title: t.sections.status, icon: 'mdi:check-circle-outline',
        schema: [
          {
            type: 'grid', name: '', schema: [
              { name: 'online_state', selector: { text: {} } },
              { name: 'idle_state', selector: { text: {} } },
            ],
          },
          {
            name: 'uptime_unit',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'timeticks', label: t.units.timeticks },
                  { value: 'seconds', label: t.units.seconds },
                ],
              },
            },
          },
        ],
      },
      {
        type: 'expandable', name: 'appearance_section', flatten: true, title: t.sections.appearance, icon: 'mdi:palette',
        schema: [
          {
            name: 'model',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: 'generic', label: t.generic },
                  ...Object.entries(MODELS).map(([value, m]) => ({ value, label: m.label })),
                ],
              },
            },
          },
          { name: 'illustration', selector: { boolean: {} } },
          {
            name: 'illustration_theme',
            selector: { select: { mode: 'dropdown', options: ['auto', 'day', 'night'].map((v) => ({ value: v, label: t[`theme_${v}`] })) } },
          },
          { name: 'show_title', selector: { boolean: {} } },
          { name: 'show_subtitle', selector: { boolean: {} } },
          { name: 'show_history', selector: { boolean: {} } },
          ...(this.constructor.mini ? [{ name: 'zoom', selector: { boolean: {} } }] : []),
          { name: 'image', selector: { text: {} } },
          {
            type: 'grid', name: '', schema: [
              { name: 'port_start', selector: { number: { min: 0, max: 100, step: 0.5, mode: 'box' } } },
              { name: 'port_step', selector: { number: { min: 0, max: 100, step: 0.5, mode: 'box' } } },
              { name: 'port_bottom', selector: { number: { min: 0, max: 100, step: 0.5, mode: 'box' } } },
            ],
          },
          { name: 'url', selector: { text: { type: 'url' } } },
          {
            name: 'language',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  { value: '', label: t.lang_auto },
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'es', label: 'Español' },
                  { value: 'sr', label: 'Српски' },
                  { value: 'sr-Latn', label: 'Srpski (latinica)' },
                  { value: 'it', label: 'Italiano' },
                  { value: 'nl', label: 'Nederlands' },
                  { value: 'pt', label: 'Português (Portugal)' },
                  { value: 'pl', label: 'Polski' },
                  { value: 'ro', label: 'Română' },
                  { value: 'da', label: 'Dansk' },
                  { value: 'sv', label: 'Svenska' },
                  { value: 'bg', label: 'Български' },
                  { value: 'ru', label: 'Русский' },
                  { value: 'uk', label: 'Українська' },
                  { value: 'hu', label: 'Magyar' },
                  { value: 'sk', label: 'Slovenčina' },
                  { value: 'cs', label: 'Čeština' },
                  { value: 'sl', label: 'Slovenščina' },
                  { value: 'lv', label: 'Latviešu' },
                  { value: 'el', label: 'Ελληνικά' },
                ],
              },
            },
          },
        ],
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const t = I18N[getLang(this._hass, this._config)];
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.addEventListener('value-changed', (ev) => {
        ev.stopPropagation();
        const config = fromForm(ev.detail.value);
        this._config = config;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    // A toggle on by default shows checked while the YAML does not set it.
    this._form.data = toForm(this._config);
    this._form.schema = this._schema(t);
    this._form.computeLabel = (s) => t.fields[s.name] ?? s.name;
    this._form.computeHelper = (s) => {
      const def = DEFAULTS[s.name] ?? STATUS_DEFAULTS[s.name]?.join(' / ');
      return def !== undefined ? `${t.default}${t.colon}${def}` : undefined;
    };
  }
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */
export class HaSwitchMiniCardEditor extends HaSwitchCardEditor {
  static get mini() {
    return true;
  }
}

if (!customElements.get('ha-switch-card')) pickerDefine('ha-switch-card', HaSwitchCard);
if (!customElements.get('ha-switch-card-editor')) pickerDefine('ha-switch-card-editor', HaSwitchCardEditor);
if (!customElements.get('ha-switch-mini-card')) pickerDefine('ha-switch-mini-card', HaSwitchMiniCard);
if (!customElements.get('ha-switch-mini-card-editor')) pickerDefine('ha-switch-mini-card-editor', HaSwitchMiniCardEditor);

export const _t = I18N[getLang()];
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'ha-switch-card')) {
  window.customCards.push({
    type: 'ha-switch-card',
    name: _t.card_name,
    description: _t.card_desc,
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-switch-card',
  });
}
if (!window.customCards.some((c) => c.type === 'ha-switch-mini-card')) {
  window.customCards.push({
    type: 'ha-switch-mini-card',
    name: _t.mini_name,
    description: _t.mini_desc,
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-switch-card',
  });
}

console.info(`%c HA-SWITCH-CARD %c v${VERSION} `, 'color:#fff;background:#43a047;font-weight:700', 'color:#43a047;background:#fff');
