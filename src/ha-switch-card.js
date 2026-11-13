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
    in: 'Réception',
    out: 'Envoi',
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
      port_names: 'Noms des ports (dans l’ordre)',
      watched_ports: 'Ports surveillés (rouges si coupés)',
      show_history: 'Historique 24 h du trafic',
      show_title: 'Afficher le titre',
      zoom: 'Bouton détail',
      confirm_off: 'Confirmer avant d’éteindre',
    },
    units: { timeticks: 'Centièmes de seconde (SNMP)', seconds: 'Secondes' },
    day: 'j',
    hour: 'h',
    minute: 'min',
    generic: 'Générique',
    open_admin: 'Ouvrir la page d’administration',
    online: 'En ligne',
    idle: 'Inactif',
    total: 'Total',
    zoom_in: 'Afficher la carte complète',
    zoom_out: 'Revenir à la vue compacte',
    confirm_text: 'Éteindre {name} ?',
    cancel: 'Annuler',
    turn_off: 'Éteindre',
    power: 'Alimentation',
    mini_name: 'Mini-carte switch réseau',
    mini_desc: 'Switch réseau compact : façade, ports et trafic, avec un bouton pour afficher la carte complète.',
  },
  en: {
    card_name: 'Network switch card',
    card_desc: 'Shows a network switch: status, uptime, ports and traffic.',
    in: 'Download',
    out: 'Upload',
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
      port_names: 'Port names (in order)',
      watched_ports: 'Watched ports (red when down)',
      show_history: '24 h traffic history',
      show_title: 'Show title',
      zoom: 'Detail button',
      confirm_off: 'Confirm before turning off',
    },
    units: { timeticks: 'Hundredths of a second (SNMP)', seconds: 'Seconds' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generic',
    open_admin: 'Open the admin page',
    online: 'Online',
    idle: 'Idle',
    total: 'Total',
    zoom_in: 'Show the full card',
    zoom_out: 'Back to the compact view',
    confirm_text: 'Turn off {name}?',
    cancel: 'Cancel',
    turn_off: 'Turn off',
    power: 'Power',
    mini_name: 'Network switch mini card',
    mini_desc: 'Compact network switch: front panel, ports and traffic, with a button to show the full card.',
  },
  de: {
    card_name: 'Netzwerk-Switch-Karte',
    card_desc: 'Zeigt einen Netzwerk-Switch: Status, Betriebszeit, Ports und Datenverkehr.',
    in: 'Download',
    out: 'Upload',
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
      port_names: 'Portnamen (in Reihenfolge)',
      watched_ports: 'Überwachte Ports (rot bei Ausfall)',
      show_history: '24-h-Verlauf des Datenverkehrs',
      show_title: 'Titel anzeigen',
      zoom: 'Detail-Schaltfläche',
      confirm_off: 'Vor dem Ausschalten bestätigen',
    },
    units: { timeticks: 'Hundertstelsekunden (SNMP)', seconds: 'Sekunden' },
    day: 'T',
    hour: 'h',
    minute: 'min',
    generic: 'Generisch',
    open_admin: 'Admin-Seite öffnen',
    online: 'Online',
    idle: 'Inaktiv',
    total: 'Gesamt',
    zoom_in: 'Vollständige Karte anzeigen',
    zoom_out: 'Zurück zur kompakten Ansicht',
    confirm_text: '{name} ausschalten?',
    cancel: 'Abbrechen',
    turn_off: 'Ausschalten',
    power: 'Stromversorgung',
    mini_name: 'Netzwerk-Switch-Minikarte',
    mini_desc: 'Kompakter Netzwerk-Switch: Frontansicht, Ports und Datenverkehr, mit einer Schaltfläche für die vollständige Karte.',
  },
  es: {
    card_name: 'Tarjeta de switch de red',
    card_desc: 'Muestra un switch de red: estado, tiempo de actividad, puertos y tráfico.',
    in: 'Descarga',
    out: 'Subida',
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
      port_names: 'Nombres de los puertos (en orden)',
      watched_ports: 'Puertos vigilados (rojos si caen)',
      show_history: 'Historial de 24 h del tráfico',
      show_title: 'Mostrar el título',
      zoom: 'Botón de detalle',
      confirm_off: 'Confirmar antes de apagar',
    },
    units: { timeticks: 'Centésimas de segundo (SNMP)', seconds: 'Segundos' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Genérico',
    open_admin: 'Abrir la página de administración',
    online: 'En línea',
    idle: 'Inactivo',
    total: 'Total',
    zoom_in: 'Mostrar la tarjeta completa',
    zoom_out: 'Volver a la vista compacta',
    confirm_text: '¿Apagar {name}?',
    cancel: 'Cancelar',
    turn_off: 'Apagar',
    power: 'Alimentación',
    mini_name: 'Minitarjeta de switch de red',
    mini_desc: 'Switch de red compacto: frontal, puertos y tráfico, con un botón para mostrar la tarjeta completa.',
  },
  sr: {
    card_name: 'Картица мрежног свича',
    card_desc: 'Приказује мрежни свич: статус, време рада, портове и саобраћај.',
    in: 'Преузимање',
    out: 'Слање',
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
      port_names: 'Називи портова (редом)',
      watched_ports: 'Праћени портови (црвени када падну)',
      show_history: 'Историја саобраћаја за 24 ч',
      show_title: 'Прикажи наслов',
      zoom: 'Дугме за детаље',
      confirm_off: 'Потврди пре искључивања',
    },
    units: { timeticks: 'Стотинке секунде (SNMP)', seconds: 'Секунде' },
    day: 'д',
    hour: 'ч',
    minute: 'мин',
    generic: 'Генерички',
    open_admin: 'Отвори страницу за администрацију',
    online: 'На мрежи',
    idle: 'Неактиван',
    total: 'Укупно',
    zoom_in: 'Прикажи целу картицу',
    zoom_out: 'Назад на компактни приказ',
    confirm_text: 'Искључити {name}?',
    cancel: 'Откажи',
    turn_off: 'Искључи',
    power: 'Напајање',
    mini_name: 'Мини картица мрежног свича',
    mini_desc: 'Компактни мрежни свич: предња плоча, портови и саобраћај, са дугметом за целу картицу.',
  },
  'sr-Latn': {
    card_name: 'Kartica mrežnog sviča',
    card_desc: 'Prikazuje mrežni svič: status, vreme rada, portove i saobraćaj.',
    in: 'Preuzimanje',
    out: 'Slanje',
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
      port_names: 'Nazivi portova (redom)',
      watched_ports: 'Praćeni portovi (crveni kada padnu)',
      show_history: 'Istorija saobraćaja za 24 č',
      show_title: 'Prikaži naslov',
      zoom: 'Dugme za detalje',
      confirm_off: 'Potvrdi pre isključivanja',
    },
    units: { timeticks: 'Stotinke sekunde (SNMP)', seconds: 'Sekunde' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generički',
    open_admin: 'Otvori stranicu za administraciju',
    online: 'Na mreži',
    idle: 'Neaktivan',
    total: 'Ukupno',
    zoom_in: 'Prikaži celu karticu',
    zoom_out: 'Nazad na kompaktni prikaz',
    confirm_text: 'Isključiti {name}?',
    cancel: 'Otkaži',
    turn_off: 'Isključi',
    power: 'Napajanje',
    mini_name: 'Mini kartica mrežnog sviča',
    mini_desc: 'Kompaktni mrežni svič: prednja ploča, portovi i saobraćaj, sa dugmetom za celu karticu.',
  },
  it: {
    card_name: 'Scheda switch di rete',
    card_desc: 'Mostra uno switch di rete: stato, tempo di attività, porte e traffico.',
    in: 'Download',
    out: 'Upload',
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
      port_names: 'Nomi delle porte (in ordine)',
      watched_ports: 'Porte sorvegliate (rosse se giù)',
      show_history: 'Storico 24 h del traffico',
      show_title: 'Mostra il titolo',
      zoom: 'Pulsante dettagli',
      confirm_off: 'Conferma prima di spegnere',
    },
    units: { timeticks: 'Centesimi di secondo (SNMP)', seconds: 'Secondi' },
    day: 'g',
    hour: 'h',
    minute: 'min',
    generic: 'Generico',
    open_admin: 'Apri la pagina di amministrazione',
    online: 'Online',
    idle: 'Inattivo',
    total: 'Totale',
    zoom_in: 'Mostra la scheda completa',
    zoom_out: 'Torna alla vista compatta',
    confirm_text: 'Spegnere {name}?',
    cancel: 'Annulla',
    turn_off: 'Spegni',
    power: 'Alimentazione',
    mini_name: 'Mini scheda switch di rete',
    mini_desc: 'Switch di rete compatto: frontale, porte e traffico, con un pulsante per la scheda completa.',
  },
  nl: {
    card_name: 'Netwerkswitchkaart',
    card_desc: 'Toont een netwerkswitch: status, uptime, poorten en verkeer.',
    in: 'Download',
    out: 'Upload',
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
      port_names: 'Poortnamen (op volgorde)',
      watched_ports: 'Bewaakte poorten (rood bij uitval)',
      show_history: '24-uursgeschiedenis van het verkeer',
      show_title: 'Titel tonen',
      zoom: 'Detailknop',
      confirm_off: 'Bevestigen voor uitschakelen',
    },
    units: { timeticks: 'Honderdsten van een seconde (SNMP)', seconds: 'Seconden' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generiek',
    open_admin: 'Beheerpagina openen',
    online: 'Online',
    idle: 'Inactief',
    total: 'Totaal',
    zoom_in: 'Volledige kaart tonen',
    zoom_out: 'Terug naar de compacte weergave',
    confirm_text: '{name} uitschakelen?',
    cancel: 'Annuleren',
    turn_off: 'Uitschakelen',
    power: 'Voeding',
    mini_name: 'Netwerkswitch-minikaart',
    mini_desc: 'Compacte netwerkswitch: frontpaneel, poorten en verkeer, met een knop voor de volledige kaart.',
  },
  pt: {
    card_name: 'Cartão de switch de rede',
    card_desc: 'Mostra um switch de rede: estado, tempo de atividade, portas e tráfego.',
    in: 'Transferência',
    out: 'Envio',
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
      port_names: 'Nomes das portas (por ordem)',
      watched_ports: 'Portas vigiadas (vermelhas se caírem)',
      show_history: 'Histórico de 24 h do tráfego',
      show_title: 'Mostrar o título',
      zoom: 'Botão de detalhe',
      confirm_off: 'Confirmar antes de desligar',
    },
    units: { timeticks: 'Centésimos de segundo (SNMP)', seconds: 'Segundos' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Genérico',
    open_admin: 'Abrir a página de administração',
    online: 'Online',
    idle: 'Inativo',
    total: 'Total',
    zoom_in: 'Mostrar o cartão completo',
    zoom_out: 'Voltar à vista compacta',
    confirm_text: 'Desligar {name}?',
    cancel: 'Cancelar',
    turn_off: 'Desligar',
    power: 'Alimentação',
    mini_name: 'Mini cartão de switch de rede',
    mini_desc: 'Switch de rede compacto: painel frontal, portas e tráfego, com um botão para o cartão completo.',
  },
  pl: {
    card_name: 'Karta przełącznika sieciowego',
    card_desc: 'Pokazuje przełącznik sieciowy: status, czas działania, porty i ruch.',
    in: 'Pobieranie',
    out: 'Wysyłanie',
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
      port_names: 'Nazwy portów (po kolei)',
      watched_ports: 'Monitorowane porty (czerwone po awarii)',
      show_history: 'Historia ruchu z 24 h',
      show_title: 'Pokaż tytuł',
      zoom: 'Przycisk szczegółów',
      confirm_off: 'Potwierdzaj przed wyłączeniem',
    },
    units: { timeticks: 'Setne części sekundy (SNMP)', seconds: 'Sekundy' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Ogólny',
    open_admin: 'Otwórz stronę administracyjną',
    online: 'Online',
    idle: 'Bezczynny',
    total: 'Łącznie',
    zoom_in: 'Pokaż pełną kartę',
    zoom_out: 'Wróć do widoku kompaktowego',
    confirm_text: 'Wyłączyć {name}?',
    cancel: 'Anuluj',
    turn_off: 'Wyłącz',
    power: 'Zasilanie',
    mini_name: 'Mini karta przełącznika sieciowego',
    mini_desc: 'Kompaktowy przełącznik sieciowy: panel przedni, porty i ruch, z przyciskiem pełnej karty.',
  },
  ro: {
    card_name: 'Card switch de rețea',
    card_desc: 'Afișează un switch de rețea: stare, timp de funcționare, porturi și trafic.',
    in: 'Descărcare',
    out: 'Încărcare',
    port: 'Port',
    default: 'Implicit',
    colon: ': ',
    lang_auto: 'Automat',
    sections: {
      entities: 'Entități',
      ports: 'Porturi',
      status: 'Stare',
      appearance: 'Aspect',
    },
    fields: {
      name: 'Nume',
      subtitle: 'Subtitlu',
      icon: 'Pictogramă',
      url: 'URL de administrare (atingere pe imagine)',
      switch_entity: 'Comutator de alimentare',
      status_entity: 'Stare generală',
      connectivity_entity: 'Conectivitate',
      uptime_entity: 'Timp de funcționare',
      uptime_unit: 'Unitatea timpului de funcționare',
      traffic_in_entity: 'Trafic de intrare',
      traffic_out_entity: 'Trafic de ieșire',
      ports: 'Număr de porturi',
      port_pattern: 'Model de entitate pentru porturi ({n} = număr)',
      port_on_state: 'Stare „port activ”',
      online_state: 'Stare „online”',
      idle_state: 'Stare „inactiv”',
      model: 'Model (panou frontal desenat)',
      image: 'Imagine personalizată (înlocuiește modelul)',
      port_start: 'Poziția primului port (%)',
      port_step: 'Spațiere între porturi (%)',
      port_bottom: 'Înălțimea porturilor (% de jos)',
      language: 'Limbă',
      port_names: 'Numele porturilor (în ordine)',
      watched_ports: 'Porturi supravegheate (roșii la cădere)',
      show_history: 'Istoricul traficului pe 24 h',
      show_title: 'Afișează titlul',
      zoom: 'Buton de detalii',
      confirm_off: 'Confirmare înainte de oprire',
    },
    units: { timeticks: 'Sutimi de secundă (SNMP)', seconds: 'Secunde' },
    day: 'z',
    hour: 'h',
    minute: 'min',
    generic: 'Generic',
    open_admin: 'Deschide pagina de administrare',
    online: 'Online',
    idle: 'Inactiv',
    total: 'Total',
    zoom_in: 'Afișează cardul complet',
    zoom_out: 'Înapoi la vizualizarea compactă',
    confirm_text: 'Opriți {name}?',
    cancel: 'Anulare',
    turn_off: 'Oprire',
    power: 'Alimentare',
    mini_name: 'Mini card switch de rețea',
    mini_desc: 'Switch de rețea compact: panou frontal, porturi și trafic, cu un buton pentru cardul complet.',
  },
  da: {
    card_name: 'Netværksswitch-kort',
    card_desc: 'Viser en netværksswitch: status, oppetid, porte og trafik.',
    in: 'Download',
    out: 'Upload',
    port: 'Port',
    default: 'Standard',
    colon: ': ',
    lang_auto: 'Automatisk',
    sections: {
      entities: 'Entiteter',
      ports: 'Porte',
      status: 'Status',
      appearance: 'Udseende',
    },
    fields: {
      name: 'Navn',
      subtitle: 'Undertitel',
      icon: 'Ikon',
      url: 'Administrations-URL (tryk på billedet)',
      switch_entity: 'Strømkontakt',
      status_entity: 'Samlet status',
      connectivity_entity: 'Forbindelse',
      uptime_entity: 'Oppetid',
      uptime_unit: 'Enhed for oppetid',
      traffic_in_entity: 'Indgående trafik',
      traffic_out_entity: 'Udgående trafik',
      ports: 'Antal porte',
      port_pattern: 'Mønster for portentiteter ({n} = nummer)',
      port_on_state: 'Tilstand »port aktiv«',
      online_state: 'Tilstand »online«',
      idle_state: 'Tilstand »inaktiv«',
      model: 'Model (tegnet frontpanel)',
      image: 'Brugerdefineret billede (erstatter model)',
      port_start: 'Position af første port (%)',
      port_step: 'Afstand mellem porte (%)',
      port_bottom: 'Porthøjde (% fra bunden)',
      language: 'Sprog',
      port_names: 'Portnavne (i rækkefølge)',
      watched_ports: 'Overvågede porte (røde ved nedbrud)',
      show_history: '24-timers trafikhistorik',
      show_title: 'Vis titel',
      zoom: 'Detaljeknap',
      confirm_off: 'Bekræft før slukning',
    },
    units: { timeticks: 'Hundrededele sekunder (SNMP)', seconds: 'Sekunder' },
    day: 'd',
    hour: 't',
    minute: 'min',
    generic: 'Generisk',
    open_admin: 'Åbn administrationssiden',
    online: 'Online',
    idle: 'Inaktiv',
    total: 'I alt',
    zoom_in: 'Vis hele kortet',
    zoom_out: 'Tilbage til kompakt visning',
    confirm_text: 'Sluk {name}?',
    cancel: 'Annuller',
    turn_off: 'Sluk',
    power: 'Strøm',
    mini_name: 'Netværksswitch-minikort',
    mini_desc: 'Kompakt netværksswitch: frontpanel, porte og trafik, med en knap til hele kortet.',
  },
  sv: {
    card_name: 'Nätverksswitchkort',
    card_desc: 'Visar en nätverksswitch: status, drifttid, portar och trafik.',
    in: 'Mottagning',
    out: 'Sändning',
    port: 'Port',
    default: 'Standard',
    colon: ': ',
    lang_auto: 'Automatiskt',
    sections: {
      entities: 'Entiteter',
      ports: 'Portar',
      status: 'Status',
      appearance: 'Utseende',
    },
    fields: {
      name: 'Namn',
      subtitle: 'Underrubrik',
      icon: 'Ikon',
      url: 'Administrations-URL (tryck på bilden)',
      switch_entity: 'Strömbrytare',
      status_entity: 'Övergripande status',
      connectivity_entity: 'Anslutning',
      uptime_entity: 'Drifttid',
      uptime_unit: 'Enhet för drifttid',
      traffic_in_entity: 'Inkommande trafik',
      traffic_out_entity: 'Utgående trafik',
      ports: 'Antal portar',
      port_pattern: 'Mönster för portentiteter ({n} = nummer)',
      port_on_state: 'Tillstånd ”port aktiv”',
      online_state: 'Tillstånd ”online”',
      idle_state: 'Tillstånd ”inaktiv”',
      model: 'Modell (ritad frontpanel)',
      image: 'Egen bild (ersätter modell)',
      port_start: 'Första portens position (%)',
      port_step: 'Avstånd mellan portar (%)',
      port_bottom: 'Portarnas höjd (% från botten)',
      language: 'Språk',
      port_names: 'Portnamn (i ordning)',
      watched_ports: 'Övervakade portar (röda vid avbrott)',
      show_history: '24 h-trafikhistorik',
      show_title: 'Visa rubrik',
      zoom: 'Detaljknapp',
      confirm_off: 'Bekräfta före avstängning',
    },
    units: { timeticks: 'Hundradels sekunder (SNMP)', seconds: 'Sekunder' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Generisk',
    open_admin: 'Öppna administrationssidan',
    online: 'Online',
    idle: 'Inaktiv',
    total: 'Totalt',
    zoom_in: 'Visa hela kortet',
    zoom_out: 'Tillbaka till kompakt vy',
    confirm_text: 'Stäng av {name}?',
    cancel: 'Avbryt',
    turn_off: 'Stäng av',
    power: 'Ström',
    mini_name: 'Minikort för nätverksswitch',
    mini_desc: 'Kompakt nätverksswitch: frontpanel, portar och trafik, med en knapp för hela kortet.',
  },
  bg: {
    card_name: 'Карта за мрежов суич',
    card_desc: 'Показва мрежов суич: състояние, време на работа, портове и трафик.',
    in: 'Изтегляне',
    out: 'Качване',
    port: 'Порт',
    default: 'По подразбиране',
    colon: ': ',
    lang_auto: 'Автоматично',
    sections: {
      entities: 'Обекти',
      ports: 'Портове',
      status: 'Състояние',
      appearance: 'Външен вид',
    },
    fields: {
      name: 'Име',
      subtitle: 'Подзаглавие',
      icon: 'Икона',
      url: 'URL за администриране (докосване на изображението)',
      switch_entity: 'Превключвател на захранването',
      status_entity: 'Общо състояние',
      connectivity_entity: 'Свързаност',
      uptime_entity: 'Време на работа',
      uptime_unit: 'Единица за времето на работа',
      traffic_in_entity: 'Входящ трафик',
      traffic_out_entity: 'Изходящ трафик',
      ports: 'Брой портове',
      port_pattern: 'Шаблон на обектите за портовете ({n} = номер)',
      port_on_state: 'Състояние „порт активен“',
      online_state: 'Състояние „на линия“',
      idle_state: 'Състояние „неактивен“',
      model: 'Модел (нарисуван преден панел)',
      image: 'Персонализирано изображение (заменя модела)',
      port_start: 'Позиция на първия порт (%)',
      port_step: 'Разстояние между портовете (%)',
      port_bottom: 'Височина на портовете (% отдолу)',
      language: 'Език',
      port_names: 'Имена на портовете (по ред)',
      watched_ports: 'Наблюдавани портове (червени при отпадане)',
      show_history: 'История на трафика за 24 ч',
      show_title: 'Показване на заглавието',
      zoom: 'Бутон за подробности',
      confirm_off: 'Потвърждение преди изключване',
    },
    units: { timeticks: 'Стотни от секундата (SNMP)', seconds: 'Секунди' },
    day: 'д',
    hour: 'ч',
    minute: 'мин',
    generic: 'Общ',
    open_admin: 'Отвори страницата за администриране',
    online: 'На линия',
    idle: 'Неактивен',
    total: 'Общо',
    zoom_in: 'Покажи цялата карта',
    zoom_out: 'Обратно към компактния изглед',
    confirm_text: 'Изключване на {name}?',
    cancel: 'Отказ',
    turn_off: 'Изключи',
    power: 'Захранване',
    mini_name: 'Мини карта на мрежов суич',
    mini_desc: 'Компактен мрежов суич: преден панел, портове и трафик, с бутон за цялата карта.',
  },
  ru: {
    card_name: 'Карточка сетевого коммутатора',
    card_desc: 'Показывает сетевой коммутатор: состояние, время работы, порты и трафик.',
    in: 'Получение',
    out: 'Отправка',
    port: 'Порт',
    default: 'По умолчанию',
    colon: ': ',
    lang_auto: 'Автоматически',
    sections: {
      entities: 'Объекты',
      ports: 'Порты',
      status: 'Состояние',
      appearance: 'Внешний вид',
    },
    fields: {
      name: 'Название',
      subtitle: 'Подзаголовок',
      icon: 'Значок',
      url: 'URL администрирования (нажатие на изображение)',
      switch_entity: 'Выключатель питания',
      status_entity: 'Общее состояние',
      connectivity_entity: 'Подключение',
      uptime_entity: 'Время работы',
      uptime_unit: 'Единица времени работы',
      traffic_in_entity: 'Входящий трафик',
      traffic_out_entity: 'Исходящий трафик',
      ports: 'Количество портов',
      port_pattern: 'Шаблон объектов портов ({n} = номер)',
      port_on_state: 'Состояние «порт активен»',
      online_state: 'Состояние «в сети»',
      idle_state: 'Состояние «неактивен»',
      model: 'Модель (нарисованная передняя панель)',
      image: 'Своё изображение (заменяет модель)',
      port_start: 'Положение первого порта (%)',
      port_step: 'Расстояние между портами (%)',
      port_bottom: 'Высота портов (% от низа)',
      language: 'Язык',
      port_names: 'Имена портов (по порядку)',
      watched_ports: 'Отслеживаемые порты (красные при падении)',
      show_history: 'История трафика за 24 ч',
      show_title: 'Показывать заголовок',
      zoom: 'Кнопка подробностей',
      confirm_off: 'Подтверждать выключение',
    },
    units: { timeticks: 'Сотые доли секунды (SNMP)', seconds: 'Секунды' },
    day: 'д',
    hour: 'ч',
    minute: 'мин',
    generic: 'Универсальная',
    open_admin: 'Открыть страницу администрирования',
    online: 'В сети',
    idle: 'Неактивен',
    total: 'Всего',
    zoom_in: 'Показать полную карточку',
    zoom_out: 'Вернуться к компактному виду',
    confirm_text: 'Выключить {name}?',
    cancel: 'Отмена',
    turn_off: 'Выключить',
    power: 'Питание',
    mini_name: 'Мини-карточка сетевого коммутатора',
    mini_desc: 'Компактный сетевой коммутатор: передняя панель, порты и трафик, с кнопкой полной карточки.',
  },
  uk: {
    card_name: 'Картка мережевого комутатора',
    card_desc: 'Показує мережевий комутатор: стан, час роботи, порти й трафік.',
    in: 'Отримання',
    out: 'Відправка',
    port: 'Порт',
    default: 'Типово',
    colon: ': ',
    lang_auto: 'Автоматично',
    sections: {
      entities: 'Сутності',
      ports: 'Порти',
      status: 'Стан',
      appearance: 'Вигляд',
    },
    fields: {
      name: 'Назва',
      subtitle: 'Підзаголовок',
      icon: 'Значок',
      url: 'URL адміністрування (натискання на зображення)',
      switch_entity: 'Вимикач живлення',
      status_entity: 'Загальний стан',
      connectivity_entity: 'Підключення',
      uptime_entity: 'Час роботи',
      uptime_unit: 'Одиниця часу роботи',
      traffic_in_entity: 'Вхідний трафік',
      traffic_out_entity: 'Вихідний трафік',
      ports: 'Кількість портів',
      port_pattern: 'Шаблон сутностей портів ({n} = номер)',
      port_on_state: 'Стан «порт активний»',
      online_state: 'Стан «у мережі»',
      idle_state: 'Стан «неактивний»',
      model: 'Модель (намальована передня панель)',
      image: 'Власне зображення (замінює модель)',
      port_start: 'Положення першого порту (%)',
      port_step: 'Відстань між портами (%)',
      port_bottom: 'Висота портів (% від низу)',
      language: 'Мова',
      port_names: 'Назви портів (по порядку)',
      watched_ports: 'Відстежувані порти (червоні при падінні)',
      show_history: 'Історія трафіку за 24 год',
      show_title: 'Показувати заголовок',
      zoom: 'Кнопка деталей',
      confirm_off: 'Підтверджувати вимкнення',
    },
    units: { timeticks: 'Соті частки секунди (SNMP)', seconds: 'Секунди' },
    day: 'д',
    hour: 'год',
    minute: 'хв',
    generic: 'Універсальна',
    open_admin: 'Відкрити сторінку адміністрування',
    online: 'У мережі',
    idle: 'Неактивний',
    total: 'Усього',
    zoom_in: 'Показати повну картку',
    zoom_out: 'Повернутися до компактного вигляду',
    confirm_text: 'Вимкнути {name}?',
    cancel: 'Скасувати',
    turn_off: 'Вимкнути',
    power: 'Живлення',
    mini_name: 'Міні-картка мережевого комутатора',
    mini_desc: 'Компактний мережевий комутатор: передня панель, порти й трафік, з кнопкою повної картки.',
  },
  hu: {
    card_name: 'Hálózati switch kártya',
    card_desc: 'Hálózati switch megjelenítése: állapot, üzemidő, portok és forgalom.',
    in: 'Letöltés',
    out: 'Feltöltés',
    port: 'Port',
    default: 'Alapértelmezett',
    colon: ': ',
    lang_auto: 'Automatikus',
    sections: {
      entities: 'Entitások',
      ports: 'Portok',
      status: 'Állapot',
      appearance: 'Megjelenés',
    },
    fields: {
      name: 'Név',
      subtitle: 'Alcím',
      icon: 'Ikon',
      url: 'Adminisztrációs URL (koppintás a képre)',
      switch_entity: 'Tápkapcsoló',
      status_entity: 'Általános állapot',
      connectivity_entity: 'Kapcsolat',
      uptime_entity: 'Üzemidő',
      uptime_unit: 'Üzemidő mértékegysége',
      traffic_in_entity: 'Bejövő forgalom',
      traffic_out_entity: 'Kimenő forgalom',
      ports: 'Portok száma',
      port_pattern: 'Port entitásminta ({n} = szám)',
      port_on_state: '„Port aktív” állapot',
      online_state: '„Online” állapot',
      idle_state: '„Inaktív” állapot',
      model: 'Modell (rajzolt előlap)',
      image: 'Egyéni kép (felülírja a modellt)',
      port_start: 'Első port helyzete (%)',
      port_step: 'Portok közötti távolság (%)',
      port_bottom: 'Portok magassága (% alulról)',
      language: 'Nyelv',
      port_names: 'Portnevek (sorrendben)',
      watched_ports: 'Figyelt portok (pirosak kieséskor)',
      show_history: '24 órás forgalmi előzmények',
      show_title: 'Cím megjelenítése',
      zoom: 'Részletek gomb',
      confirm_off: 'Megerősítés kikapcsolás előtt',
    },
    units: { timeticks: 'Századmásodperc (SNMP)', seconds: 'Másodperc' },
    day: 'n',
    hour: 'ó',
    minute: 'p',
    generic: 'Általános',
    open_admin: 'Adminisztrációs oldal megnyitása',
    online: 'Online',
    idle: 'Inaktív',
    total: 'Összesen',
    zoom_in: 'Teljes kártya megjelenítése',
    zoom_out: 'Vissza a kompakt nézethez',
    confirm_text: '{name} kikapcsolása?',
    cancel: 'Mégse',
    turn_off: 'Kikapcsolás',
    power: 'Tápellátás',
    mini_name: 'Hálózati switch mini kártya',
    mini_desc: 'Kompakt hálózati switch: előlap, portok és forgalom, a teljes kártya gombjával.',
  },
  sk: {
    card_name: 'Karta sieťového prepínača',
    card_desc: 'Zobrazuje sieťový prepínač: stav, čas prevádzky, porty a dátovú prevádzku.',
    in: 'Sťahovanie',
    out: 'Odosielanie',
    port: 'Port',
    default: 'Predvolené',
    colon: ': ',
    lang_auto: 'Automaticky',
    sections: {
      entities: 'Entity',
      ports: 'Porty',
      status: 'Stav',
      appearance: 'Vzhľad',
    },
    fields: {
      name: 'Názov',
      subtitle: 'Podnadpis',
      icon: 'Ikona',
      url: 'URL administrácie (ťuknutie na obrázok)',
      switch_entity: 'Vypínač napájania',
      status_entity: 'Celkový stav',
      connectivity_entity: 'Pripojenie',
      uptime_entity: 'Čas prevádzky',
      uptime_unit: 'Jednotka času prevádzky',
      traffic_in_entity: 'Prijatá prevádzka',
      traffic_out_entity: 'Odoslaná prevádzka',
      ports: 'Počet portov',
      port_pattern: 'Vzor entít portov ({n} = číslo)',
      port_on_state: 'Stav „port aktívny“',
      online_state: 'Stav „online“',
      idle_state: 'Stav „nečinný“',
      model: 'Model (nakreslený predný panel)',
      image: 'Vlastný obrázok (nahrádza model)',
      port_start: 'Poloha prvého portu (%)',
      port_step: 'Rozostup medzi portami (%)',
      port_bottom: 'Výška portov (% zdola)',
      language: 'Jazyk',
      port_names: 'Názvy portov (v poradí)',
      watched_ports: 'Sledované porty (červené pri výpadku)',
      show_history: '24 h história prevádzky',
      show_title: 'Zobraziť názov',
      zoom: 'Tlačidlo podrobností',
      confirm_off: 'Potvrdiť pred vypnutím',
    },
    units: { timeticks: 'Stotiny sekundy (SNMP)', seconds: 'Sekundy' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Všeobecný',
    open_admin: 'Otvoriť stránku administrácie',
    online: 'Online',
    idle: 'Nečinný',
    total: 'Spolu',
    zoom_in: 'Zobraziť celú kartu',
    zoom_out: 'Späť na kompaktné zobrazenie',
    confirm_text: 'Vypnúť {name}?',
    cancel: 'Zrušiť',
    turn_off: 'Vypnúť',
    power: 'Napájanie',
    mini_name: 'Mini karta sieťového prepínača',
    mini_desc: 'Kompaktný sieťový prepínač: predný panel, porty a prevádzka, s tlačidlom celej karty.',
  },
  cs: {
    card_name: 'Karta síťového přepínače',
    card_desc: 'Zobrazuje síťový přepínač: stav, dobu provozu, porty a datový provoz.',
    in: 'Stahování',
    out: 'Odesílání',
    port: 'Port',
    default: 'Výchozí',
    colon: ': ',
    lang_auto: 'Automaticky',
    sections: {
      entities: 'Entity',
      ports: 'Porty',
      status: 'Stav',
      appearance: 'Vzhled',
    },
    fields: {
      name: 'Název',
      subtitle: 'Podnadpis',
      icon: 'Ikona',
      url: 'URL administrace (klepnutí na obrázek)',
      switch_entity: 'Vypínač napájení',
      status_entity: 'Celkový stav',
      connectivity_entity: 'Připojení',
      uptime_entity: 'Doba provozu',
      uptime_unit: 'Jednotka doby provozu',
      traffic_in_entity: 'Příchozí provoz',
      traffic_out_entity: 'Odchozí provoz',
      ports: 'Počet portů',
      port_pattern: 'Vzor entit portů ({n} = číslo)',
      port_on_state: 'Stav „port aktivní“',
      online_state: 'Stav „online“',
      idle_state: 'Stav „nečinný“',
      model: 'Model (kreslený přední panel)',
      image: 'Vlastní obrázek (nahrazuje model)',
      port_start: 'Poloha prvního portu (%)',
      port_step: 'Rozestup mezi porty (%)',
      port_bottom: 'Výška portů (% zdola)',
      language: 'Jazyk',
      port_names: 'Názvy portů (v pořadí)',
      watched_ports: 'Sledované porty (červené při výpadku)',
      show_history: '24h historie provozu',
      show_title: 'Zobrazit název',
      zoom: 'Tlačítko podrobností',
      confirm_off: 'Potvrdit před vypnutím',
    },
    units: { timeticks: 'Setiny sekundy (SNMP)', seconds: 'Sekundy' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Obecný',
    open_admin: 'Otevřít stránku administrace',
    online: 'Online',
    idle: 'Nečinný',
    total: 'Celkem',
    zoom_in: 'Zobrazit celou kartu',
    zoom_out: 'Zpět na kompaktní zobrazení',
    confirm_text: 'Vypnout {name}?',
    cancel: 'Zrušit',
    turn_off: 'Vypnout',
    power: 'Napájení',
    mini_name: 'Mini karta síťového přepínače',
    mini_desc: 'Kompaktní síťový přepínač: přední panel, porty a provoz, s tlačítkem celé karty.',
  },
  sl: {
    card_name: 'Kartica omrežnega stikala',
    card_desc: 'Prikazuje omrežno stikalo: stanje, čas delovanja, vrata in promet.',
    in: 'Prejemanje',
    out: 'Pošiljanje',
    port: 'Vrata',
    default: 'Privzeto',
    colon: ': ',
    lang_auto: 'Samodejno',
    sections: {
      entities: 'Entitete',
      ports: 'Vrata',
      status: 'Stanje',
      appearance: 'Videz',
    },
    fields: {
      name: 'Ime',
      subtitle: 'Podnaslov',
      icon: 'Ikona',
      url: 'URL za skrbništvo (dotik slike)',
      switch_entity: 'Stikalo za napajanje',
      status_entity: 'Splošno stanje',
      connectivity_entity: 'Povezljivost',
      uptime_entity: 'Čas delovanja',
      uptime_unit: 'Enota časa delovanja',
      traffic_in_entity: 'Dohodni promet',
      traffic_out_entity: 'Odhodni promet',
      ports: 'Število vrat',
      port_pattern: 'Vzorec entitet vrat ({n} = številka)',
      port_on_state: 'Stanje »vrata aktivna«',
      online_state: 'Stanje »povezano«',
      idle_state: 'Stanje »nedejavno«',
      model: 'Model (narisana sprednja plošča)',
      image: 'Slika po meri (nadomesti model)',
      port_start: 'Položaj prvih vrat (%)',
      port_step: 'Razmik med vrati (%)',
      port_bottom: 'Višina vrat (% od spodaj)',
      language: 'Jezik',
      port_names: 'Imena vrat (po vrsti)',
      watched_ports: 'Nadzorovana vrata (rdeča ob izpadu)',
      show_history: '24-urna zgodovina prometa',
      show_title: 'Prikaži naslov',
      zoom: 'Gumb za podrobnosti',
      confirm_off: 'Potrdi pred izklopom',
    },
    units: { timeticks: 'Stotinke sekunde (SNMP)', seconds: 'Sekunde' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Splošni',
    open_admin: 'Odpri stran za skrbništvo',
    online: 'Povezano',
    idle: 'Nedejavno',
    total: 'Skupaj',
    zoom_in: 'Prikaži celotno kartico',
    zoom_out: 'Nazaj na kompaktni pogled',
    confirm_text: 'Želite izklopiti {name}?',
    cancel: 'Prekliči',
    turn_off: 'Izklopi',
    power: 'Napajanje',
    mini_name: 'Mini kartica omrežnega stikala',
    mini_desc: 'Kompaktno omrežno stikalo: sprednja plošča, vrata in promet, z gumbom za celotno kartico.',
  },
  lv: {
    card_name: 'Tīkla komutatora kartīte',
    card_desc: 'Rāda tīkla komutatoru: statusu, darbības laiku, portus un datplūsmu.',
    in: 'Saņemšana',
    out: 'Sūtīšana',
    port: 'Ports',
    default: 'Noklusējums',
    colon: ': ',
    lang_auto: 'Automātiski',
    sections: {
      entities: 'Vienības',
      ports: 'Porti',
      status: 'Statuss',
      appearance: 'Izskats',
    },
    fields: {
      name: 'Nosaukums',
      subtitle: 'Apakšvirsraksts',
      icon: 'Ikona',
      url: 'Administrēšanas URL (pieskāriens attēlam)',
      switch_entity: 'Barošanas slēdzis',
      status_entity: 'Kopējais statuss',
      connectivity_entity: 'Savienojamība',
      uptime_entity: 'Darbības laiks',
      uptime_unit: 'Darbības laika mērvienība',
      traffic_in_entity: 'Ienākošā datplūsma',
      traffic_out_entity: 'Izejošā datplūsma',
      ports: 'Portu skaits',
      port_pattern: 'Portu vienību veidne ({n} = numurs)',
      port_on_state: 'Stāvoklis “ports aktīvs”',
      online_state: 'Stāvoklis “tiešsaistē”',
      idle_state: 'Stāvoklis “dīkstāvē”',
      model: 'Modelis (zīmēts priekšējais panelis)',
      image: 'Pielāgots attēls (aizstāj modeli)',
      port_start: 'Pirmā porta pozīcija (%)',
      port_step: 'Attālums starp portiem (%)',
      port_bottom: 'Portu augstums (% no apakšas)',
      language: 'Valoda',
      port_names: 'Portu nosaukumi (secībā)',
      watched_ports: 'Uzraudzītie porti (sarkani, ja krīt)',
      show_history: 'Datplūsmas 24 h vēsture',
      show_title: 'Rādīt virsrakstu',
      zoom: 'Detaļu poga',
      confirm_off: 'Apstiprināt pirms izslēgšanas',
    },
    units: { timeticks: 'Sekundes simtdaļas (SNMP)', seconds: 'Sekundes' },
    day: 'd',
    hour: 'h',
    minute: 'min',
    generic: 'Vispārīgs',
    open_admin: 'Atvērt administrēšanas lapu',
    online: 'Tiešsaistē',
    idle: 'Dīkstāvē',
    total: 'Kopā',
    zoom_in: 'Rādīt pilno karti',
    zoom_out: 'Atpakaļ uz kompakto skatu',
    confirm_text: 'Izslēgt {name}?',
    cancel: 'Atcelt',
    turn_off: 'Izslēgt',
    power: 'Barošana',
    mini_name: 'Tīkla komutatora mini karte',
    mini_desc: 'Kompakts tīkla komutators: priekšējais panelis, porti un datplūsma, ar pogu pilnajai kartei.',
  },
  el: {
    card_name: 'Κάρτα μεταγωγέα δικτύου',
    card_desc: 'Εμφανίζει έναν μεταγωγέα δικτύου: κατάσταση, χρόνο λειτουργίας, θύρες και κίνηση.',
    in: 'Λήψη',
    out: 'Αποστολή',
    port: 'Θύρα',
    default: 'Προεπιλογή',
    colon: ': ',
    lang_auto: 'Αυτόματα',
    sections: {
      entities: 'Οντότητες',
      ports: 'Θύρες',
      status: 'Κατάσταση',
      appearance: 'Εμφάνιση',
    },
    fields: {
      name: 'Όνομα',
      subtitle: 'Υπότιτλος',
      icon: 'Εικονίδιο',
      url: 'URL διαχείρισης (πάτημα στην εικόνα)',
      switch_entity: 'Διακόπτης τροφοδοσίας',
      status_entity: 'Γενική κατάσταση',
      connectivity_entity: 'Συνδεσιμότητα',
      uptime_entity: 'Χρόνος λειτουργίας',
      uptime_unit: 'Μονάδα χρόνου λειτουργίας',
      traffic_in_entity: 'Εισερχόμενη κίνηση',
      traffic_out_entity: 'Εξερχόμενη κίνηση',
      ports: 'Αριθμός θυρών',
      port_pattern: 'Μοτίβο οντοτήτων θυρών ({n} = αριθμός)',
      port_on_state: 'Κατάσταση «θύρα ενεργή»',
      online_state: 'Κατάσταση «συνδεδεμένο»',
      idle_state: 'Κατάσταση «ανενεργό»',
      model: 'Μοντέλο (σχεδιασμένη πρόσοψη)',
      image: 'Προσαρμοσμένη εικόνα (αντικαθιστά το μοντέλο)',
      port_start: 'Θέση πρώτης θύρας (%)',
      port_step: 'Απόσταση μεταξύ θυρών (%)',
      port_bottom: 'Ύψος θυρών (% από κάτω)',
      language: 'Γλώσσα',
      port_names: 'Ονόματα θυρών (με σειρά)',
      watched_ports: 'Θύρες υπό παρακολούθηση (κόκκινες σε πτώση)',
      show_history: 'Ιστορικό κίνησης 24 ωρών',
      show_title: 'Εμφάνιση τίτλου',
      zoom: 'Κουμπί λεπτομερειών',
      confirm_off: 'Επιβεβαίωση πριν από την απενεργοποίηση',
    },
    units: { timeticks: 'Εκατοστά του δευτερολέπτου (SNMP)', seconds: 'Δευτερόλεπτα' },
    day: 'η',
    hour: 'ώ',
    minute: 'λ',
    generic: 'Γενικό',
    open_admin: 'Άνοιγμα σελίδας διαχείρισης',
    online: 'Σε σύνδεση',
    idle: 'Ανενεργό',
    total: 'Σύνολο',
    zoom_in: 'Εμφάνιση πλήρους κάρτας',
    zoom_out: 'Επιστροφή στη συμπαγή προβολή',
    confirm_text: 'Απενεργοποίηση του {name};',
    cancel: 'Ακύρωση',
    turn_off: 'Απενεργοποίηση',
    power: 'Τροφοδοσία',
    mini_name: 'Μίνι κάρτα μεταγωγέα δικτύου',
    mini_desc: 'Συμπαγής μεταγωγέας δικτύου: πρόσοψη, θύρες και κίνηση, με κουμπί για την πλήρη κάρτα.',
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

// After the power-off confirmation closes, clicks on the card are ignored for this long: the second click of a
// double click on Turn off would otherwise land on what lies under the button (a port, opening its more-info).
const CONFIRM_GUARD_MS = 400;

// An entity Home Assistant has no value for: drawn grey (state unknown), not red (off / down).
const isUnavailable = (st) => st?.state === 'unavailable' || st?.state === 'unknown';

// A config number (port overlay position), or its default when the YAML value is not a number.
const num = (v, def) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : def);

// Locale for Intl: Home Assistant's full locale when its base matches the card's language (keeps the region, e.g.
// de-CH), otherwise the card's language. Home Assistant's "pt" is European Portuguese, which Intl would format as
// Brazilian, so bare "pt" becomes "pt-PT".
const fmtLang = (hass, config) => {
  const l = getLang(hass, config);
  const ha = hass?.locale?.language || hass?.language;
  const loc = ha && ha.split('-')[0] === l.split('-')[0] && l !== 'sr-Latn' ? ha : l;
  return loc === 'pt' ? 'pt-PT' : loc;
};

// A number with exactly `d` decimals, with the decimal separator of `loc` (no grouping, as before).
const fmtNum = (v, d, loc) => {
  try {
    return new Intl.NumberFormat(loc, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }).format(v);
  } catch {
    return v.toFixed(d);
  }
};

// Sizes in powers of 1024 with binary prefixes; up to 2 decimals under 10, 1 under 100, none above (trailing zeros
// dropped: "1.5 KiB", "20 GiB"), as in the system-monitor and docker cards.
const fmtNumMax = (v, d, loc) => {
  try {
    return new Intl.NumberFormat(loc, { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: false }).format(v);
  } catch {
    return String(Number(v.toFixed(d)));
  }
};
const formatBytes = (v, loc = 'en') => {
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
const formatUptime = (raw, unit, u = { day: 'd', hour: 'h', minute: 'min' }) => {
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
const BYTE_UNITS = { B: 1, bytes: 1, octets: 1, o: 1, kB: 1e3, KB: 1024, KiB: 1024, MB: 1e6, MiB: 1048576, GB: 1e9, GiB: 1073741824 };
// A rate with three significant digits at most ("3.2 MB/s", "584 KB/s"), so it fits beside the mini card's panel.
// Rates in powers of 1000 ("3.2 MB/s", "584 kB/s"): 1 decimal under 100, none above, as in the other cards.
const formatRate = (bps, loc = 'en') => {
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
const watchedPorts = (c) =>
  new Set((Array.isArray(c.watched_ports) ? c.watched_ports : String(c.watched_ports ?? '').split(/[\s,;]+/)).map((n) => parseInt(n, 10)).filter(Number.isFinite));

// The name given to a port: `port_names` as a list in port order (YAML or the editor) or a map { 3: NAS }.
const portName = (c, n) => {
  const names = c.port_names;
  const v = Array.isArray(names) ? names[n - 1] : names && typeof names === 'object' ? names[n] : undefined;
  return v == null ? '' : String(v).trim();
};
// Under a drawn port, its name fits in about 7 characters: shortened with an ellipsis beyond (the tooltip has it whole).
const shortName = (name) => (name.length > 7 ? `${name.slice(0, 6)}…` : name);

// 24 h curve of a series (rates) of { t, v } points (t in ms, the 5-minute bucket's start), scaled from 0 to its
// peak, on a real time axis ending at `end`: where buckets are missing (more than two periods apart) the curve
// breaks instead of joining across the hole. Nothing under two points.
const HIST_REFRESH = 5 * 60000;
const HIST_WINDOW = 864e5;
const HIST_PERIOD = 300000;
const spark = (points, end) => {
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
// A port's tooltip: "Port 3", or "Port 3 · NAS" when it has a name.
const portTitle = (portLabel, p) => `${portLabel} ${p.n}${p.name ? ` · ${p.name}` : ''}`;

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

// Identifies a focusable element across renders (the header icon and a chip can share an entity; the power toggle
// is focusable without a tabindex).
const focusKey = (el) =>
  el?.tagName === 'HA-SWITCH'
    ? 'ha-switch'
    : el?.getAttribute?.('tabindex') != null
      ? [el.getAttribute('class'), el.getAttribute('data-entity'), el.getAttribute('data-url')].join('|')
      : '';

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, the power toggle and its listener survive an update (a new rate every few seconds), and only
// the changed text and attributes are written. Nodes carrying a data-key are matched by it, the others by
// position. A custom element keeps the attributes the new HTML does not name (it may reflect its own state there)
// and, when the new HTML leaves it empty, its own children.
const patchAttrs = (cur, next) => {
  if (!cur.nodeName.includes('-')) for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute('data-key') : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it.
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
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
const morph = (root, html) => {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */
class HaSwitchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    this._onConfirmOutside = (ev) => {
      if (this._confirm && !ev.composedPath().includes(this) && !inDialog(ev)) this._closeConfirm(false);
    };
  }

  // Reattached with the confirmation still open (view switch, editor): Escape and outside clicks keep closing it.
  connectedCallback() {
    // Back on screen: the render schedules the next timed redraw again (rate expiry, uptime minute).
    this._render();
    if (!this._confirm) return;
    window.addEventListener('keydown', this._onConfirmKey);
    document.addEventListener('click', this._onConfirmOutside, true);
  }

  disconnectedCallback() {
    clearTimeout(this._tick);
    this._tick = null;
    window.removeEventListener('keydown', this._onConfirmKey);
    document.removeEventListener('click', this._onConfirmOutside, true);
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
    const key = loc + this._configKey + this._watchedIds.map(entityKey).join('|') + JSON.stringify([liveRates, !!hist, this._zoomed, upMinute]);
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
    for (let n = 1; n <= count; n++) {
      const id = this._portEntity(n);
      const ps = this._state(id);
      const up = ps?.state === String(c.port_on_state);
      if (up) upCount++;
      // Missing, unavailable or unknown: grey, so a dead SNMP poll does not show every port as down. A port without
      // link is grey too (nothing plugged in), red only when it is one of the `watched_ports`.
      const color = !ps || isUnavailable(ps) ? COLORS.grey : up ? COLORS.green : watched.has(n) ? COLORS.red : COLORS.grey;
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
    } else if (MODELS[c.model]) {
      const m = MODELS[c.model];
      device = `<div class="device" ${urlAttr}>${m.svg(portInfo, statusColor, t.port)}</div>`;
    } else {
      device = `<div class="device" ${urlAttr}>${chassisSvg(portInfo, statusColor, t.port)}</div>`;
    }

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

    const active = this.shadowRoot.activeElement;
    const focused = focusKey(active);
    const html = `
      <style>${HaSwitchCard.styles}</style>
      <ha-card class="${compact ? 'mini' : ''}${confirm ? 'dialog-open' : ''}">
        <div class="header">
          <div class="ic big" style="--c:${statusColor}" ${headerEntity ? `data-entity="${esc(headerEntity)}" role="button" tabindex="0" aria-label="${esc(this._state(headerEntity)?.attributes?.friendly_name || headerEntity)}"` : ''}>
            <ha-icon icon="${esc(c.icon)}"></ha-icon>
          </div>
          <div class="titles">
            <div class="title-row"><div class="name">${esc(c.name)}</div>${pill}</div>
            ${c.subtitle ? `<div class="sub">${esc(c.subtitle)}</div>` : ''}
          </div>
          ${sw && !compact ? `<ha-switch aria-label="${esc(`${t.power}${t.colon}${c.name}`)}" title="${esc(t.power)}"></ha-switch>` : ''}${this._zoomButton()}
        </div>
        ${body}${confirm ? this._confirmHtml(t) : ''}
      </ha-card>`;
    // The first render writes the HTML; the next ones patch it in place (morph), keeping the nodes, the focus and
    // the power toggle's listener, so a new rate only rewrites its text.
    const patched = !!this.shadowRoot.firstChild;
    if (patched) morph(this.shadowRoot, html);
    else this.shadowRoot.innerHTML = html;

    // The focused element was replaced (first render, or its place changed): focus its counterpart, the power toggle
    // included, so keyboard navigation keeps its place.
    if (focused && (!patched || this.shadowRoot.activeElement !== active)) {
      const again = [...this.shadowRoot.querySelectorAll('[tabindex], ha-switch')].find((el) => focusKey(el) === focused);
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
    document.addEventListener('click', this._onConfirmOutside, true);
    this._key = '';
    this._render();
    // preventScroll: opening the popup must not bring a scrolled page back to the card.
    this.shadowRoot.querySelector('.modal .primary')?.focus?.({ preventScroll: true });
  }

  _dropConfirm() {
    this._confirm = false;
    this._confirmClosedAt = Date.now();
    window.removeEventListener('keydown', this._onConfirmKey);
    document.removeEventListener('click', this._onConfirmOutside, true);
  }

  // restoreFocus: back on the power toggle, unless closed by a click elsewhere (the focus goes where it put it).
  _closeConfirm(restoreFocus = true) {
    this._dropConfirm();
    this._key = '';
    this._render();
    if (restoreFocus) this.shadowRoot.querySelector('ha-switch')?.focus?.({ preventScroll: true });
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
      :host([hide-title]) .titles .name { display: none; }
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
      .traffic { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 6px; }
      .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
              background: var(--secondary-background-color, rgba(127,127,127,.08)); position: relative; overflow: hidden; }
      .tile > :not(.spark) { position: relative; }
      .tile .ic { --mdc-icon-size: 20px; }
      .tile .t { font-size: 11px; color: var(--secondary-text-color); }
      /* 24 h curve behind a rate, in the lower half, in the tile's colour. */
      .spark { position: absolute; left: 0; bottom: 0; width: 100%; height: 55%; pointer-events: none; }
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
      ha-card.mini { gap: 8px; container-type: inline-size; }
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
      .rt .spark { height: 60%; }
      /* A narrow mini card (a phone, 6 columns of a section): the panel takes the whole width, the rates go under it
         side by side, then one per line; the pill keeps only the port count. */
      @container (max-width: 330px) {
        .mb { grid-template-columns: minmax(0, 1fr); }
        .rates { flex-direction: row; }
        .rt { flex: 1 1 0; }
      }
      @container (max-width: 200px) {
        .rates { flex-direction: column; }
        .rt { flex: none; padding: 3px 6px; }
        .rt > div { font-size: 12px; }
        ha-card.mini .title-row > .chip > span:not(.cnt) { display: none; }
        ha-card.mini .title-row > .chip .cnt { font-size: 0; }
        ha-card.mini .title-row > .chip .cnt::after { content: attr(data-n); font-size: 11px; }
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
    `;
  }
}

/* ------------------------------------------------------------------ */
/* Mini card                                                           */
/* ------------------------------------------------------------------ */
// A click in a dialog opened from the card (its more-info) does not fold it back.
const inDialog = (ev) => ev.composedPath().some((n) => ['ha-more-info-dialog', 'ha-dialog', 'dialog'].includes(n.localName));

/**
 * Compact card: header with the status and ports up, the front panel and the rates with their 24 h curves.
 * Its detail button (top right, `zoom: false` removes it) switches it to the full card and back; a click outside the
 * card brings the compact view back.
 */
class HaSwitchMiniCard extends HaSwitchCard {
  constructor() {
    super();
    this._zoomed = false;
    this._onOutside = (ev) => {
      if (this._zoomed && !ev.composedPath().includes(this) && !inDialog(ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement('ha-switch-mini-card-editor');
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onOutside, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutside, true);
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
const EDITOR_TOGGLES = { show_title: true, show_history: true, zoom: true, confirm_off: true };

// Config → form data: `port_names` as a map ({ 3: NAS }) becomes the list in port order the text fields edit
// (an empty name keeps the number), and `watched_ports` (numbers, or "1, 3, 8") the strings of the port select.
const toForm = (config) => {
  const data = { ...EDITOR_TOGGLES, ...config };
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
const fromForm = (value) => {
  const config = { ...value };
  if (Array.isArray(config.port_names)) {
    const names = config.port_names.map((v) => (v == null ? '' : String(v)));
    while (names.length && !names[names.length - 1].trim()) names.pop();
    config.port_names = names;
  }
  if (Array.isArray(config.watched_ports)) config.watched_ports = [...watchedPorts(config)];
  Object.keys(config).forEach((k) => {
    const v = config[k];
    if (v === '' || v === undefined || (Array.isArray(v) && !v.length) || EDITOR_TOGGLES[k] === v) delete config[k];
  });
  return config;
};

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
          { name: 'show_title', selector: { boolean: {} } },
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
class HaSwitchMiniCardEditor extends HaSwitchCardEditor {
  static get mini() {
    return true;
  }
}

if (!customElements.get('ha-switch-card')) customElements.define('ha-switch-card', HaSwitchCard);
if (!customElements.get('ha-switch-card-editor')) customElements.define('ha-switch-card-editor', HaSwitchCardEditor);
if (!customElements.get('ha-switch-mini-card')) customElements.define('ha-switch-mini-card', HaSwitchMiniCard);
if (!customElements.get('ha-switch-mini-card-editor')) customElements.define('ha-switch-mini-card-editor', HaSwitchMiniCardEditor);

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
