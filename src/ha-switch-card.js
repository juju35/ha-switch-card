/**
 * ha-switch-card — custom Lovelace card for Home Assistant
 * Displays a managed network switch (SNMP): status, uptime, port states, traffic.
 * Pure JavaScript, no dependencies (no mushroom / card-mod / button-card required).
 */
const VERSION = '__VERSION__';

const I18N = {
  fr: {
    card_name: 'Carte switch réseau',
    card_desc: 'Affiche l’état d’un switch réseau : statut, uptime, ports et trafic.',
    in: 'Trafic entrant',
    out: 'Trafic sortant',
    port: 'Port',
    default: 'Défaut',
    colon: ' : ',
    lang_auto: 'Automatique',
    sections: {
      entities: 'Entités',
      ports: 'Ports',
      status: 'Statut',
      appearance: 'Apparence',
    },
    fields: {
      name: 'Nom',
      subtitle: 'Sous-titre',
      icon: 'Icône',
      url: 'URL d’administration (clic sur l’image)',
      switch_entity: 'Interrupteur (alimentation)',
      status_entity: 'Statut global',
      connectivity_entity: 'Connectivité',
      uptime_entity: 'Uptime',
      uptime_unit: 'Unité de l’uptime',
      traffic_in_entity: 'Trafic entrant',
      traffic_out_entity: 'Trafic sortant',
      ports: 'Nombre de ports',
      port_pattern: 'Modèle d’entité des ports ({n} = numéro)',
      port_on_state: 'État « port actif »',
      online_state: 'État « en ligne »',
      idle_state: 'État « inactif »',
      model: 'Modèle (façade dessinée)',
      image: 'Image personnalisée (remplace le modèle)',
      port_start: 'Position du 1er port (%)',
      port_step: 'Écart entre ports (%)',
      port_bottom: 'Hauteur des ports (% depuis le bas)',
      language: 'Langue',
    },
    units: { timeticks: 'Centièmes de seconde (SNMP)', seconds: 'Secondes' },
    day: 'j',
    hour: 'h',
    minute: 'min',
    generic: 'Générique',
    open_admin: 'Ouvrir la page d’administration',
    online: 'En ligne',
    idle: 'Inactif',
  },
  en: {
    card_name: 'Network switch card',
    card_desc: 'Shows a network switch: status, uptime, ports and traffic.',
    in: 'Incoming traffic',
    out: 'Outgoing traffic',
    port: 'Port',
    default: 'Default',
    colon: ': ',
    lang_auto: 'Automatic',
    sections: {
      entities: 'Entities',
      ports: 'Ports',
      status: 'Status',
      appearance: 'Appearance',
    },
    fields: {
      name: 'Name',
      subtitle: 'Subtitle',
      icon: 'Icon',
      url: 'Admin URL (tap on image)',
      switch_entity: 'Power switch',
      status_entity: 'Global status',
      connectivity_entity: 'Connectivity',
      uptime_entity: 'Uptime',
      uptime_unit: 'Uptime unit',
      traffic_in_entity: 'Incoming traffic',
      traffic_out_entity: 'Outgoing traffic',
      ports: 'Number of ports',
      port_pattern: 'Port entity pattern ({n} = number)',
      port_on_state: '"Port up" state',
      online_state: '"Online" state',
      idle_state: '"Idle" state',
      model: 'Model (drawn front panel)',
      image: 'Custom image (overrides model)',
      port_start: 'First port position (%)',
      port_step: 'Spacing between ports (%)',
      port_bottom: 'Port height (% from bottom)',
      language: 'Language',
    },
    units: { timeticks: 'Hundredths of a second (SNMP)', seconds: 'Seconds' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generic',
    open_admin: 'Open the admin page',
    online: 'Online',
    idle: 'Idle',
  },
  de: {
    card_name: 'Netzwerk-Switch-Karte',
    card_desc: 'Zeigt einen Netzwerk-Switch: Status, Betriebszeit, Ports und Datenverkehr.',
    in: 'Eingehender Datenverkehr',
    out: 'Ausgehender Datenverkehr',
    port: 'Port',
    default: 'Standard',
    colon: ': ',
    lang_auto: 'Automatisch',
    sections: {
      entities: 'Entitäten',
      ports: 'Ports',
      status: 'Status',
      appearance: 'Darstellung',
    },
    fields: {
      name: 'Name',
      subtitle: 'Untertitel',
      icon: 'Symbol',
      url: 'Admin-URL (Tippen auf das Bild)',
      switch_entity: 'Netzschalter',
      status_entity: 'Gesamtstatus',
      connectivity_entity: 'Konnektivität',
      uptime_entity: 'Betriebszeit',
      uptime_unit: 'Einheit der Betriebszeit',
      traffic_in_entity: 'Eingehender Datenverkehr',
      traffic_out_entity: 'Ausgehender Datenverkehr',
      ports: 'Anzahl der Ports',
      port_pattern: 'Muster der Port-Entitäten ({n} = Nummer)',
      port_on_state: 'Zustand „Port aktiv“',
      online_state: 'Zustand „Online“',
      idle_state: 'Zustand „Inaktiv“',
      model: 'Modell (gezeichnete Frontblende)',
      image: 'Eigenes Bild (ersetzt das Modell)',
      port_start: 'Position des ersten Ports (%)',
      port_step: 'Abstand zwischen den Ports (%)',
      port_bottom: 'Höhe der Ports (% von unten)',
      language: 'Sprache',
    },
    units: { timeticks: 'Hundertstelsekunden (SNMP)', seconds: 'Sekunden' },
    day: 'T',
    hour: 'h',
    minute: 'min',
    generic: 'Generisch',
    open_admin: 'Admin-Seite öffnen',
    online: 'Online',
    idle: 'Inaktiv',
  },
  es: {
    card_name: 'Tarjeta de switch de red',
    card_desc: 'Muestra un switch de red: estado, tiempo de actividad, puertos y tráfico.',
    in: 'Tráfico entrante',
    out: 'Tráfico saliente',
    port: 'Puerto',
    default: 'Predeterminado',
    colon: ': ',
    lang_auto: 'Automático',
    sections: {
      entities: 'Entidades',
      ports: 'Puertos',
      status: 'Estado',
      appearance: 'Apariencia',
    },
    fields: {
      name: 'Nombre',
      subtitle: 'Subtítulo',
      icon: 'Icono',
      url: 'URL de administración (toca la imagen)',
      switch_entity: 'Interruptor de alimentación',
      status_entity: 'Estado general',
      connectivity_entity: 'Conectividad',
      uptime_entity: 'Tiempo de actividad',
      uptime_unit: 'Unidad del tiempo de actividad',
      traffic_in_entity: 'Tráfico entrante',
      traffic_out_entity: 'Tráfico saliente',
      ports: 'Número de puertos',
      port_pattern: 'Patrón de entidad de los puertos ({n} = número)',
      port_on_state: 'Estado «puerto activo»',
      online_state: 'Estado «en línea»',
      idle_state: 'Estado «inactivo»',
      model: 'Modelo (panel frontal dibujado)',
      image: 'Imagen personalizada (reemplaza el modelo)',
      port_start: 'Posición del primer puerto (%)',
      port_step: 'Separación entre puertos (%)',
      port_bottom: 'Altura de los puertos (% desde abajo)',
      language: 'Idioma',
    },
    units: { timeticks: 'Centésimas de segundo (SNMP)', seconds: 'Segundos' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Genérico',
    open_admin: 'Abrir la página de administración',
    online: 'En línea',
    idle: 'Inactivo',
  },
  sr: {
    card_name: 'Картица мрежног свича',
    card_desc: 'Приказује мрежни свич: статус, време рада, портове и саобраћај.',
    in: 'Долазни саобраћај',
    out: 'Одлазни саобраћај',
    port: 'Порт',
    default: 'Подразумевано',
    colon: ': ',
    lang_auto: 'Аутоматски',
    sections: {
      entities: 'Ентитети',
      ports: 'Портови',
      status: 'Статус',
      appearance: 'Изглед',
    },
    fields: {
      name: 'Назив',
      subtitle: 'Поднаслов',
      icon: 'Иконица',
      url: 'URL за администрацију (додир на слику)',
      switch_entity: 'Прекидач напајања',
      status_entity: 'Општи статус',
      connectivity_entity: 'Повезаност',
      uptime_entity: 'Време рада',
      uptime_unit: 'Јединица времена рада',
      traffic_in_entity: 'Долазни саобраћај',
      traffic_out_entity: 'Одлазни саобраћај',
      ports: 'Број портова',
      port_pattern: 'Шаблон ентитета портова ({n} = број)',
      port_on_state: 'Стање „порт активан“',
      online_state: 'Стање „на мрежи“',
      idle_state: 'Стање „неактиван“',
      model: 'Модел (нацртана предња плоча)',
      image: 'Прилагођена слика (замењује модел)',
      port_start: 'Положај првог порта (%)',
      port_step: 'Размак између портова (%)',
      port_bottom: 'Висина портова (% од дна)',
      language: 'Језик',
    },
    units: { timeticks: 'Стотинке секунде (SNMP)', seconds: 'Секунде' },
    day: 'д',
    hour: 'ч',
    minute: 'мин',
    generic: 'Генерички',
    open_admin: 'Отвори страницу за администрацију',
    online: 'На мрежи',
    idle: 'Неактиван',
  },
  'sr-Latn': {
    card_name: 'Kartica mrežnog sviča',
    card_desc: 'Prikazuje mrežni svič: status, vreme rada, portove i saobraćaj.',
    in: 'Dolazni saobraćaj',
    out: 'Odlazni saobraćaj',
    port: 'Port',
    default: 'Podrazumevano',
    colon: ': ',
    lang_auto: 'Automatski',
    sections: {
      entities: 'Entiteti',
      ports: 'Portovi',
      status: 'Status',
      appearance: 'Izgled',
    },
    fields: {
      name: 'Naziv',
      subtitle: 'Podnaslov',
      icon: 'Ikonica',
      url: 'URL za administraciju (dodir na sliku)',
      switch_entity: 'Prekidač napajanja',
      status_entity: 'Opšti status',
      connectivity_entity: 'Povezanost',
      uptime_entity: 'Vreme rada',
      uptime_unit: 'Jedinica vremena rada',
      traffic_in_entity: 'Dolazni saobraćaj',
      traffic_out_entity: 'Odlazni saobraćaj',
      ports: 'Broj portova',
      port_pattern: 'Šablon entiteta portova ({n} = broj)',
      port_on_state: 'Stanje „port aktivan“',
      online_state: 'Stanje „na mreži“',
      idle_state: 'Stanje „neaktivan“',
      model: 'Model (nacrtana prednja ploča)',
      image: 'Prilagođena slika (zamenjuje model)',
      port_start: 'Položaj prvog porta (%)',
      port_step: 'Razmak između portova (%)',
      port_bottom: 'Visina portova (% od dna)',
      language: 'Jezik',
    },
    units: { timeticks: 'Stotinke sekunde (SNMP)', seconds: 'Sekunde' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generički',
    open_admin: 'Otvori stranicu za administraciju',
    online: 'Na mreži',
    idle: 'Neaktivan',
  },
  it: {
    card_name: 'Scheda switch di rete',
    card_desc: 'Mostra uno switch di rete: stato, tempo di attività, porte e traffico.',
    in: 'Traffico in entrata',
    out: 'Traffico in uscita',
    port: 'Porta',
    default: 'Predefinito',
    colon: ': ',
    lang_auto: 'Automatico',
    sections: {
      entities: 'Entità',
      ports: 'Porte',
      status: 'Stato',
      appearance: 'Aspetto',
    },
    fields: {
      name: 'Nome',
      subtitle: 'Sottotitolo',
      icon: 'Icona',
      url: 'URL di amministrazione (tocco sull’immagine)',
      switch_entity: 'Interruttore di alimentazione',
      status_entity: 'Stato generale',
      connectivity_entity: 'Connettività',
      uptime_entity: 'Tempo di attività',
      uptime_unit: 'Unità del tempo di attività',
      traffic_in_entity: 'Traffico in entrata',
      traffic_out_entity: 'Traffico in uscita',
      ports: 'Numero di porte',
      port_pattern: 'Schema delle entità delle porte ({n} = numero)',
      port_on_state: 'Stato «porta attiva»',
      online_state: 'Stato «online»',
      idle_state: 'Stato «inattivo»',
      model: 'Modello (pannello frontale disegnato)',
      image: 'Immagine personalizzata (sostituisce il modello)',
      port_start: 'Posizione della prima porta (%)',
      port_step: 'Distanza tra le porte (%)',
      port_bottom: 'Altezza delle porte (% dal basso)',
      language: 'Lingua',
    },
    units: { timeticks: 'Centesimi di secondo (SNMP)', seconds: 'Secondi' },
    day: 'g',
    hour: 'h',
    minute: 'min',
    generic: 'Generico',
    open_admin: 'Apri la pagina di amministrazione',
    online: 'Online',
    idle: 'Inattivo',
  },
  nl: {
    card_name: 'Netwerkswitchkaart',
    card_desc: 'Toont een netwerkswitch: status, uptime, poorten en verkeer.',
    in: 'Inkomend verkeer',
    out: 'Uitgaand verkeer',
    port: 'Poort',
    default: 'Standaard',
    colon: ': ',
    lang_auto: 'Automatisch',
    sections: {
      entities: 'Entiteiten',
      ports: 'Poorten',
      status: 'Status',
      appearance: 'Uiterlijk',
    },
    fields: {
      name: 'Naam',
      subtitle: 'Ondertitel',
      icon: 'Pictogram',
      url: 'Beheer-URL (tik op de afbeelding)',
      switch_entity: 'Voedingsschakelaar',
      status_entity: 'Algemene status',
      connectivity_entity: 'Connectiviteit',
      uptime_entity: 'Uptime',
      uptime_unit: 'Eenheid van de uptime',
      traffic_in_entity: 'Inkomend verkeer',
      traffic_out_entity: 'Uitgaand verkeer',
      ports: 'Aantal poorten',
      port_pattern: 'Patroon van de poortentiteiten ({n} = nummer)',
      port_on_state: 'Status „poort actief”',
      online_state: 'Status „online”',
      idle_state: 'Status „inactief”',
      model: 'Model (getekend frontpaneel)',
      image: 'Eigen afbeelding (vervangt het model)',
      port_start: 'Positie van de eerste poort (%)',
      port_step: 'Afstand tussen de poorten (%)',
      port_bottom: 'Hoogte van de poorten (% van onderen)',
      language: 'Taal',
    },
    units: { timeticks: 'Honderdsten van een seconde (SNMP)', seconds: 'Seconden' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generiek',
    open_admin: 'Beheerpagina openen',
    online: 'Online',
    idle: 'Inactief',
  },
  pt: {
    card_name: 'Cartão de switch de rede',
    card_desc: 'Mostra um switch de rede: estado, tempo de atividade, portas e tráfego.',
    in: 'Tráfego de entrada',
    out: 'Tráfego de saída',
    port: 'Porta',
    default: 'Predefinição',
    colon: ': ',
    lang_auto: 'Automático',
    sections: {
      entities: 'Entidades',
      ports: 'Portas',
      status: 'Estado',
      appearance: 'Aspeto',
    },
    fields: {
      name: 'Nome',
      subtitle: 'Subtítulo',
      icon: 'Ícone',
      url: 'URL de administração (toque na imagem)',
      switch_entity: 'Interruptor de alimentação',
      status_entity: 'Estado geral',
      connectivity_entity: 'Conectividade',
      uptime_entity: 'Tempo de atividade',
      uptime_unit: 'Unidade do tempo de atividade',
      traffic_in_entity: 'Tráfego de entrada',
      traffic_out_entity: 'Tráfego de saída',
      ports: 'Número de portas',
      port_pattern: 'Padrão de entidade das portas ({n} = número)',
      port_on_state: 'Estado «porta ativa»',
      online_state: 'Estado «online»',
      idle_state: 'Estado «inativo»',
      model: 'Modelo (painel frontal desenhado)',
      image: 'Imagem personalizada (substitui o modelo)',
      port_start: 'Posição da primeira porta (%)',
      port_step: 'Espaçamento entre portas (%)',
      port_bottom: 'Altura das portas (% de baixo)',
      language: 'Idioma',
    },
    units: { timeticks: 'Centésimos de segundo (SNMP)', seconds: 'Segundos' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Genérico',
    open_admin: 'Abrir a página de administração',
    online: 'Online',
    idle: 'Inativo',
  },
  pl: {
    card_name: 'Karta przełącznika sieciowego',
    card_desc: 'Pokazuje przełącznik sieciowy: status, czas działania, porty i ruch.',
    in: 'Ruch przychodzący',
    out: 'Ruch wychodzący',
    port: 'Port',
    default: 'Domyślnie',
    colon: ': ',
    lang_auto: 'Automatycznie',
    sections: {
      entities: 'Encje',
      ports: 'Porty',
      status: 'Status',
      appearance: 'Wygląd',
    },
    fields: {
      name: 'Nazwa',
      subtitle: 'Podtytuł',
      icon: 'Ikona',
      url: 'Adres URL administracji (dotknięcie obrazu)',
      switch_entity: 'Przełącznik zasilania',
      status_entity: 'Status ogólny',
      connectivity_entity: 'Łączność',
      uptime_entity: 'Czas działania',
      uptime_unit: 'Jednostka czasu działania',
      traffic_in_entity: 'Ruch przychodzący',
      traffic_out_entity: 'Ruch wychodzący',
      ports: 'Liczba portów',
      port_pattern: 'Wzorzec encji portów ({n} = numer)',
      port_on_state: 'Stan „port aktywny”',
      online_state: 'Stan „online”',
      idle_state: 'Stan „bezczynny”',
      model: 'Model (rysowany panel przedni)',
      image: 'Własny obraz (zastępuje model)',
      port_start: 'Pozycja pierwszego portu (%)',
      port_step: 'Odstęp między portami (%)',
      port_bottom: 'Wysokość portów (% od dołu)',
      language: 'Język',
    },
    units: { timeticks: 'Setne części sekundy (SNMP)', seconds: 'Sekundy' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Ogólny',
    open_admin: 'Otwórz stronę administracyjną',
    online: 'Online',
    idle: 'Bezczynny',
  },
};

const DEFAULTS = {
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
const STATUS_DEFAULTS = {
  online_state: ['Online', 'En ligne'],
  idle_state: ['Idle', 'Inactif'],
};

// Whether a status state is the configured `online_state` / `idle_state` (or one of its defaults).
const statusIs = (state, config, key) => {
  if (state == null) return false;
  const norm = (v) => String(v).trim().toLowerCase();
  const wanted = config[key] != null && config[key] !== '' ? [config[key]] : STATUS_DEFAULTS[key];
  return wanted.some((v) => norm(v) === norm(state));
};

// Theme colors with the Home Assistant defaults as fallbacks, like the other juju35 cards.
const COLORS = {
  green: 'var(--success-color, #43a047)',
  orange: 'var(--warning-color, #ffa600)',
  red: 'var(--error-color, #db4437)',
  blue: 'var(--info-color, #039be5)',
  grey: 'var(--disabled-text-color, #9e9e9e)',
  neutral: 'var(--secondary-text-color, #727272)',
};

// Darker shade of a port color, for its contacts and LEDs.
const shade = (color) => `color-mix(in srgb, ${color} 45%, #000)`;

// `language` from the card config wins over the Home Assistant language. The full code when it has its own
// dictionary (`sr-Latn`), else its base language (`fr-FR` → `fr`), else English.
const getLang = (hass, config) => {
  const l = String(config?.language || hass?.locale?.language || hass?.language || navigator.language || 'en');
  const base = l.split('-')[0];
  return I18N[l] ? l : I18N[base] ? base : 'en';
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Admin URLs opened on a tap: only http(s) and same-origin relative paths, never javascript:/data:
// or protocol-relative //evil.com from a YAML config. The browser's URL parser reads `\` as `/` and drops
// tabs and newlines, so `/\evil.com` or `/<tab>/evil.com` would also open evil.com: a relative path with
// any of these characters is rejected.
const isSafeUrl = (url) => {
  const s = String(url ?? '');
  return /^https?:\/\//i.test(s) || (/^\/(?!\/)/.test(s) && !/[\\\t\n\r]/.test(s));
};

// After a successful power toggle call, how long to wait for the switch to report its new state
// before redrawing the toggle from the unchanged one.
const TOGGLE_CHECK_MS = 2000;

// An entity Home Assistant has no value for: drawn grey (state unknown), not red (off / down).
const isUnavailable = (st) => st?.state === 'unavailable' || st?.state === 'unknown';

// A config number (port overlay position), or its default when the YAML value is not a number.
const num = (v, def) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : def);

const formatBytes = (v) => {
  if (!Number.isFinite(v)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
};

// Uptime as "12d 16h 15min", with the unit letters of the card language (day / hour / minute of its I18N entry).
const formatUptime = (raw, unit, u = { day: 'd', hour: 'h', minute: 'min' }) => {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return '—';
  const t = unit === 'seconds' ? n : Math.floor(n / 100);
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${d > 0 ? `${d}${u.day} ` : ''}${h}${u.hour} ${m}${u.minute}`;
};

const portSvg = (color, dark) => `
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
const GS308T = { H: 150, CELL: 62, GAP: 8, GROUP_GAP: 16, X0: 150, BEZEL_Y: 38, PORT_Y: 52, PORT_H: 44 };
const gs308tSvg = (ports, powerColor, portLabel) => {
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
          <text x="${cx}" y="${g.PORT_Y + g.PORT_H + 30}" text-anchor="middle" font-size="13" fill="#d6d6d6">${i + 1}</text>`;
    return p
      ? `<g class="port" data-entity="${esc(p.id)}" role="button" tabindex="0"><title>${esc(portLabel)} ${p.n}</title>${body}</g>`
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
      <rect x="2" y="4" width="${W - 4}" height="134" rx="6" fill="url(#ng-body)"/>
      <rect x="2" y="4" width="${W - 4}" height="6" rx="3" fill="#ffffff" opacity="0.07"/>
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
const MODELS = {
  gs308t: { label: 'Netgear GS308T (S350)', ports: 8, svg: gs308tSvg },
};

/**
 * Built-in front panel of a desktop switch, drawn as SVG.
 * Up to 12 ports on one row; beyond, odd ports on top and even ports below (like real switches).
 */
const chassisSvg = (ports, powerColor, portLabel) => {
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
    .map(({ n, id, colors: [col, dark] }, i) => {
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
          <title>${esc(portLabel)} ${n}</title>
          <rect x="${x - 2}" y="${y - 2}" width="44" height="40" rx="4" class="hs-slot"/>
          <path d="M${x} ${y + 6} h10 v-6 h20 v6 h10 v28 h-40 z" style="fill:${col}"/>
          ${contacts}
          <rect x="${x + 4}" y="${y + 26}" width="8" height="4" rx="1" style="fill:${dark}" opacity="0.8"/>
          <rect x="${x + 28}" y="${y + 26}" width="8" height="4" rx="1" style="fill:${dark}" opacity="0.8"/>
          <text x="${x + 20}" y="${labelY}" text-anchor="middle" font-size="11" class="hs-label">${n}</text>
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
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="url(#hs-body)" class="hs-edge" stroke-width="2"/>
      <rect x="6" y="5" width="${W - 12}" height="2" rx="1" fill="#ffffff" opacity="0.08"/>
      ${vents}
      <circle cx="132" cy="${H / 2 - 6}" r="5" style="fill:${powerColor}"/>
      <circle cx="132" cy="${H / 2 - 6}" r="9" style="fill:${powerColor}" opacity="0.25"/>
      <text x="132" y="${H / 2 + 18}" text-anchor="middle" font-size="10" class="hs-label">PWR</text>
      <rect x="156" y="14" width="1.5" height="${H - 28}" class="hs-divider"/>
      ${slots}
    </svg>`;
};

// Port count shared by the drawing and the watched entities: 8 when `ports` is not a number.
function portCount(c) {
  return Math.max(1, Number(c.ports) || 8);
}

// Config mistakes the editor prevents but YAML allows.
// Each message is logged once per page: HA calls setConfig on the preview at every keystroke in the editor.
const warned = new Set();
function configWarnings(c) {
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

// Identifies a focusable element across renders (the header icon and a chip can share an entity).
const focusKey = (el) =>
  el?.getAttribute?.('tabindex') != null
    ? [el.getAttribute('class'), el.getAttribute('data-entity'), el.getAttribute('data-url')].join('|')
    : '';

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
class HaSwitchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._key = '';
    this.shadowRoot.addEventListener('click', (ev) => this._onClick(ev));
    // Ports, tiles, chips, the header icon and the admin link are focusable: Enter or Space opens them like a click.
    this.shadowRoot.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      if (!ev.composedPath().some((el) => ['button', 'link'].includes(el.getAttribute?.('role')))) return;
      ev.preventDefault();
      this._onClick(ev);
    });
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
    return formatBytes(v);
  }

  _moreInfo(entityId) {
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  _onClick(ev) {
    const path = ev.composedPath();
    if (path.some((el) => el.tagName === 'HA-SWITCH')) return;
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
    const key = lang + this._configKey + this._watchedIds.map(entityKey).join('|');
    if (key === this._key) return;
    this._key = key;

    const t = I18N[lang];
    const statusColor = this._statusColor();
    const sw = this._state(c.switch_entity);

    /* status pill (header, right of the title) and chips */
    const chips = [];
    let conChip = '';
    const con = this._state(c.connectivity_entity);
    if (c.connectivity_entity) {
      const on = con?.state === 'on';
      // Unreachable (unavailable / unknown) is grey with a question mark, not the red "network off" of a real outage.
      const unknown = !con || isUnavailable(con);
      const icon = unknown ? 'mdi:help-network-outline' : on ? 'mdi:network-outline' : 'mdi:network-off-outline';
      conChip = this._chip(c.connectivity_entity, icon, unknown ? COLORS.grey : on ? COLORS.green : COLORS.red, this._formatState(con));
    }
    let pill = '';
    const st = this._state(c.status_entity);
    if (c.status_entity) {
      // Online / idle read in the card's language, whatever the sensor reports; any other state as Home Assistant shows it.
      const online = statusIs(st?.state, c, 'online_state');
      const idle = !online && statusIs(st?.state, c, 'idle_state');
      const icon = online ? 'mdi:check-circle' : idle ? 'mdi:minus-circle' : !st || isUnavailable(st) ? 'mdi:help-circle' : 'mdi:alert-circle';
      pill = this._chip(c.status_entity, icon, statusColor, online ? t.online : idle ? t.idle : this._formatState(st));
      if (conChip) chips.push(conChip);
    } else {
      // No status sensor: connectivity is the header status.
      pill = conChip;
    }
    if (c.uptime_entity) {
      // Unavailable / unknown read as Home Assistant shows them (translated), not as a dash or a duration.
      const up = this._state(c.uptime_entity);
      chips.push(this._chip(c.uptime_entity, 'mdi:clock-outline', COLORS.neutral, isUnavailable(up) ? this._formatState(up) : formatUptime(up?.state, c.uptime_unit, t)));
    }

    /* ports */
    const count = this._portCount();
    const portInfo = [];
    for (let n = 1; n <= count; n++) {
      const id = this._portEntity(n);
      const ps = this._state(id);
      const up = ps?.state === String(c.port_on_state);
      // Missing, unavailable or unknown: grey, so a dead SNMP poll does not show every port as down.
      const color = !ps || isUnavailable(ps) ? COLORS.grey : up ? COLORS.green : COLORS.red;
      portInfo.push({ n, id, colors: [color, shade(color)] });
    }
    const urlAttr = c.url ? `data-url="${esc(c.url)}" role="link" tabindex="0" aria-label="${esc(t.open_admin)}"` : '';
    let device;
    if (c.image) {
      const ports = portInfo.map(
        ({ n, id, colors }) =>
          `<div class="port" style="left:${num(c.port_start, DEFAULTS.port_start) + (n - 1) * num(c.port_step, DEFAULTS.port_step)}%" data-entity="${esc(id)}" role="button" tabindex="0" title="${t.port} ${n}">${portSvg(...colors)}</div>`
      );
      device = `<div class="device img" ${urlAttr}>
           <img src="${esc(c.image)}" alt="">
           <div class="ports abs" style="bottom:${num(c.port_bottom, DEFAULTS.port_bottom)}%">${ports.join('')}</div>
         </div>`;
    } else if (MODELS[c.model]) {
      const m = MODELS[c.model];
      device = `<div class="device" ${urlAttr}>${m.svg(portInfo, statusColor, t.port)}</div>`;
    } else {
      device = `<div class="device" ${urlAttr}>${chassisSvg(portInfo, statusColor, t.port)}</div>`;
    }

    /* traffic */
    const tile = (id, icon, color, label) =>
      id
        ? `<div class="tile" data-entity="${esc(id)}" role="button" tabindex="0">
             <div class="ic" style="--c:${color}"><ha-icon icon="${icon}"></ha-icon></div>
             <div class="txt"><div class="k">${label}</div><div class="v">${esc(this._formatTraffic(this._state(id)))}</div></div>
           </div>`
        : '';
    const traffic = tile(c.traffic_in_entity, 'mdi:arrow-down-bold', COLORS.green, t.in) + tile(c.traffic_out_entity, 'mdi:arrow-up-bold', COLORS.blue, t.out);

    const focused = focusKey(this.shadowRoot.activeElement);
    this.shadowRoot.innerHTML = `
      <style>${HaSwitchCard.styles}</style>
      <ha-card>
        <div class="header">
          <div class="ic big" style="--c:${statusColor}" ${headerEntity ? `data-entity="${esc(headerEntity)}" role="button" tabindex="0" aria-label="${esc(this._state(headerEntity)?.attributes?.friendly_name || headerEntity)}"` : ''}>
            <ha-icon icon="${esc(c.icon)}"></ha-icon>
          </div>
          <div class="titles">
            <div class="title-row"><div class="name">${esc(c.name)}</div>${pill}</div>
            ${c.subtitle ? `<div class="sub">${esc(c.subtitle)}</div>` : ''}
          </div>
          ${sw ? `<ha-switch></ha-switch>` : ''}
        </div>
        ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
        ${device}
        ${traffic ? `<div class="traffic">${traffic}</div>` : ''}
      </ha-card>`;

    // innerHTML replaced the focused element: focus its counterpart so keyboard navigation keeps its place.
    if (focused) {
      const again = [...this.shadowRoot.querySelectorAll('[tabindex]')].find((el) => focusKey(el) === focused);
      again?.focus({ preventScroll: true });
    }

    const toggle = this.shadowRoot.querySelector('ha-switch');
    if (toggle && sw) {
      toggle.checked = sw.state === 'on';
      toggle.disabled = sw.state === 'unavailable' || sw.state === 'unknown';
      toggle.addEventListener('change', (ev) => {
        const [domain] = c.switch_entity.split('.');
        const before = sw.state;
        // When the call fails, or succeeds but the entity keeps its state (a switch that does not answer),
        // the render key does not change and the toggle would stay visually flipped: redraw from the real state.
        // A failure redraws at once. A success waits: MQTT, cloud or polled SNMP switches report their new state
        // after the call returns, and an immediate redraw would bounce the toggle back until it arrives.
        const redraw = () => {
          this._key = '';
          this._render();
        };
        clearTimeout(this._toggleCheck);
        Promise.resolve(this._hass.callService(domain, ev.target.checked ? 'turn_on' : 'turn_off', { entity_id: c.switch_entity })).then(
          () => {
            // One pending check per card, even when the calls of quick successive clicks settle out of order.
            clearTimeout(this._toggleCheck);
            this._toggleCheck = setTimeout(() => {
              if (this._state(c.switch_entity)?.state === before) redraw();
            }, TOGGLE_CHECK_MS);
          },
          redraw
        );
      });
    }
  }

  _chip(entity, icon, color, content) {
    // The full text also in title / aria-label: the pill may be truncated, or reduced to its icon on a narrow card.
    return `<div class="chip" style="--c:${color}" data-entity="${esc(entity)}" role="button" tabindex="0" title="${esc(content)}" aria-label="${esc(content)}">
      <ha-icon icon="${icon}"></ha-icon><span>${esc(content)}</span>
    </div>`;
  }

  static get styles() {
    return `
      :host {
        --hs-body-top: color-mix(in srgb, var(--primary-text-color, #212121) 24%, var(--card-background-color, #fff));
        --hs-body-bottom: color-mix(in srgb, var(--primary-text-color, #212121) 14%, var(--card-background-color, #fff));
        --hs-dark: color-mix(in srgb, var(--primary-text-color, #212121) 45%, var(--card-background-color, #fff));
      }
      ha-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
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
      .titles { flex: 1 1 0; min-width: 0; }
      /* The status pill shares the title's line, right of the name (left of the power toggle), whatever the subtitle.
         The name only takes the room the pill leaves (flex-basis 0), but keeps about four characters: when the pill's
         full text no longer fits beside them, the pill wraps under the name with its whole text, and is only cut
         with an ellipsis when even a line of its own is too short. */
      .title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; }
      .title-row > .name { flex: 1 1 0; min-width: 5ch; }
      .title-row > .chip { flex: 0 1 auto; min-width: 0; overflow: hidden; }
      .title-row > .chip ha-icon { flex: none; }
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
      .device { position: relative; width: 100%; border-radius: 10px; overflow: hidden; }
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
      .traffic { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
      .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
              background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .tile .ic { --mdc-icon-size: 20px; }
      .tile .txt { min-width: 0; }
      .tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tile .v { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
    `;
  }
}

/* ------------------------------------------------------------------ */
/* Visual editor                                                       */
/* ------------------------------------------------------------------ */
class HaSwitchCardEditor extends HTMLElement {
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
        const config = { ...ev.detail.value };
        Object.keys(config).forEach((k) => {
          if (config[k] === '' || config[k] === undefined) delete config[k];
        });
        this._config = config;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
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
if (!customElements.get('ha-switch-card')) customElements.define('ha-switch-card', HaSwitchCard);
if (!customElements.get('ha-switch-card-editor')) customElements.define('ha-switch-card-editor', HaSwitchCardEditor);

const _t = I18N[getLang()];
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

console.info(`%c HA-SWITCH-CARD %c v${VERSION} `, 'color:#fff;background:#43a047;font-weight:700', 'color:#43a047;background:#fff');
