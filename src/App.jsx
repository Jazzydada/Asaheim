import React, { useCallback, useMemo, useState } from "react";

// ────────────────────────────────────────────────────────────────
// ASAHEIM — D&D VEJSIDEHÆNDELSER
// Komplet single-file React App.jsx
// Ingen eksterne assets.
// ────────────────────────────────────────────────────────────────

// ── RACE WEIGHTS ────────────────────────────────────────────────
const raceWeights = [
  { race: "Human", weight: 45 },
  { race: "Half-Elf", weight: 12 },
  { race: "Dwarf", weight: 10 },
  { race: "Elf", weight: 9 },
  { race: "Halfling", weight: 7 },
  { race: "Tiefling", weight: 5 },
  { race: "Gnome", weight: 4 },
  { race: "Half-Orc", weight: 4 },
  { race: "Dragonborn", weight: 2 },
  { race: "Goblin", weight: 1 },
  { race: "Hobgoblin", weight: 1 },
];

// ── WEATHER TAGS ────────────────────────────────────────────────
// any, fog, rain, storm, cold, snow, clear, wind, night
// Encounters vælger enten "any" eller specifikke tags.
// Generatoren vælger vejr, der matcher encounterets weatherTags.
const weatherBySeason = {
  Forår: [
    { name: "Let forårsregn", tags: ["rain"], text: "Regnen falder blidt. Blade nikker under dråberne. Vejen føles næsten venlig.", effect: "Animal Handling får advantage." },
    { name: "Forårskulde", tags: ["cold", "clear"], text: "Blomster står åbne i kulden. Fugle synger tappert. Dagen prøver at være venlig.", effect: "Animal Handling og Nature får advantage." },
    { name: "Skinnende dug", tags: ["clear"], text: "Duggen ligger som perler i græsset. Hvert skridt sender små glimt op. Morgenens lys føles rent.", effect: "Første helbredelsesfortryllelse heler +1d4 HP." },
    { name: "Varm aftenvind", tags: ["wind", "clear"], text: "En varm vind glider hen over vejen. Græsset bøjer sig langsomt. Dagen slipper ikke helt sit tag.", effect: "Persuasion får advantage ved fredelige møder." },
    { name: "Regn efter sol", tags: ["rain", "clear"], text: "Regnen falder gennem sollys. Dråberne glimter som små varsler. Verden virker både vasket og afsløret.", effect: "Insight får advantage." },
    { name: "Hidsig byge", tags: ["rain", "storm"], text: "Regnen kommer pludseligt og hårdt. Så stopper den lige så brat. Verden drypper som efter et chok.", effect: "Første Stealth-check efter bygen får advantage." },
    { name: "Urolig vind", tags: ["wind"], text: "Vinden skifter retning uden mønster. Ord blæser væk midt i sætninger. Intet føles helt stabilt.", effect: "Concentration checks har DC +2." },
    { name: "Duft af lyng", tags: ["wind", "clear"], text: "Vinden bærer lyng og våd jord. Bakkerne virker ældre end kortene. Vejen føles glemt, men ikke fjendtlig.", effect: "Survival får advantage." },
    { name: "Grønligt lys", tags: ["clear"], text: "Lyset får blade, hud og sten til at virke grønne. Skoven føles tættere på, også hvor der ingen skov er.", effect: "Nature og Arcana får advantage ved fey-tegn." },
    { name: "Kold morgen", tags: ["cold", "clear"], text: "Frosten ligger som sølv i grøfterne. Åndedræt står hvidt. Selv læder knirker i kulden.", effect: "Første DEX-check har disadvantage, medmindre gruppen varmer op." },
    { name: "Pludselig hagl", tags: ["cold", "storm"], text: "Små hagl slår mod hjelme, kapper og blade. Verden bliver hvidprikket og hård. Samtaler dør hurtigt.", effect: "Perception over 60 ft. har disadvantage." },
    { name: "Lun tåge", tags: ["fog"], text: "Tågen er lun og mærkelig blød. Den lægger sig om ansigter og hænder som ånde. Afstande bliver usikre.", effect: "Stealth får advantage." },
    { name: "Fin støvregn", tags: ["rain", "fog"], text: "Fin regn hænger i luften uden rigtigt at falde. Alt glinser svagt. Lyde virker dæmpede, næsten hellige.", effect: "Religion eller Arcana får advantage." },
    { name: "Fjern havgus", tags: ["fog", "wind"], text: "En salt dis driver ind over vejen. Luften smager af kyst, selv langt inde i landet. Måger høres uden at ses.", effect: "Nature eller Survival til vejrtegn får advantage." },
    { name: "Tavs solopgang", tags: ["clear"], text: "Solen står op uden fuglesang. Lyset breder sig langsomt. Stilheden når frem først.", effect: "Første encounter starter med alle passive Perception -2." },
    { name: "Lysende skyer", tags: ["clear"], text: "Skyerne lyser svagt indefra. Ikke som lyn. Mere som noget, der drømmer bag dem.", effect: "Arcana får advantage; Wild Magic anbefales." },
    { name: "Varm jordduft", tags: ["clear"], text: "Jorden dufter varmt og mørkt. Rødder, svampe og gamle ting vækkes. Noget under jer lever.", effect: "Nature DC 13 afslører underjordisk aktivitet." },
    { name: "Vejrskifte", tags: ["wind", "storm"], text: "Varmen falder pludseligt. Fugle letter. Et eller andet i kroppen ved, at noget vender.", effect: "Perception eller Insight får advantage én gang." },
    { name: "Strid modregn", tags: ["rain", "wind"], text: "Regnen slår direkte imod jer. Ansigter må vendes væk. Vejen bliver til arbejde.", effect: "Man kan ikke holde hurtig march uden CON-save DC 13." },
    { name: "Klar efterregn", tags: ["rain", "clear"], text: "Regnen er stoppet. Alt står skarpt og vådt. Spor er friske, og verden har ikke nået at lyve igen.", effect: "Tracking får advantage." },
  ],
  Sommer: [
    { name: "Trykkende varme", tags: ["clear"], text: "Luften står stille. Sveden kommer hurtigt. Selv små byrder føles større.", effect: "Ved hård march: CON-save DC 12 eller 1 level exhaustion." },
    { name: "Sprukken tørke", tags: ["clear"], text: "Jorden er hård og sprukken. Græsset rasler som papir. Alt vand føles værdifuldt.", effect: "CON-save DC 13 ved lang rejse, eller 1 exhaustion." },
    { name: "Støvstorm", tags: ["storm", "wind"], text: "Støv rejser sig som en mur. Øjne svier. Vejen forsvinder i brun luft.", effect: "Blinded ud over 15 ft.; Survival DC 14 for ikke at fare vild." },
    { name: "Uventet varme", tags: ["clear"], text: "Varmen kommer brat, som om nogen åbnede en ovn. Fugle tier. Jorden damper svagt.", effect: "Ildskade får +1 skade pr. terning én gang." },
    { name: "Guldlys", tags: ["clear"], text: "Eftermiddagslyset ligger varmt på alt. Selv ødelagte ting virker smukke. Det er svært at være kynisk.", effect: "Persuasion og Performance får advantage." },
    { name: "Honningvarm sol", tags: ["clear"], text: "Solen ligger blød og gylden på vejen. Bier summer ved blomsterne. Verden virker næsten uskyldig.", effect: "Karakterer får advantage på ét socialt check, hvis de ikke starter fjendtligt." },
    { name: "Blød sommerregn", tags: ["rain"], text: "Regnen falder varmt og blidt. Den vasker støv af blade og skuldre. Rejsen føles et øjeblik mindre lang.", effect: "Short rest heler +1 HP pr. Hit Die." },
    { name: "Klam varme", tags: ["clear"], text: "Varmen klæber. Insekter summer i grøfterne. Selv stilheden virker svedig.", effect: "CON-saves mod gift/sygdom har disadvantage denne time." },
    { name: "Torden i det fjerne", tags: ["storm"], text: "Mørke skyer samler sig uden at bryde. Torden rumler langt væk, som et løfte. Noget er på vej.", effect: "Intimidation får advantage." },
    { name: "Varme lyn", tags: ["storm"], text: "Lyn flakker lydløst inde i skyerne. Luften lugter af metal. Hår rejser sig på arme og nakke.", effect: "Lyn/tordenskader får +1 skade pr. terning én gang." },
    { name: "Fjern stormfront", tags: ["storm", "wind"], text: "En storm står som en mur i horisonten. Den bevæger sig langsomt. Men den bevæger sig mod jer.", effect: "Gruppen kan vælge: hurtig rejse med exhaustion-risiko eller forsinkelse." },
    { name: "Blå klarhed", tags: ["clear"], text: "Himlen er blå og nådesløs. Ingen skyer, ingen skjul. Horisonten virker for langt væk.", effect: "Perception over lange afstande får advantage." },
    { name: "Knastør blæst", tags: ["wind", "clear"], text: "Vinden tørrer læber, øjne og tanker. Græsset hvisler. Ild ville elske denne dag.", effect: "Ild breder sig dobbelt så hurtigt." },
    { name: "Rød solnedgang", tags: ["clear"], text: "Himlen brænder rødt. Skygger falder lange og sorte. Vejen ligner noget, der fører ind i et gammelt sagn.", effect: "Arcana får advantage indtil mørket falder på." },
    { name: "Lav dis", tags: ["fog"], text: "En svag dis ligger lavt over jorden. Solen er der, men uden varme. Alt føles som et valg, der allerede er truffet.", effect: "WIS-save DC 13. Ved fejl: disadvantage på næste Insight-check." },
    { name: "Mild nat", tags: ["night", "clear"], text: "Natten er mild. Flammer står rolige. Stjernerne virker tættere end normalt.", effect: "Første short rest giver én karakter 1 ekstra Hit Die tilbage." },
    { name: "Sol gennem røg", tags: ["clear"], text: "Solen ses gennem et røgslør. Lyset bliver kobberfarvet. Alt virker som før et slag.", effect: "Initiative får advantage for karakterer, der opdager røgens kilde." },
    { name: "Fjern lynild", tags: ["storm"], text: "Lyn flakker bag horisonten. Tordenen kommer meget senere. Noget langt væk er vredt.", effect: "Arcana eller Religion DC sænkes med 2 ved varsler." },
    { name: "Mosevarm tåge", tags: ["fog"], text: "Tågen er varm og fugtig. Den lugter af stillestående vand. Hvert skridt lyder vådt.", effect: "Saves mod gift/sygdom har disadvantage." },
    { name: "Død luft", tags: ["clear"], text: "Luften rører sig ikke. Ingen blade, ingen støv, ingen insekter. Verden holder vejret.", effect: "Initiative får advantage for den første, der handler beslutsomt." },
  ],
  Efterår: [
    { name: "Efterårsblæst", tags: ["wind"], text: "Blade løber over vejen som små dyr. Vinden bærer lugten af råd og æbler. Alt er på vej væk.", effect: "Survival til at finde ly får advantage." },
    { name: "Kobberfarvet aften", tags: ["clear"], text: "Aftenen gløder kobberrød. Ansigter får hårde kanter. Selv venlige ord lyder skarpere.", effect: "Intimidation får advantage; Persuasion har disadvantage." },
    { name: "Tung regn", tags: ["rain"], text: "Regnen falder tungt og konstant. Jorden drikker uden at blive mæt. Hver lyd føles tættere på end den er.", effect: "Ranged attacks over 30 ft. har disadvantage." },
    { name: "Grå himmel", tags: ["clear"], text: "Himlen er ensfarvet og tung. Lyset kommer alle steder fra og ingen steder. Farverne virker flade.", effect: "Investigation får advantage på små detaljer." },
    { name: "Lilla skumring", tags: ["clear", "night"], text: "Skumringen bliver lilla. Træer og sten mister deres almindelige farve. Noget feyagtigt ligger under huden på verden.", effect: "WIS-save DC 13, ellers er karakteren charmed af stemningen i 1 minut." },
    { name: "Bitter vind", tags: ["wind", "cold"], text: "Vinden skærer gennem tøj. Den finder gamle skader og nye bekymringer. Ingen går afslappet.", effect: "Constitution saves mod exhaustion har disadvantage." },
    { name: "Mørke bygeskyer", tags: ["storm", "rain"], text: "Bygeskyer driver som sorte dyr over himlen. Solen dukker op og forsvinder. Humøret følger med.", effect: "Insight DC +2 under sociale konflikter." },
    { name: "Dyb skygge", tags: ["night", "fog"], text: "Skyerne lukker sig tæt. Selv midt på dagen føles det som sen aften. Farverne trækker sig tilbage.", effect: "Udøde og onde væsner får +1 på Stealth i området." },
    { name: "Piskende regn", tags: ["rain", "wind"], text: "Regnen slår hårdt mod ansigtet. Den vil ind i øjne, mund og tanker. Verden bliver til linjer af vand.", effect: "Trylleformelangreb over 30 ft. har disadvantage." },
    { name: "Askefarvet dag", tags: ["clear"], text: "Dagen har ingen farve. Solen er skjult bag en grå hinde. Alt smager svagt af røg.", effect: "Survival DC 13 finder retning mod katastrofens kilde." },
    { name: "Mørk vind", tags: ["wind", "cold"], text: "Vinden føles koldere end luften. Den bærer lugten af stenrum og gammel jord.", effect: "Opdagelse af udøde eller Religion får advantage." },
    { name: "Kold tågeregn", tags: ["fog", "rain", "cold"], text: "Regn og tåge er blevet samme ting. Den samler sig i hår og øjenbryn. Verden drypper uden lyd.", effect: "Stealth får advantage; ranged attacks har disadvantage." },
    { name: "Askesne", tags: ["snow", "cold"], text: "Grå flager falder fra en skyfri himmel. De smelter ikke. De lægger sig som sorg på skuldrene.", effect: "Religion DC 13 afslører varsel; ved succes genvinder én karakter inspiration." },
    { name: "Natteblæst", tags: ["night", "wind"], text: "Vinden går gennem mørket som fingre. Lanterner flakker. Noget uset bevæger sig med den.", effect: "Synsbaseret Perception har disadvantage." },
    { name: "Klar efterregn", tags: ["rain", "clear"], text: "Regnen er stoppet. Alt står skarpt og vådt. Spor er friske, og verden har ikke nået at lyve igen.", effect: "Tracking får advantage." },
    { name: "Måneklar nat", tags: ["night", "clear"], text: "Månen ligger stor og lys over vejen. Sten, blade og ansigter får sølvkanter. Hemmeligheder har svært ved at gemme sig.", effect: "Perception får advantage; Stealth har disadvantage." },
    { name: "Stille efter storm", tags: ["storm", "rain"], text: "Alt er vådt og væltet. Grenene drypper. Stilheden bagefter føles næsten skyldig.", effect: "Investigation af spor efter kaos får advantage." },
    { name: "Fjern klokketone", tags: ["wind", "clear"], text: "Vejret er stille, men en klokke høres langt væk. Ingen by er på kortet. Lyden kommer med vinden og forsvinder igen.", effect: "Religion eller History får advantage." },
    { name: "Gennemsigtig regn", tags: ["rain"], text: "Regnen falder så fint, at den næsten ikke ses. Men alt bliver vådt. Hemmeligheder ligeså.", effect: "Deception har disadvantage." },
    { name: "Sol og sorte skyer", tags: ["storm", "clear"], text: "Solen skinner på jer, mens sorte skyer hænger længere fremme. Vejen går direkte mod mørket.", effect: "WIS-saves får advantage, indtil gruppen når skyerne." },
  ],
  Vinter: [
    { name: "Knitrende frost", tags: ["cold", "clear"], text: "Alt er dækket af tynd rim. Buske knitrer ved berøring. Vejen lyder gammel under støvlerne.", effect: "Stealth har disadvantage på hård jord." },
    { name: "Hård frostnat", tags: ["cold", "night"], text: "Natten bider. Vand fryser ved kanten af flasker. Søvn kommer som en fjende.", effect: "Long rest kræver ly og varme; ellers fjernes ingen exhaustion." },
    { name: "Tynd isslag", tags: ["cold", "rain"], text: "En næsten usynlig is lægger sig på sten og hjulspor. Vejen ser sikker ud, indtil den ikke er det.", effect: "DEX-save DC 12 ved løb eller bevægelse i kamp." },
    { name: "Rim på våben", tags: ["cold"], text: "Tynd frost samler sig på metal. Klingerne bliver blege. Selv blod ville se sort ud her.", effect: "Første nærkampsangreb med metalvåben har -1 to hit." },
    { name: "Klar stjernefrost", tags: ["night", "cold", "clear"], text: "Natten er iskold og klar. Stjernerne er nåle. Hvert ord fryser næsten fast.", effect: "Navigation efter stjerner får advantage." },
    { name: "Tør kulde", tags: ["cold", "clear"], text: "Kulden bider uden fugt. Læber sprækker. Metal føles sultent mod huden.", effect: "Sleight of Hand har disadvantage uden handsker." },
    { name: "Stille sne", tags: ["snow", "cold"], text: "Sne falder uden vind. Spor dækkes langsomt. Verden bliver mindre og mere hemmelig.", effect: "Tracking har disadvantage." },
    { name: "Våd sne", tags: ["snow", "cold"], text: "Sne falder tungt og vådt. Den bliver til sjap under støvler. Kulden kravler op nedefra.", effect: "Bevægelse i åbent terræn reduceres med 10 ft." },
    { name: "Spredte snefnug", tags: ["snow", "cold"], text: "Snefnug falder enkeltvis og langsomt. De virker for store. Nogle når aldrig jorden.", effect: "Arcana DC 12 afslører planar påvirkning." },
    { name: "Mørk sne", tags: ["snow", "night", "cold"], text: "Sne falder gennem skumring. Flagerne virker grå, før de rammer. Verden bliver stille på en utryg måde.", effect: "Stealth får advantage; morale checks har disadvantage." },
    { name: "Vinterklar sol", tags: ["cold", "clear"], text: "Solen skinner klart over frost. Det er smukt og ubarmhjertigt. Alt glitrer, alt afslører.", effect: "Investigation får advantage i dagslys." },
    { name: "Kold sol", tags: ["cold", "clear"], text: "Solen skinner uden varme. Skyggerne er skarpe. Det smukke ved dagen virker ligeglad.", effect: "WIS-saves mod frygt får advantage." },
    { name: "Rasende blæst", tags: ["wind", "cold"], text: "Vinden river i hår og kapper. Småsten hopper over vejen. Stemmer bliver flået i stykker.", effect: "Flyvende væsner har disadvantage på angreb." },
    { name: "Sølvregn", tags: ["rain", "cold"], text: "Dråberne glimter sølv i luften. De efterlader ingen fugt. Selv skeptikere bliver stille.", effect: "Detect Magic afslører svag transmutation over området." },
    { name: "Sort regn", tags: ["rain"], text: "Regnen falder mørk mod sten og hud. Den lugter svagt af aske. Ingen kommenterer det først.", effect: "CON-save DC 13, ellers er karakteren forgiftet i 10 minutter." },
    { name: "Kraftig medvind", tags: ["wind"], text: "Vinden presser jer fremad. Kapper flyver bagud. Vejen virker utålmodig.", effect: "Rejsehastighed øges med 25%, men Perception bagud har disadvantage." },
    { name: "Klar fuldmåne", tags: ["night", "clear"], text: "Fuldmånen hænger stor og lys over vejen. Alt kaster hårde skygger. Natten lyver ikke.", effect: "Perception og Investigation får advantage om natten." },
    { name: "Frost i skyggerne", tags: ["cold", "clear"], text: "Kun skyggerne har frost. Solpletter er varme. Verden virker delt i to regler.", effect: "Arcana DC 14 afslører svag planar/nekrotisk påvirkning." },
    { name: "Vejr uden lyd", tags: ["rain", "wind", "fog"], text: "Regn falder, men I hører den næsten ikke. Vinden rører sig, men siger intet. Det føles stjålet.", effect: "Lydbaseret Perception har disadvantage." },
    { name: "Skærende klart vejr", tags: ["clear", "cold"], text: "Alt står skarpt. Bjerge, træer og fugle virker tættere på. Det er svært at lyve for sig selv.", effect: "Insight får advantage." },
  ],
};

const ALL_SEASONS = ["Forår", "Sommer", "Efterår", "Vinter"];
const SEASON_ICONS = { Forår: "✿", Sommer: "☀", Efterår: "🍂", Vinter: "❄" };
const SEASON_COLORS = { Forår: "#4f9f73", Sommer: "#b8781d", Efterår: "#bb5632", Vinter: "#5b8fc5" };

const ALL_TYPES = ["Social", "Combat", "Mystery", "Exploration", "Wonder", "Danger"];
const TYPE_SIGILS = { Social: "⚜", Combat: "⚔", Mystery: "◈", Exploration: "✦", Wonder: "✧", Danger: "☠" };
const typeColor = { Social: "#7564b8", Combat: "#b84732", Mystery: "#553f94", Exploration: "#357d62", Wonder: "#a6771f", Danger: "#a33b3b" };

const ALL_TONES = ["Eventyragtig", "Mørk", "Komisk", "Fey", "Uhyggelig", "Hverdagsmagisk", "Kæmpe-tema"];
const TONE_SIGILS = {
  Eventyragtig: "✦",
  Mørk: "☾",
  Komisk: "❧",
  Fey: "✿",
  Uhyggelig: "◌",
  Hverdagsmagisk: "⌂",
  "Kæmpe-tema": "♜",
};
const toneColor = {
  Eventyragtig: "#b8962e",
  Mørk: "#7d6b8e",
  Komisk: "#c1843a",
  Fey: "#4f9f73",
  Uhyggelig: "#8f4a55",
  Hverdagsmagisk: "#8b6f47",
  "Kæmpe-tema": "#9b5b37",
};

// ── ENCOUNTERS ──────────────────────────────────────────────────
// weatherTags: ["any"] betyder frit vejr.
// weirdness: 0 = jordnær, 100 = meget mærkelig.
const encounters = [
  {
    title: "Den Delte Byrde",
    type: "Social",
    subtype: "Mystery",
    tone: "Mørk",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "En rejsende beder gruppen hjælpe med at bære en tung kiste et stykke vej.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 25 }, { race: "Half-Orc", chance: 25 }],
    twist: "Kisten er ikke tung på grund af vægt, men på grund af noget magisk, der reagerer på skyld.",
    effect: "STR save DC 12. Fail: disadvantage på næste STR-check. Success: advantage på næste STR-check.",
    notes: { hook: "Rejsende tilbyder betaling eller en velsignelse.", komplikation: "Kisten bliver tungere, når nogen lyver.", belønning: "Et navn indridset under låget peger mod næste lokale konflikt." },
  },
  {
    title: "Den Tavse Jæger",
    type: "Mystery",
    subtype: "Danger",
    tone: "Uhyggelig",
    weirdness: 35,
    weatherTags: ["fog", "night", "wind", "any"],
    encounter: "En jæger følger gruppen på afstand i timevis uden at tage kontakt.",
    raceHints: [{ race: "Elf", chance: 50 }, { race: "Human", chance: 30 }, { race: "Tabaxi", chance: 20 }],
    twist: "Jægeren jager ikke gruppen, men noget der allerede følger efter dem.",
    effect: "Perception DC 14: opdager hvad jægeren følger. Fail: næste encounter starter med Surprise.",
    notes: { hook: "Jægeren efterlader små advarsler i vejsiden.", komplikation: "Hvis gruppen konfronterer jægeren hårdt, trækker byttet nærmere.", belønning: "Jægeren kan vise en sikker men langsommere rute." },
  },
  {
    title: "Den Lånte Hest",
    type: "Social",
    subtype: "Exploration",
    tone: "Hverdagsmagisk",
    weirdness: 20,
    weatherTags: ["any"],
    encounter: "En velplejet hest står bundet ved vejen uden synlig ejer.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Dragonborn", chance: 20 }],
    twist: "Ejeren holder øje fra afstand og vurderer, om gruppen er tyve eller ordentlige folk.",
    effect: "Animal Handling DC 12. Success: hesten stoler på gruppen. Fail: den vrinsker og tilkalder ejeren.",
    notes: { hook: "Hesten bærer en sadeltaske med et ulæst brev.", komplikation: "Hesten nægter at gå i retning af en fare.", belønning: "Ejeren giver et rygte, hvis gruppen handler hæderligt." },
  },
  {
    title: "Broen uden Told",
    type: "Exploration",
    subtype: "Mystery",
    tone: "Eventyragtig",
    weirdness: 55,
    weatherTags: ["fog", "rain", "night", "any"],
    encounter: "En gammel stenbro krydser en mørk flod. Der er ingen vogter, ingen told, ingen spor.",
    raceHints: [{ race: "Human", chance: 60 }, { race: "Dwarf", chance: 25 }, { race: "Gnome", chance: 15 }],
    twist: "Broen måler skyld. Den karakter med mest uforløst skyld mærker stenen give efter under sig.",
    effect: "WIS save DC 14 ved krydsning. Fail: restrained i 1 runde af stenens greb.",
    notes: { hook: "Broen er den hurtigste vej frem.", komplikation: "At bære en anden over tæller som en bekendelse.", belønning: "Den skyldige får et klart billede af, hvordan skylden kan sones." },
  },
  {
    title: "Den Lille Domstol",
    type: "Social",
    subtype: "Wonder",
    tone: "Fey",
    weirdness: 70,
    weatherTags: ["clear", "fog", "any"],
    encounter: "Små fey-væsner holder retssag over en frø, der nægter sig skyldig.",
    raceHints: [{ race: "Gnome", chance: 45 }, { race: "Halfling", chance: 35 }, { race: "Elf", chance: 20 }],
    twist: "Frøen er skyldig, men loven er så urimelig, at selv anklageren skammer sig.",
    effect: "Persuasion DC 14. Success: gruppen får fey-favor. Fail: én mister en lille ting.",
    notes: { hook: "Retten kræver en neutral dommer.", komplikation: "Alle svar skal gives på rim.", belønning: "En fey-gæld kan indløses som advantage på et socialt check." },
  },
  {
    title: "Den Venlige Kæmpeunge",
    type: "Social",
    subtype: "Wonder",
    tone: "Kæmpe-tema",
    weirdness: 55,
    weatherTags: ["any"],
    encounter: "En ung kæmpe sidder forvirret ved vejen og forsøger at gemme sig bag et træ.",
    raceHints: [{ race: "Giant", chance: 80 }, { race: "Goliath", chance: 20 }],
    twist: "Den er løbet hjemmefra, fordi den ikke vil arve familiens krig.",
    effect: "Persuasion DC 14. Success: den hjælper med en tung forhindring. Fail: dens familie finder den.",
    notes: { hook: "Kæmpeungen kender en genvej gennem farligt terræn.", komplikation: "Den taler alt for højt og tiltrækker opmærksomhed.", belønning: "En kæmpefavor: løft, kast, skjul eller advarsel." },
  },
  {
    title: "Den Sløve Banditflok",
    type: "Combat",
    subtype: "Social",
    tone: "Komisk",
    weirdness: 15,
    weatherTags: ["any"],
    encounter: "En flok banditter springer frem, men virker trætte, sultne og dårligt organiserede.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Half-Orc", chance: 20 }, { race: "Goblin", chance: 25 }],
    twist: "De vil egentlig hellere ansættes end røve nogen.",
    effect: "Persuasion DC 13. Success: combat undgås; de deler rygter mod mad eller mønter.",
    notes: { hook: "Banditterne har et håndtegnet kort over deres egne baghold.", komplikation: "Én bandit prøver stadig at virke professionel.", belønning: "Et rygte, et dårligt kort og måske en billig lejesvend." },
  },
  {
    title: "Den Sorte Hest",
    type: "Mystery",
    subtype: "Danger",
    tone: "Mørk",
    weirdness: 50,
    weatherTags: ["night", "fog", "wind"],
    encounter: "En sort hest uden sadel følger vejen i samme retning som gruppen.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Elf", chance: 25 }, { race: "Half-Orc", chance: 25 }],
    twist: "Hesten viser sig kun for dem, der snart skal træffe et voldeligt valg.",
    effect: "Animal Handling DC 14. Success: hesten leder gruppen uden om blodbad.",
    notes: { hook: "Hesten standser ved bestemte personer.", komplikation: "Hvis nogen rider den, ser de én mulig død.", belønning: "Et varsel om en kamp, før kampen sker." },
  },

  // ── NYE ENTRIES — 40+ ────────────────────────────────────────
  {
    title: "Kroen i Folden",
    type: "Social",
    subtype: "Wonder",
    tone: "Eventyragtig",
    weirdness: 65,
    weatherTags: ["night", "fog", "rain"],
    encounter: "En lille kro ligger pludselig ved en bøjning, hvor kortet viser åbent land.",
    raceHints: [{ race: "Halfling", chance: 45 }, { race: "Human", chance: 35 }, { race: "Gnome", chance: 20 }],
    twist: "Kroen findes kun for rejsende, der har glemt hvorfor de drog ud.",
    effect: "Insight DC 13. Success: en karakter husker sit egentlige mål og får inspiration.",
    notes: { hook: "Værtinden kender gruppens navne.", komplikation: "At sove der koster et minde, ikke mønter.", belønning: "Et varmt måltid giver +1d4 temp HP." },
  },
  {
    title: "De Syngende Sten",
    type: "Exploration",
    subtype: "Mystery",
    tone: "Eventyragtig",
    weirdness: 50,
    weatherTags: ["wind", "clear"],
    encounter: "Tre flade sten står ved vejen og synger i dybe toner, når nogen går forbi.",
    raceHints: [{ race: "Dwarf", chance: 40 }, { race: "Elf", chance: 25 }, { race: "Human", chance: 35 }],
    twist: "Stenene stemmer kun i, når en gammel ed i nærheden er ved at blive brudt.",
    effect: "History DC 14. Success: forstå eden og få advantage på næste Persuasion om løfter.",
    notes: { hook: "Sangen nævner et kendt sted i forvrænget form.", komplikation: "Hvis man slår på stenene, vækker man vogteren.", belønning: "En linje i sangen afslører en skjult passage." },
  },
  {
    title: "Vaskekonen med Kronen",
    type: "Social",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 35,
    weatherTags: ["any"],
    encounter: "En vaskekone sidder ved en balje og renser en kongekrone, som om det var almindeligt sølvtøj.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 20 }, { race: "Halfling", chance: 25 }],
    twist: "Kronen tilhører ikke en konge endnu; den leder efter én.",
    effect: "WIS save DC 13 ved berøring. Fail: karakteren føler sig kaldet til at give ordrer i 10 minutter.",
    notes: { hook: "Hun beder gruppen passe kronen, mens hun henter mere sæbe.", komplikation: "Kronen adlyder kun ydmyghed.", belønning: "Den kan pege mod en skjult arving eller tronraner." },
  },
  {
    title: "Den Forkerte Begravelse",
    type: "Mystery",
    subtype: "Social",
    tone: "Mørk",
    weirdness: 30,
    weatherTags: ["rain", "fog", "night", "any"],
    encounter: "Et lille følge bærer en tom kiste og beder gruppen gå stille et øjeblik.",
    raceHints: [{ race: "Human", chance: 60 }, { race: "Dwarf", chance: 25 }, { race: "Elf", chance: 15 }],
    twist: "De sørger over en person, der stadig lever, fordi landsbyen allerede har opgivet dem.",
    effect: "Insight DC 14. Success: forstå frygten og få clue om hvad der truer landsbyen.",
    notes: { hook: "Følget tror, gruppen er sendt som svar på en bøn.", komplikation: "Den formodet døde kommer gående midt i ceremonien.", belønning: "Landsbyens ældste skylder en tjeneste." },
  },
  {
    title: "Hanen der Galer Baglæns",
    type: "Wonder",
    subtype: "Mystery",
    tone: "Komisk",
    weirdness: 60,
    weatherTags: ["clear", "any"],
    encounter: "En hane går baglæns over vejen og galer med en lyd, der får ure til at tøve.",
    raceHints: [{ race: "Gnome", chance: 40 }, { race: "Halfling", chance: 40 }, { race: "Human", chance: 20 }],
    twist: "Hanen har slugt et stykke fortryllet tid.",
    effect: "Animal Handling DC 13. Success: gruppen får +2 på næste initiative. Fail: én mister sin næste reaction.",
    notes: { hook: "En ophidset bonde jagter hanen med et net.", komplikation: "Hver gang hanen galer, gentager nogen deres sidste sætning.", belønning: "Et lille tids-glimt afslører et nært baghold." },
  },
  {
    title: "Den Blege Spejlhandler",
    type: "Social",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 70,
    weatherTags: ["fog", "night"],
    encounter: "En bleg handelsmand tilbyder håndspejle, der viser ansigter før de taler.",
    raceHints: [{ race: "Tiefling", chance: 35 }, { race: "Human", chance: 45 }, { race: "Elf", chance: 20 }],
    twist: "Spejlene viser ikke fremtiden, men den tanke personen prøver at skjule.",
    effect: "Insight DC 14 ved brug. Success: advantage på næste social check mod målpersonen. Fail: målpersonen ser også dig.",
    notes: { hook: "Han giver første spejl gratis.", komplikation: "Et spejl viser en person, der ikke står der.", belønning: "Sandheden om en løgn i næste landsby." },
  },
  {
    title: "Kæmpens Tabte Tand",
    type: "Exploration",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 40,
    weatherTags: ["any"],
    encounter: "En tand på størrelse med et skjold ligger halvt skjult mellem stenene.",
    raceHints: [{ race: "Giant", chance: 70 }, { race: "Goliath", chance: 20 }, { race: "Dwarf", chance: 10 }],
    twist: "Tanden er faldet ud under en kamp, og ejeren leder stadig vredt efter den.",
    effect: "Nature eller Medicine DC 13. Success: afgør hvilken type kæmpe og hvor nyligt den passerede.",
    notes: { hook: "Tanden kan sælges dyrt til en alkymist.", komplikation: "Den fungerer som sporingsfokus for kæmpen.", belønning: "Pulveriseret tand giver advantage på ét STR-check." },
  },
  {
    title: "Manden med de Tre Skygger",
    type: "Mystery",
    subtype: "Danger",
    tone: "Mørk",
    weirdness: 75,
    weatherTags: ["clear", "night"],
    encounter: "En mand hilser høfligt, men hans tre skygger hilser ikke samtidig.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Tiefling", chance: 30 }, { race: "Half-Elf", chance: 20 }],
    twist: "Kun én af skyggerne tilhører ham.",
    effect: "Arcana DC 15. Success: identificér hvilken skygge der lyver. Fail: næste Stealth-check mod gruppen får advantage.",
    notes: { hook: "Manden beder om eskorte til et helligt sted.", komplikation: "Skyggerne begynder at diskutere lydløst.", belønning: "En løsrevet skygge kan afsløre en skjult fjende." },
  },
  {
    title: "Den Høflige Trold",
    type: "Social",
    subtype: "Danger",
    tone: "Komisk",
    weirdness: 35,
    weatherTags: ["any"],
    encounter: "En trold sidder ved vejen med serviet om halsen og spørger, om gruppen kender bordskik.",
    raceHints: [{ race: "Troll", chance: 80 }, { race: "Half-Orc", chance: 20 }],
    twist: "Den har besluttet, at civiliseret mad smager bedre, men forstår ikke helt civiliseret adfærd.",
    effect: "Performance eller Persuasion DC 14. Success: undgå kamp. Fail: den tolker gruppen som forret.",
    notes: { hook: "Trolden inviterer til middag.", komplikation: "Den har dækket op med ting fra tidligere rejsende.", belønning: "Den ved, hvor et farligt vadested ligger." },
  },
  {
    title: "Skomagerens Datter",
    type: "Social",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 25,
    weatherTags: ["any"],
    encounter: "En ung skomagerdatter måler fodspor i vejkanten med stor alvor.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Halfling", chance: 30 }, { race: "Gnome", chance: 20 }],
    twist: "Hun kan sy sko, der passer til det sted, ejeren inderst inde vil hen.",
    effect: "Investigation DC 13. Success: hendes målinger afslører, hvem der skjuler deres rute.",
    notes: { hook: "Hun mangler én sjælden lædersnøre.", komplikation: "Skoene går selv, hvis ejeren lyver om sit mål.", belønning: "Et par vejviser-såler giver advantage på ét Survival-check." },
  },
  {
    title: "Den Stille Menageri",
    type: "Exploration",
    subtype: "Wonder",
    tone: "Eventyragtig",
    weirdness: 55,
    weatherTags: ["any"],
    encounter: "En forladt dyrevogn står i vejsiden, men burene er lukkede indefra.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Gnome", chance: 35 }, { race: "Elf", chance: 20 }],
    twist: "Dyrene er ikke flygtet; de har byttet plads med deres ejeres drømme.",
    effect: "Animal Handling DC 14. Success: et dyr viser vej til en skjult lejr.",
    notes: { hook: "Et bur hvisker gruppens navne.", komplikation: "Åbnes det forkerte bur, slipper en drøm løs.", belønning: "Et taknemmeligt dyr følger gruppen en halv dag." },
  },
  {
    title: "Fyrtøjet i Grøften",
    type: "Mystery",
    subtype: "Wonder",
    tone: "Eventyragtig",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "Et gammelt fyrtøj ligger ved vejen med tre mærker ridset i metallet.",
    raceHints: [{ race: "Dwarf", chance: 35 }, { race: "Human", chance: 45 }, { race: "Gnome", chance: 20 }],
    twist: "Hver gnist kalder en forskellig tjener, men den tredje kræver betaling først.",
    effect: "Arcana DC 14. Success: identificér sikker brug. Fail: en gnist tilkalder noget utålmodigt.",
    notes: { hook: "Fyrtøjet er varmt uden at være brugt.", komplikation: "Det virker kun, når nogen indrømmer et behov.", belønning: "Én gnist kan give lys, varme eller en kort besked." },
  },
  {
    title: "De Ubrugte Grave",
    type: "Exploration",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 50,
    weatherTags: ["fog", "rain", "night", "cold"],
    encounter: "Fem nygravede grave står åbne ved vejen, alle med navneskilte uden navne.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 25 }, { race: "Tiefling", chance: 20 }],
    twist: "Skiltene udfylder sig langsomt, hvis gruppen bliver for længe.",
    effect: "WIS save DC 14 efter 10 minutter. Fail: frightened 1 minut. Success: se hvem gravene var tiltænkt.",
    notes: { hook: "En skovl står pænt sat i jorden.", komplikation: "Gravene lukker sig, når der lyves i nærheden.", belønning: "Et navn på en kommende morder kan dukke frem." },
  },
  {
    title: "Den Rullende Ost",
    type: "Social",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 20,
    weatherTags: ["any"],
    encounter: "En enorm ost triller ned ad vejen, mens tre handlende løber skrigende efter den.",
    raceHints: [{ race: "Halfling", chance: 45 }, { race: "Human", chance: 35 }, { race: "Dwarf", chance: 20 }],
    twist: "Osten er blevet velsignet til at finde den sultneste person i området.",
    effect: "Athletics DC 13 for at stoppe den. Fail: prone og 1d4 bludgeoning.",
    notes: { hook: "De handlende lover ost som betaling.", komplikation: "Osten forsøger at dreje mod den mest udmattede karakter.", belønning: "Et måltid giver advantage på næste CON save." },
  },
  {
    title: "Den Søvnløse Brøndmand",
    type: "Social",
    subtype: "Mystery",
    tone: "Mørk",
    weirdness: 40,
    weatherTags: ["night", "any"],
    encounter: "En mand sidder ved en brønd og beder gruppen tale lavt, fordi noget dernede endelig sover.",
    raceHints: [{ race: "Human", chance: 60 }, { race: "Dwarf", chance: 25 }, { race: "Gnome", chance: 15 }],
    twist: "Han har holdt vagt i tre døgn, men landsbyen tror han er blevet gal.",
    effect: "Stealth DC 13 for at undersøge brønden uden at vække noget. Fail: lyden begynder nedefra.",
    notes: { hook: "Han tilbyder alle sine mønter for én times hvile.", komplikation: "Brønden gentager gruppens ord med en anden stemme.", belønning: "Hvis de hjælper ham, afslører han landsbyens skjulte vandvej." },
  },
  {
    title: "Den Grønne Invitation",
    type: "Social",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 60,
    weatherTags: ["clear", "fog"],
    encounter: "Et bladformet kort lander foran gruppen med en invitation skrevet i guldsap.",
    raceHints: [{ race: "Elf", chance: 35 }, { race: "Gnome", chance: 25 }, { race: "Fey", chance: 40 }],
    twist: "Invitationen er til en fest, der allerede er slut, men gæsterne er stadig fanget i høflighederne.",
    effect: "Arcana DC 14. Success: forstå fey-etikette. Fail: ankom med social gæld.",
    notes: { hook: "Kortet nævner én karakter ved kælenavn.", komplikation: "At afvise invitationen kræver en smuk undskyldning.", belønning: "En velvalgt gave giver fey-favor." },
  },
  {
    title: "Vandreren uden Ansigt",
    type: "Mystery",
    subtype: "Danger",
    tone: "Uhyggelig",
    weirdness: 80,
    weatherTags: ["fog", "night", "rain"],
    encounter: "En vandrer kommer imod gruppen med hat og tørklæde trukket tæt, men intet ansigt bag stoffet.",
    raceHints: [{ race: "Human", chance: 40 }, { race: "Changeling", chance: 35 }, { race: "Tiefling", chance: 25 }],
    twist: "Ansigtet er blevet stjålet af en anden, som nu går frit omkring.",
    effect: "Medicine eller Arcana DC 15. Success: lær hvordan ansigtet kan genkendes på andre.",
    notes: { hook: "Vandreren skriver sit navn i støv med rystende hænder.", komplikation: "Ser man for længe på tomheden, glemmer man et ansigt.", belønning: "Et spor mod en identitetstyv." },
  },
  {
    title: "Kæmpens Spillebrikker",
    type: "Exploration",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "Store udskårne stenbrikker ligger spredt over vejen som efter et afbrudt spil.",
    raceHints: [{ race: "Giant", chance: 65 }, { race: "Goliath", chance: 20 }, { race: "Dwarf", chance: 15 }],
    twist: "Brikkerne viser en konflikt mellem kæmper, før den rammer området.",
    effect: "History DC 14 eller Giant-sprog. Success: forudse hvilken side der flytter næste gang.",
    notes: { hook: "Én brik ligner mistænkeligt en af karaktererne.", komplikation: "Flyttes en brik, kan det ændre en kæmpes plan.", belønning: "En korrekt flytning forsinker en kæmpepatrulje." },
  },
  {
    title: "Den Fløjtende Ligbærer",
    type: "Social",
    subtype: "Mørk",
    tone: "Mørk",
    weirdness: 35,
    weatherTags: ["any"],
    encounter: "En ligbærer trækker en tom båre og fløjter en alt for munter melodi.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Half-Orc", chance: 25 }, { race: "Dwarf", chance: 20 }],
    twist: "Han er blevet betalt på forhånd, men nægter at fortælle af hvem.",
    effect: "Intimidation eller Persuasion DC 14. Success: få navn eller møntmærke.",
    notes: { hook: "Båren er lavet præcis i én karakters længde.", komplikation: "Ligbæreren er overtroisk og løber ved dårlige varsler.", belønning: "Et navn på en fjende eller kommende attentatmand." },
  },
  {
    title: "Katten med Ridderbrevet",
    type: "Social",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 55,
    weatherTags: ["any"],
    encounter: "En fed kat sidder på en sten med et lille ridderbrev bundet om halsen.",
    raceHints: [{ race: "Tabaxi", chance: 30 }, { race: "Halfling", chance: 35 }, { race: "Human", chance: 35 }],
    twist: "Katten er juridisk set herre over en nærliggende mark og nægter passage uden respekt.",
    effect: "Animal Handling eller Performance DC 13. Success: katten tillader passage og viser en genvej.",
    notes: { hook: "Brevet er ægte, men underskriften er bizar.", komplikation: "At fornærme katten giver lokal juridisk ballade.", belønning: "Katten kender alle smuglerstier." },
  },
  {
    title: "Den Hule Eg",
    type: "Exploration",
    subtype: "Wonder",
    tone: "Hverdagsmagisk",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "En hul eg indeholder et lille skrivebord, en blækhus og en bog, der venter på svar.",
    raceHints: [{ race: "Elf", chance: 35 }, { race: "Gnome", chance: 30 }, { race: "Human", chance: 35 }],
    twist: "Bogen fører korrespondance med folk, der endnu ikke har mødt hinanden.",
    effect: "Investigation DC 13. Success: find en relevant besked. Fail: skriv selv noget, der kan misforstås senere.",
    notes: { hook: "Bogen er åben på en side med gruppens destination.", komplikation: "Alt skrevet i bogen bliver leveret på uventet vis.", belønning: "Et svar fra en fremtidig allieret." },
  },
  {
    title: "Den Nikkende Galge",
    type: "Danger",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 65,
    weatherTags: ["wind", "night", "fog"],
    encounter: "En gammel galge står ved vejen og nikker svagt, som om den genkender nogen.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Half-Orc", chance: 20 }, { race: "Tiefling", chance: 25 }],
    twist: "Galgen reagerer ikke på skyld, men på ufærdige domme.",
    effect: "Religion eller History DC 14. Success: lær hvis dom der mangler. Fail: WIS save DC 13 mod frightened.",
    notes: { hook: "Rebet peger mod næste by.", komplikation: "En usynlig dommer begynder at stille spørgsmål.", belønning: "At løse dommen kan lægge en ånd til ro." },
  },
  {
    title: "Mønten i Luften",
    type: "Mystery",
    subtype: "Wonder",
    tone: "Eventyragtig",
    weirdness: 60,
    weatherTags: ["clear", "any"],
    encounter: "En sølvmønt hænger stille i luften over vejens midte.",
    raceHints: [{ race: "Gnome", chance: 30 }, { race: "Human", chance: 45 }, { race: "Tiefling", chance: 25 }],
    twist: "Mønten falder først, når nogen træffer et valg uden at kende prisen.",
    effect: "Hvis nogen tager den: WIS save DC 14. Success: inspiration. Fail: disadvantage på næste gamble/valg.",
    notes: { hook: "Mønten viser et ukendt kongerige.", komplikation: "Den vender sig altid mod den mest ubeslutsomme.", belønning: "Brugt rigtigt kan den give et klart ja/nej-varsel." },
  },
  {
    title: "Den Lille Storm i Flasken",
    type: "Wonder",
    subtype: "Danger",
    tone: "Eventyragtig",
    weirdness: 65,
    weatherTags: ["storm", "wind", "rain"],
    encounter: "En glasflaske ligger i vejsiden med en rasende lille himmel fanget indeni.",
    raceHints: [{ race: "Gnome", chance: 35 }, { race: "Dwarf", chance: 25 }, { race: "Human", chance: 40 }],
    twist: "Flasken blev tabt af en vejrmager, som nu leder efter sin fejl.",
    effect: "Arcana DC 14. Success: brug flasken til at skabe dækning. Fail: 1d4 lightning damage til holderen.",
    notes: { hook: "Flasken banker mod jorden som et hjerte.", komplikation: "Den bliver mere urolig nær løgne.", belønning: "Én kontrolleret vindstød eller tordenknald." },
  },
  {
    title: "Den Høje Stol",
    type: "Exploration",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 35,
    weatherTags: ["any"],
    encounter: "En stol stor som et hus står tom ved vejen med friskskårne mærker i træet.",
    raceHints: [{ race: "Giant", chance: 75 }, { race: "Goliath", chance: 15 }, { race: "Human", chance: 10 }],
    twist: "Stolen er et mødested for kæmper, og næste møde er tæt på.",
    effect: "Survival DC 14. Success: afgør hvor længe siden den blev brugt og hvem der kommer.",
    notes: { hook: "Under sædet ligger noget tabt.", komplikation: "At klatre op kræver Athletics DC 13.", belønning: "Et kæmpebrev, en runesten eller en pose med mærkelige mønter." },
  },
  {
    title: "Barnet der Sælger Navne",
    type: "Social",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 75,
    weatherTags: ["fog", "clear", "night"],
    encounter: "Et barn sidder ved vejen og tilbyder pæne, brugte navne fra en lille trææske.",
    raceHints: [{ race: "Fey", chance: 40 }, { race: "Human", chance: 35 }, { race: "Halfling", chance: 25 }],
    twist: "Navnene tilhører folk, der gav dem væk for at undgå skæbnen.",
    effect: "WIS save DC 15 ved køb. Fail: du svarer ikke på dit eget navn i 1 time.",
    notes: { hook: "Barnet kender et navn, gruppen leder efter.", komplikation: "At spørge prisen er næsten at acceptere handlen.", belønning: "Et lånt navn kan give advantage på Deception én gang." },
  },
  {
    title: "Den Almindelige Dørmåtte",
    type: "Wonder",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 50,
    weatherTags: ["any"],
    encounter: "En dørmåtte ligger alene på vejen med ordet VELKOMMEN vævet i slidte bogstaver.",
    raceHints: [{ race: "Human", chance: 40 }, { race: "Halfling", chance: 35 }, { race: "Gnome", chance: 25 }],
    twist: "Den virker kun, hvis man tørrer fødderne og banker på luften.",
    effect: "Arcana DC 13. Success: åbner kort til et sikkert forrum. Fail: man banker på noget andet.",
    notes: { hook: "Dørmåtten dufter svagt af suppe.", komplikation: "Kun høflige gæster kommer sikkert ind.", belønning: "Et 10 minutters skjulested uden for vejen." },
  },
  {
    title: "Den Sidste Pilgrim",
    type: "Social",
    subtype: "Mørk",
    tone: "Mørk",
    weirdness: 30,
    weatherTags: ["cold", "rain", "night", "any"],
    encounter: "En pilgrim går alene med en tom relikviekapsel om halsen.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Aasimar", chance: 30 }, { race: "Dwarf", chance: 20 }],
    twist: "Relikviet blev ikke stjålet; det nægtede at blive båret videre.",
    effect: "Religion DC 14. Success: forstå hvad relikviet afviste. Fail: pilgrimmen mister håbet.",
    notes: { hook: "Pilgrimmen beder om følge til næste helligsted.", komplikation: "Relikviet dukker op i en karakters taske.", belønning: "En oprigtig bøn giver inspiration." },
  },
  {
    title: "De Små Krigstrommer",
    type: "Mystery",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 55,
    weatherTags: ["night", "fog", "wind"],
    encounter: "Små trommer høres under rødder og sten, men ingen musikant kan ses.",
    raceHints: [{ race: "Gnome", chance: 35 }, { race: "Fey", chance: 40 }, { race: "Halfling", chance: 25 }],
    twist: "Det er en marchordre fra et fey-regiment, der er mindre end en hånd.",
    effect: "Perception DC 14. Success: se regimentet før det føler sig fornærmet.",
    notes: { hook: "Regimentet kræver ret til passage.", komplikation: "At træde forkert kan starte en mikroskopisk krig.", belønning: "De kan sabotere en fjendes støvlesnører senere." },
  },
  {
    title: "Manden der Samler Undskyldninger",
    type: "Social",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 40,
    weatherTags: ["any"],
    encounter: "En ældre mand spørger venligt, om gruppen har en undskyldning, de ikke længere bruger.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Gnome", chance: 25 }, { race: "Half-Elf", chance: 25 }],
    twist: "Han samler dem til folk, der ikke kan finde ordene selv.",
    effect: "Insight DC 13. Success: giv en ærlig undskyldning og få advantage på næste Persuasion.",
    notes: { hook: "Han bærer en bog fuld af andres fortrydelse.", komplikation: "Falske undskyldninger bliver til små pletter på huden.", belønning: "En perfekt undskyldning til en kommende social konflikt." },
  },
  {
    title: "Skiltet der Fortryder",
    type: "Exploration",
    subtype: "Wonder",
    tone: "Komisk",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "Et vejskilt peger i tre retninger og skifter mening hver gang nogen læser det højt.",
    raceHints: [{ race: "Gnome", chance: 30 }, { race: "Human", chance: 50 }, { race: "Halfling", chance: 20 }],
    twist: "Skiltet prøver faktisk at beskytte rejsende mod den korteste vej.",
    effect: "Survival DC 14. Success: forstå hvilken retning skiltet frygter.",
    notes: { hook: "Skiltet hvisker 'ikke dér' efter tredje læsning.", komplikation: "Utålmodighed får det til at pege mod fare.", belønning: "Den næstkorteste vej sparer tid uden baghold." },
  },
  {
    title: "Den Sultne Vej",
    type: "Danger",
    subtype: "Mystery",
    tone: "Uhyggelig",
    weirdness: 70,
    weatherTags: ["fog", "rain", "night"],
    encounter: "Vejen foran gruppen virker en anelse bredere end før og mangler alle småsten.",
    raceHints: [{ race: "Human", chance: 40 }, { race: "Dwarf", chance: 30 }, { race: "Elf", chance: 30 }],
    twist: "Et stykke levende vej sluger tabte ting, og snart prøver den større bidder.",
    effect: "Investigation DC 14. Fail: én genstand forsvinder. Success: gruppen kan gå uden om.",
    notes: { hook: "En tidligere rejsendes støvle står alene.", komplikation: "Tunge vogne synker først.", belønning: "I vejens mave ligger småting fra mange rejsende." },
  },
  {
    title: "Den Gyldne Knogle",
    type: "Mystery",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 60,
    weatherTags: ["night", "fog", "cold"],
    encounter: "En lille gylden knogle ligger på en flad sten, som var den lagt frem til vurdering.",
    raceHints: [{ race: "Human", chance: 40 }, { race: "Dwarf", chance: 25 }, { race: "Tiefling", chance: 35 }],
    twist: "Knoglefragmentet er valuta blandt noget, der ikke handler med levende.",
    effect: "Religion DC 14. Success: genkend tegn på en natlig handel. Fail: nogen kommer for at hente betaling.",
    notes: { hook: "Knoglefragmentet er præget med et symbol.", komplikation: "At tage den accepterer en handel.", belønning: "Kan bruges til at købe ét svar fra en død." },
  },
  {
    title: "Den Lille Fyrstes Parade",
    type: "Social",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 65,
    weatherTags: ["clear", "fog"],
    encounter: "En procession af mus, biller og sommerfugle fører en fingerstor fyrste over vejen.",
    raceHints: [{ race: "Fey", chance: 50 }, { race: "Gnome", chance: 25 }, { race: "Halfling", chance: 25 }],
    twist: "Fyrsten er på vej til at erklære krig mod en barfodet bonde.",
    effect: "Persuasion DC 14. Success: mægl fred. Fail: fey-fornærmelse giver disadvantage på næste Nature.",
    notes: { hook: "Fyrsten kræver at gruppen knæler.", komplikation: "Processionen må ikke brydes.", belønning: "En miniaturefane, der kan tilkalde små hjælpere én gang." },
  },
  {
    title: "Kæmpens Grydeske",
    type: "Exploration",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 30,
    weatherTags: ["any"],
    encounter: "En grydeske længere end en lanse ligger knækket hen over et dige.",
    raceHints: [{ race: "Giant", chance: 70 }, { race: "Goliath", chance: 20 }, { race: "Human", chance: 10 }],
    twist: "Den blev brugt som våben i et skænderi om mad, ikke i krig.",
    effect: "Survival DC 13. Success: spor fører til en kæmpelejr eller dens offer.",
    notes: { hook: "Skeen lugter af krydret suppe.", komplikation: "At bære et stykke vækker appetit hos noget stort.", belønning: "Træet kan sælges eller bruges som improviseret bro." },
  },
  {
    title: "Den Hvide Sypige",
    type: "Social",
    subtype: "Mystery",
    tone: "Hverdagsmagisk",
    weirdness: 40,
    weatherTags: ["any"],
    encounter: "En sypige sidder ved vejen og reparerer en kappe, der bliver ved med at rive sig selv op.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 25 }, { race: "Half-Elf", chance: 30 }],
    twist: "Kappen prøver at slippe fri af sin ejer, fordi den har set for meget.",
    effect: "Arcana eller Insight DC 14. Success: kappen viser et kort glimt af sin sidste rejse.",
    notes: { hook: "Sypigen mangler en tråd, der ikke knækker.", komplikation: "Kappen hvisker kun til dem, der bærer den.", belønning: "Et syn af en bagmand eller skjult rute." },
  },
  {
    title: "Sækken med Hule Ord",
    type: "Mystery",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 50,
    weatherTags: ["any"],
    encounter: "En grov lærredssæk ligger og mumler tomme høfligheder.",
    raceHints: [{ race: "Gnome", chance: 35 }, { race: "Human", chance: 40 }, { race: "Halfling", chance: 25 }],
    twist: "Sækken er fuld af komplimenter, nogen har sagt uden at mene dem.",
    effect: "Performance DC 13. Success: find én sand kompliment i sækken og giv inspiration til en allieret.",
    notes: { hook: "Sækken beder om at blive tømt.", komplikation: "Falske komplimenter kravler ud som små irriterende stemmer.", belønning: "En sand sætning kan bryde en social spænding." },
  },
  {
    title: "Den Sorte Mølle",
    type: "Exploration",
    subtype: "Mørk",
    tone: "Mørk",
    weirdness: 55,
    weatherTags: ["wind", "night", "storm"],
    encounter: "En mølle uden møller drejer langsomt på en bakketop ved vejen.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 20 }, { race: "Tiefling", chance: 30 }],
    twist: "Møllen maler ikke korn, men rygter til sandhed.",
    effect: "Investigation DC 14. Success: find hvilket rygte der er ved at blive virkeligt.",
    notes: { hook: "Et lokalt navn står ridset i møllestenen.", komplikation: "At standse møllen stopper også én sand advarsel.", belønning: "Et rygte kan vendes til gruppens fordel." },
  },
  {
    title: "Den Sovende Løveport",
    type: "Exploration",
    subtype: "Eventyragtig",
    tone: "Eventyragtig",
    weirdness: 60,
    weatherTags: ["clear", "any"],
    encounter: "To stenløver flankerer en portåbning uden mur, begge med lukkede øjne.",
    raceHints: [{ race: "Human", chance: 35 }, { race: "Dwarf", chance: 35 }, { race: "Elf", chance: 30 }],
    twist: "Porten åbner kun, hvis løverne hører en sand modig gerning.",
    effect: "Performance eller Persuasion DC 14. Success: porten åbner til en kort genvej.",
    notes: { hook: "Løverne snorker som sten mod sten.", komplikation: "Pral vækker dem vrede.", belønning: "Genvej, velsignelse eller adgang til en glemt sti." },
  },
  {
    title: "Den Forladte Dukkevogn",
    type: "Mystery",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 75,
    weatherTags: ["fog", "night", "rain"],
    encounter: "En lille dukkevogn står midt på vejen og knirker, selv når ingen rører den.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Halfling", chance: 25 }, { race: "Tiefling", chance: 30 }],
    twist: "Dukken indeni bliver ældre, hver gang nogen kigger væk.",
    effect: "WIS save DC 14. Fail: frightened 1 minut. Success: se hvilket hus dukken tilhører.",
    notes: { hook: "Dukken har et kendt familienavn broderet på tøjet.", komplikation: "Hvis vognen vendes, følger den efter.", belønning: "Et clue om en forsvundet familie." },
  },
  {
    title: "Brødet der Ikke Kan Brydes",
    type: "Social",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 30,
    weatherTags: ["any"],
    encounter: "En bager forsøger desperat at knække et brød over knæet uden held.",
    raceHints: [{ race: "Halfling", chance: 40 }, { race: "Human", chance: 40 }, { race: "Dwarf", chance: 20 }],
    twist: "Brødet blev bagt med mel fra en mølle, der nægter at give slip på sin høst.",
    effect: "STR DC 15 eller Arcana DC 13. Success: brødet åbner og afslører en besked.",
    notes: { hook: "Bageren tilbyder dagens indtjening.", komplikation: "Brødet fornærmes af vold.", belønning: "Brødet mætter som en ration for hele gruppen." },
  },
  {
    title: "Den Tavse Turnering",
    type: "Social",
    subtype: "Eventyragtig",
    tone: "Eventyragtig",
    weirdness: 45,
    weatherTags: ["clear", "any"],
    encounter: "Fire riddere uden heraldik står ved vejen og peger på en tom plads mellem dem.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 25 }, { race: "Dragonborn", chance: 30 }],
    twist: "De mangler en femte deltager i en turnering, hvor ingen må tale.",
    effect: "Athletics, Acrobatics eller Performance DC 14. Success: vinder respekt og et tegn.",
    notes: { hook: "En ridder rækker en karakter en lanse.", komplikation: "Tale under prøven tæller som nederlag.", belønning: "Et riddermærke giver advantage hos ærefulde folk." },
  },
  {
    title: "Den Blå Fisk på Land",
    type: "Wonder",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 50,
    weatherTags: ["rain", "fog", "any"],
    encounter: "En blå fisk ligger midt på vejen og ser meget fornærmet ud.",
    raceHints: [{ race: "Water Genasi", chance: 30 }, { race: "Halfling", chance: 30 }, { race: "Human", chance: 40 }],
    twist: "Fisken er en forvandlet købmand, der stadig prøver at forhandle.",
    effect: "Arcana DC 14 eller Persuasion DC 13. Success: forstå boblerne og få et tilbud.",
    notes: { hook: "Fisken spytter en kobbermønt ud.", komplikation: "Den kræver at blive tiltalt som herre.", belønning: "Et vandtæt kort gemt i dens skælpose." },
  },
  {
    title: "Tårnet i Lommen",
    type: "Mystery",
    subtype: "Wonder",
    tone: "Eventyragtig",
    weirdness: 80,
    weatherTags: ["any"],
    encounter: "En lille model af et tårn ligger i en fløjlspose på vejen.",
    raceHints: [{ race: "Gnome", chance: 35 }, { race: "Elf", chance: 30 }, { race: "Human", chance: 35 }],
    twist: "Tårnet er ægte, men midlertidigt foldet sammen af sin ejer.",
    effect: "Arcana DC 15. Success: åbn døren sikkert. Fail: gruppen hører nogen banke indefra.",
    notes: { hook: "Der lyser et vindue i miniaturetårnet.", komplikation: "At ryste posen er som et jordskælv for dem indeni.", belønning: "Et skjult laboratorium eller en fanget lærling." },
  },
  {
    title: "Den Glemte Skatteopkræver",
    type: "Social",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 25,
    weatherTags: ["any"],
    encounter: "En støvet skatteopkræver kræver betaling for at bruge vejen og citerer en lov ingen kender.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 25 }, { race: "Gnome", chance: 20 }],
    twist: "Loven er ægte, men kongeriget findes ikke længere.",
    effect: "History DC 13 eller Persuasion DC 14. Success: betal symbolsk eller få ham til at give op.",
    notes: { hook: "Han har meget officielle stempler.", komplikation: "Nægter man brutalt, skriver han en klage til en død konge.", belønning: "Hans gamle registre viser skjulte broer og forladte toldhuse." },
  },
  {
    title: "Den Røde Tråd",
    type: "Mystery",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 60,
    weatherTags: ["clear", "fog", "any"],
    encounter: "En rød tråd løber tværs over vejen og fortsætter ind mellem træer og sten.",
    raceHints: [{ race: "Elf", chance: 35 }, { race: "Fey", chance: 35 }, { race: "Human", chance: 30 }],
    twist: "Tråden forbinder to personer, der har glemt et løfte til hinanden.",
    effect: "Investigation DC 13. Success: følg tråden uden at vikle jer ind. Fail: gruppen mister 1 time.",
    notes: { hook: "Tråden sitrer, når nogen nævner kærlighed eller skyld.", komplikation: "At klippe den skaber øjeblikkelig sorg et sted.", belønning: "Genforening kan give fey-favor eller lokal hjælp." },
  },
  {
    title: "Skriveren med de Tomme Øjne",
    type: "Mystery",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 65,
    weatherTags: ["night", "fog", "cold"],
    encounter: "En skriver sidder ved et lille bord og nedskriver gruppens handlinger, før de gør dem.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Tiefling", chance: 25 }, { race: "Aasimar", chance: 25 }],
    twist: "Han skriver ikke fremtiden; han modtager rapport fra noget, der læser gruppen bagfra i tiden.",
    effect: "Arcana DC 15. Success: ændr én lille forudskrevet detalje. Fail: næste handling har disadvantage.",
    notes: { hook: "Han beder dem tale langsommere, så han kan følge med.", komplikation: "Siden river sig selv ud, hvis nogen læser for langt.", belønning: "Én kommende fare kan anes som overskrift." },
  },
  {
    title: "Kæmpens Sorgsten",
    type: "Wonder",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 50,
    weatherTags: ["rain", "fog", "cold", "any"],
    encounter: "En enorm sten er dækket af forsigtige håndaftryk, alle alt for store til almindelige folk.",
    raceHints: [{ race: "Giant", chance: 75 }, { race: "Goliath", chance: 20 }, { race: "Dwarf", chance: 5 }],
    twist: "Stenen er et mindesmærke for en kæmpe, der beskyttede småfolk mod sin egen slægt.",
    effect: "Religion eller History DC 14. Success: få respektfuld indsigt i kæmpernes lokale konflikt.",
    notes: { hook: "En nyere hånd passer ikke til de gamle.", komplikation: "At vanære stenen tilkalder vrede.", belønning: "En kæmperune giver advantage på næste social check mod giants." },
  },
  {
    title: "Den Omvendte Markedsdag",
    type: "Social",
    subtype: "Wonder",
    tone: "Hverdagsmagisk",
    weirdness: 55,
    weatherTags: ["clear", "any"],
    encounter: "Et lille marked står ved vejen, hvor sælgerne betaler kunderne for at tage ting med.",
    raceHints: [{ race: "Halfling", chance: 35 }, { race: "Gnome", chance: 35 }, { race: "Human", chance: 30 }],
    twist: "Alle varer bærer på problemer, sælgerne ikke længere kan holde ud.",
    effect: "Insight DC 14. Success: vælg en ufarlig ting. Fail: få en nyttig ting med en irriterende bivirkning.",
    notes: { hook: "En købmand trygler gruppen om at tage en tekande.", komplikation: "Gratis varer kræver høflig tak.", belønning: "En lille magisk hverdagsgenstand med rollespilsværdi." },
  },
  {
    title: "Kirkeklokken i Sækken",
    type: "Mystery",
    subtype: "Mørk",
    tone: "Mørk",
    weirdness: 55,
    weatherTags: ["wind", "night", "fog"],
    encounter: "En mand slæber en sæk, der ringer dybt som en kirkeklokke for hvert tredje skridt.",
    raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 30 }, { race: "Half-Orc", chance: 15 }],
    twist: "Klokken blev stjålet for at forhindre en landsby i at advare om noget.",
    effect: "Insight DC 13. Success: manden bryder sammen og indrømmer hvem der betalte ham.",
    notes: { hook: "Lyden får dyr til at tie.", komplikation: "Hvis sækken åbnes, høres klokken langt væk.", belønning: "Advar landsbyen i tide og få husly eller allierede." },
  },
  {
    title: "Den Grinende Gravsten",
    type: "Mystery",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 50,
    weatherTags: ["any"],
    encounter: "En gravsten ved vejen griner lavt, hver gang nogen siger noget højtideligt.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 25 }, { race: "Halfling", chance: 30 }],
    twist: "Den afdøde hadede pompøsitet og nægter at hvile, før nogen fortæller sandheden kort.",
    effect: "Performance eller Persuasion DC 13. Success: stenen afslører en skjult besked.",
    notes: { hook: "Navnet på stenen er skrabet væk.", komplikation: "Højtidelige løfter giver disadvantage på checket.", belønning: "En ærlig sætning lægger ånden til ro." },
  },
  {
    title: "Den Tavse Jernko",
    type: "Wonder",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 45,
    weatherTags: ["any"],
    encounter: "En ko af jern står ved vejen og tygger langsomt på ingenting.",
    raceHints: [{ race: "Dwarf", chance: 40 }, { race: "Gnome", chance: 35 }, { race: "Human", chance: 25 }],
    twist: "Den giver mælk af rent sølv én gang om året, men kun til den rette ejer.",
    effect: "Animal Handling eller Arcana DC 14. Success: få den til at følge kortvarigt. Fail: den sætter sig tungt ned.",
    notes: { hook: "Et brændemærke viser et ukendt værksted.", komplikation: "Den er umulig at flytte mod sin vilje.", belønning: "Sølvdråber kan bruges mod visse væsner." },
  },
  {
    title: "Pigen med Kæmpens Fingerbøl",
    type: "Social",
    subtype: "Kæmpe-tema",
    tone: "Kæmpe-tema",
    weirdness: 35,
    weatherTags: ["any"],
    encounter: "En pige bærer et fingerbøl stort som en gryde og nægter at slippe det.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Goliath", chance: 25 }, { race: "Halfling", chance: 25 }],
    twist: "Fingerbøllet er bevis på en aftale mellem hendes familie og en kæmpe.",
    effect: "Persuasion DC 13. Success: hun fortæller hvor kæmpen venter. Fail: hun flygter mod faren.",
    notes: { hook: "Hun tror, gruppen er sendt for at hente hende.", komplikation: "Fingerbøllet er tungt og værdifuldt.", belønning: "Aftalen kan forhindre et kæmpeangreb, hvis den forstås." },
  },
  {
    title: "Den Hængte Lanterne",
    type: "Mystery",
    subtype: "Uhyggelig",
    tone: "Uhyggelig",
    weirdness: 55,
    weatherTags: ["night", "fog", "rain"],
    encounter: "En lanterne hænger fra en gren og lyser kun på ting, der burde være døde.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 25 }, { race: "Tiefling", chance: 30 }],
    twist: "Lygten afslører en levende person, der allerede er skrevet ind i dødsbogen.",
    effect: "Religion DC 14. Success: se dødsmærket og få én chance for at ændre det.",
    notes: { hook: "Lygten tænder, når gruppen nærmer sig.", komplikation: "Lyset peger måske på en karakter.", belønning: "Hvis døden afværges, slukker lygten og efterlader en velsignelse." },
  },
  {
    title: "De Tre Brødre på Én Hest",
    type: "Social",
    subtype: "Komisk",
    tone: "Komisk",
    weirdness: 20,
    weatherTags: ["any"],
    encounter: "Tre brødre forsøger at ride samme hest i tre forskellige retninger.",
    raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 25 }, { race: "Halfling", chance: 25 }],
    twist: "Alle tre har ret; hesten skylder penge tre steder.",
    effect: "Persuasion DC 13. Success: mægl en rute. Fail: hesten vælger selv og skaber kaos.",
    notes: { hook: "Brødrene beder gruppen dømme.", komplikation: "Hesten forstår Common og bliver fornærmet.", belønning: "En af brødrene kender et lokalt smuglertegn." },
  },
  {
    title: "Den Blå Dør i Klippen",
    type: "Exploration",
    subtype: "Eventyragtig",
    tone: "Eventyragtig",
    weirdness: 50,
    weatherTags: ["clear", "rain", "any"],
    encounter: "En blå dør sidder i en klippevæg, selvom klippen er for tynd til et rum.",
    raceHints: [{ race: "Dwarf", chance: 30 }, { race: "Gnome", chance: 35 }, { race: "Elf", chance: 35 }],
    twist: "Døren fører til den side af vejen, gruppen ville have valgt, hvis de var modigere.",
    effect: "WIS save DC 13 ved åbning. Success: inspiration. Fail: tøv og mist 10 minutter.",
    notes: { hook: "Døren har ingen håndtag på denne side.", komplikation: "Kun én kan se nøglehullet ad gangen.", belønning: "En kort, symbolsk genvej gennem en karakters frygt." },
  },
  {
    title: "Manden der Sælger Slutninger",
    type: "Social",
    subtype: "Mørk",
    tone: "Mørk",
    weirdness: 70,
    weatherTags: ["night", "fog", "cold"],
    encounter: "En boghandler tilbyder billige slutninger til historier, der er blevet for lange.",
    raceHints: [{ race: "Tiefling", chance: 35 }, { race: "Human", chance: 45 }, { race: "Elf", chance: 20 }],
    twist: "Hver slutning afslutter også noget virkeligt: et venskab, et løfte eller en jagt.",
    effect: "Arcana DC 15. Success: gennemsku konsekvensen før køb. Fail: DM vælger en mindre tråd der lukkes brat.",
    notes: { hook: "Han har en bog med en karakters navn på ryggen.", komplikation: "At bladre gratis er stadig en handel.", belønning: "En kontrolleret afslutning på en mindre forfølger eller forbandelse." },
  },
  {
    title: "Den Hvide Hjort uden Spor",
    type: "Wonder",
    subtype: "Fey",
    tone: "Fey",
    weirdness: 65,
    weatherTags: ["snow", "fog", "clear"],
    encounter: "En hvid hjort træder frem, ser direkte på gruppen og forsvinder mellem to træer.",
    raceHints: [{ race: "Elf", chance: 35 }, { race: "Fey", chance: 40 }, { race: "Firbolg", chance: 25 }],
    twist: "Hjorten efterlader ikke spor, men fjerner de spor gruppen selv har efterladt.",
    effect: "Survival DC 14. Success: forstå om den beskytter eller skjuler jer.",
    notes: { hook: "En karakter føler sig genkendt.", komplikation: "Følger man den, mister man ruten men finder et valg.", belønning: "Gruppen kan undgå forfølgere én gang." },
  },
  {
    title: "Støvlen med Brevet",
    type: "Mystery",
    subtype: "Hverdagsmagisk",
    tone: "Hverdagsmagisk",
    weirdness: 25,
    weatherTags: ["any"],
    encounter: "En enkelt støvle står pænt midt på vejen med et brev stukket ned i skaftet.",
    raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 30 }, { race: "Halfling", chance: 25 }],
    twist: "Brevet er skrevet af støvlen selv og klager over sin ejer.",
    effect: "Investigation DC 13. Success: brevet afslører ejerens retning og dårlige vane.",
    notes: { hook: "Støvlen nægter at blive samlet op af uærlige folk.", komplikation: "Den anden støvle går stadig rundt med ejeren.", belønning: "Et spor til en tyv, desertør eller glemt arving." },
  },
];

function weightedRandom(items, key = "weight") {
  const total = items.reduce((s, i) => s + (Number(i[key]) || 0), 0);
  if (total <= 0) return items[0];
  let r = Math.random() * total;
  for (const item of items) {
    r -= Number(item[key]) || 0;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRace(raceHints) {
  if (!raceHints || raceHints.length === 0) return weightedRandom(raceWeights).race;
  return weightedRandom(raceHints, "chance").race;
}

function normalizeTags(tags) {
  if (!tags || tags.length === 0) return ["any"];
  return tags;
}

function weatherMatchesEncounter(weather, encounter) {
  const eTags = normalizeTags(encounter.weatherTags);
  if (eTags.includes("any")) return true;
  return weather.tags?.some(t => eTags.includes(t));
}

function weirdnessWeight(encounter, weirdnessTarget) {
  const diff = Math.abs((encounter.weirdness ?? 50) - weirdnessTarget);
  return Math.max(1, 101 - diff);
}

function filterEncounters({ activeTypes, activeTones, weirdnessTarget }) {
  let pool = encounters.filter(e => {
    const typeOk = activeTypes.length === 0 || activeTypes.includes(e.type) || activeTypes.includes(e.subtype);
    const toneOk = activeTones.length === 0 || activeTones.includes(e.tone);
    return typeOk && toneOk;
  });

  if (pool.length === 0) pool = encounters;

  return pool.map(e => ({
    ...e,
    drawWeight: weirdnessWeight(e, weirdnessTarget),
  }));
}

function chooseWeatherForEncounter(encounter, activeSeason) {
  const seasons = activeSeason ? [activeSeason] : ALL_SEASONS;
  const allWeather = seasons.flatMap(s => weatherBySeason[s].map(w => ({ ...w, season: s })));

  const matching = allWeather.filter(w => weatherMatchesEncounter(w, encounter));
  if (matching.length > 0) return randomItem(matching);

  // Fallback: hvis encounter er meget specifikt, men sæsonen ikke har match,
  // vælg en "clear/any"-agtig vejrpost i den valgte sæson.
  const fallback = allWeather.filter(w => w.tags?.includes("clear")) || allWeather;
  return randomItem(fallback.length ? fallback : allWeather);
}

function generateCard(activeTypes, activeSeason, activeTones, weirdnessTarget) {
  const pool = filterEncounters({ activeTypes, activeTones, weirdnessTarget });
  const enc = weightedRandom(pool, "drawWeight");
  const weather = chooseWeatherForEncounter(enc, activeSeason);
  return {
    ...enc,
    weather,
    npc: pickRace(enc.raceHints),
    id: Math.random().toString(36).slice(2),
  };
}

// ── STYLE TOKENS ────────────────────────────────────────────────
const parchment = "#f3e6c8";
const parchmentLight = "#fff7df";
const parchmentDark = "#d7bd83";
const ink = "#2a1d0f";
const inkFaded = "#725d3e";
const gold = "#b8962e";
const darkWood = "#1a1007";
const deepBrown = "#2d1b0d";
const wax = "#9d2f22";
const dividerColor = "#b8962e44";

function getSeasonAccent(activeSeason) {
  return activeSeason ? SEASON_COLORS[activeSeason] : gold;
}

function TypeBadge({ type }) {
  const c = typeColor[type] || "#888";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: c,
        border: `1px solid ${c}55`,
        borderRadius: 999,
        padding: "3px 9px",
        background: `${c}12`,
        boxShadow: "inset 0 1px 0 #ffffff55",
      }}
    >
      {TYPE_SIGILS[type] || "◆"} {type}
    </span>
  );
}

function ToneBadge({ tone }) {
  const c = toneColor[tone] || gold;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: c,
        border: `1px solid ${c}55`,
        borderRadius: 999,
        padding: "3px 9px",
        background: `${c}12`,
        boxShadow: "inset 0 1px 0 #ffffff55",
      }}
    >
      {TONE_SIGILS[tone] || "✦"} {tone}
    </span>
  );
}

function Section({ label, text, sigil = "✦" }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: inkFaded,
          marginBottom: 5,
        }}
      >
        {sigil} {label}
      </div>
      <p style={{ margin: 0, fontSize: 15, color: ink, lineHeight: 1.65 }}>{text}</p>
    </div>
  );
}

function FBtn({ children, onClick, primary = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: 12,
        padding: "8px 15px",
        borderRadius: 999,
        border: primary ? `1px solid #f4d77a` : `1px solid #7a624566`,
        background: primary
          ? `linear-gradient(180deg, #c19435, #7b4912)`
          : "linear-gradient(180deg, #fff3d0aa, #d5b97866)",
        color: primary ? "#fff7df" : "#5a3d1c",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontFamily: "Georgia, serif",
        letterSpacing: "0.06em",
        boxShadow: primary ? "0 4px 10px #00000033, inset 0 1px 0 #fff3b066" : "inset 0 1px 0 #ffffff88",
      }}
    >
      {children}
    </button>
  );
}

function Ornament({ accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: accent, opacity: 0.8 }}>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${accent})` }} />
      <div style={{ fontSize: 16 }}>✦ ❧ ✦</div>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    </div>
  );
}

function FilterButton({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: "6px 11px",
        borderRadius: 999,
        border: `1px solid ${active ? color : "#ffffff26"}`,
        background: active ? `${color}2a` : "#ffffff0a",
        color: active ? "#fff0b9" : "#ffffff99",
        cursor: "pointer",
        letterSpacing: "0.07em",
        fontFamily: "Georgia, serif",
        boxShadow: active ? `0 0 16px ${color}33, inset 0 1px 0 #ffffff22` : "inset 0 1px 0 #ffffff12",
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [activeTypes, setActiveTypes] = useState([]);
  const [activeTones, setActiveTones] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [weirdnessTarget, setWeirdnessTarget] = useState(50);
  const [card, setCard] = useState(() => generateCard([], null, [], 50));
  const [history, setHistory] = useState([]);
  const [pinned, setPinned] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const accent = getSeasonAccent(activeSeason);

  const draw = useCallback(() => {
    const next = generateCard(activeTypes, activeSeason, activeTones, weirdnessTarget);
    setCard(current => {
      setHistory(prev => [current, ...prev].filter(Boolean).slice(0, 14));
      return next;
    });
  }, [activeTypes, activeSeason, activeTones, weirdnessTarget]);

  const toggleType = t => setActiveTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  const toggleTone = t => setActiveTones(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  const toggleSeason = s => setActiveSeason(prev => (prev === s ? null : s));

  const togglePin = id =>
    setPinned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearFilters = () => {
    setActiveTypes([]);
    setActiveTones([]);
    setActiveSeason(null);
    setWeirdnessTarget(50);
  };

  const cardText = `${card.title}
Type: ${card.type}${card.subtype ? ` / ${card.subtype}` : ""}
Tone: ${card.tone}
Mødt person: ${card.npc}

Hændelse:
${card.encounter}

Drejning:
${card.twist}

DM-noter:
Hook: ${card.notes?.hook || ""}
Komplikation: ${card.notes?.komplikation || ""}
Belønning: ${card.notes?.belønning || ""}

Vejr: ${card.weather.name} (${card.weather.season})
${card.weather.text}
Vejreffekt: ${card.weather.effect}

Hændelseseffekt:
${card.effect}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const sortedHistory = useMemo(
    () => [...history.filter(c => pinned.has(c.id)), ...history.filter(c => !pinned.has(c.id))],
    [history, pinned]
  );

  const activeSummary = [
    activeSeason ? `${SEASON_ICONS[activeSeason]} ${activeSeason}` : "Alle årstider",
    activeTypes.length ? `${activeTypes.length} typefilter` : "Alle typer",
    activeTones.length ? `${activeTones.length} tonefilter` : "Alle toner",
    weirdnessTarget < 35 ? "Jordnær" : weirdnessTarget > 65 ? "Mærkelig" : "Blandet",
  ].join(" · ");

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at top, #4a2b10 0, #211307 42%, #0e0905 100%)",
        minHeight: "100vh",
        padding: "22px 16px 12px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: ink,
      }}
    >
      <style>{`
        input[type="range"] {
          accent-color: ${accent};
        }
        button:focus-visible, input:focus-visible {
          outline: 2px solid ${accent};
          outline-offset: 2px;
        }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: accent, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 5 }}>
            D&D 5e · Sværdkysten
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: parchmentLight,
              letterSpacing: "0.08em",
              margin: 0,
              textShadow: `0 2px 18px ${accent}66`,
            }}
          >
            Asaheim
          </h1>
          <div style={{ color: parchment, fontSize: 13, letterSpacing: "0.16em", marginTop: 3, opacity: 0.78 }}>
            Adventures on the road
          </div>
          <div style={{ maxWidth: 520, margin: "10px auto 0" }}>
            <Ornament accent={accent} />
          </div>
        </header>

        <section
          style={{
            maxWidth: 900,
            margin: "0 auto 16px",
            padding: 14,
            borderRadius: 18,
            border: "1px solid #ffffff1f",
            background: "linear-gradient(180deg, #2c1b0ddd, #160d06dd)",
            boxShadow: "0 10px 30px #00000066, inset 0 1px 0 #ffffff12",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ color: "#ffffff66", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 7 }}>
                Årstid
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {ALL_SEASONS.map(s => {
                  const active = activeSeason === s;
                  const c = SEASON_COLORS[s];
                  return (
                    <FilterButton key={s} active={active} color={c} onClick={() => toggleSeason(s)}>
                      {SEASON_ICONS[s]} {s}
                    </FilterButton>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ color: "#ffffff66", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 7 }}>
                Type
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {ALL_TYPES.map(t => (
                  <FilterButton key={t} active={activeTypes.includes(t)} color={typeColor[t]} onClick={() => toggleType(t)}>
                    {TYPE_SIGILS[t]} {t}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#ffffff66", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 7 }}>
                Tone
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {ALL_TONES.map(t => (
                  <FilterButton key={t} active={activeTones.includes(t)} color={toneColor[t]} onClick={() => toggleTone(t)}>
                    {TONE_SIGILS[t]} {t}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 7,
                background: "#00000022",
                border: "1px solid #ffffff14",
                borderRadius: 14,
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ color: "#ffffff66", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Mærkelighed
                </div>
                <div style={{ color: parchment, fontSize: 12 }}>
                  {weirdnessTarget < 35 ? "Mere jordnær" : weirdnessTarget > 65 ? "Mere mærkelig" : "Blandet"}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weirdnessTarget}
                onChange={e => setWeirdnessTarget(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff55", fontSize: 11 }}>
                <span>Jordnær</span>
                <span>Mærkelig</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ color: "#ffffff66", fontSize: 12 }}>{activeSummary}</div>
              <FBtn onClick={clearFilters}>Nulstil filtre</FBtn>
            </div>
          </div>
        </section>

        <main
          style={{
            background:
              `linear-gradient(180deg, ${parchmentLight}, ${parchment} 42%, ${parchmentDark})`,
            borderRadius: 22,
            border: `2px solid ${accent}aa`,
            boxShadow: `0 0 0 5px #00000022, 0 18px 50px #00000099, inset 0 1px 0 #ffffffaa`,
            maxWidth: 760,
            margin: "0 auto 18px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 10,
              border: `1px solid ${accent}55`,
              borderRadius: 16,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              background: `linear-gradient(90deg, #6c3e12, ${accent}, #6c3e12)`,
              height: 6,
            }}
          />

          <div
            style={{
              padding: "22px 26px 16px",
              borderBottom: `1px solid ${dividerColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              position: "relative",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <TypeBadge type={card.type} />
                {card.subtype && <TypeBadge type={card.subtype} />}
                <ToneBadge tone={card.tone} />
              </div>
              <h2
                style={{
                  fontSize: 29,
                  fontWeight: 800,
                  margin: 0,
                  color: ink,
                  letterSpacing: "0.02em",
                  lineHeight: 1.08,
                }}
              >
                {card.title}
              </h2>
              <div style={{ fontSize: 13, color: inkFaded, marginTop: 7 }}>
                Mødt person: <em>{card.npc}</em> · Vejr passer via tags:{" "}
                <em>{normalizeTags(card.weatherTags).join(", ")}</em>
              </div>
            </div>

            <div
              title="Vokssegl"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, #d85a4a, ${wax} 58%, #5d140f)`,
                color: "#ffd9b0",
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                boxShadow: "0 4px 14px #00000055, inset 0 2px 2px #ffffff44, inset 0 -3px 6px #00000055",
                flex: "0 0 auto",
              }}
            >
              {TYPE_SIGILS[card.type]}
            </div>
          </div>

          <div style={{ padding: "18px 26px 22px", display: "grid", gap: 16, position: "relative" }}>
            <Section label="Hændelse" sigil="❧" text={card.encounter} />
            <Ornament accent={`${accent}99`} />
            <Section label="Drejning" sigil="◈" text={card.twist} />

            <div
              style={{
                background: "linear-gradient(180deg, #fff6d966, #d0a94f22)",
                border: `1px solid ${accent}66`,
                borderRadius: 16,
                padding: "14px 15px",
                boxShadow: "inset 0 1px 0 #ffffff99, 0 4px 14px #00000011",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: inkFaded,
                  marginBottom: 7,
                }}
              >
                ❦ Vejr — {card.weather.name}
                <span style={{ marginLeft: 8, color: SEASON_COLORS[card.weather.season], fontWeight: 800 }}>
                  {SEASON_ICONS[card.weather.season]} {card.weather.season}
                </span>
              </div>
              <p style={{ margin: "0 0 9px", fontSize: 15, color: ink, lineHeight: 1.62, fontStyle: "italic" }}>
                {card.weather.text}
              </p>
              <div style={{ fontSize: 13, color: inkFaded, borderTop: `1px solid ${dividerColor}`, paddingTop: 9 }}>
                <strong>Vejreffekt:</strong> {card.weather.effect}
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${dividerColor}`,
                borderRadius: 16,
                padding: "14px 15px",
                background: "#fff7df55",
                boxShadow: "inset 0 1px 0 #ffffff88",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: inkFaded,
                  marginBottom: 6,
                }}
              >
                ⚔ Hændelseseffekt
              </div>
              <p style={{ margin: 0, fontSize: 15, color: ink, lineHeight: 1.62 }}>{card.effect}</p>
            </div>

            <div
              style={{
                border: `1px solid ${accent}55`,
                borderRadius: 16,
                padding: "14px 15px",
                background: "linear-gradient(180deg, #3a260d10, #b8962e18)",
                boxShadow: "inset 0 1px 0 #ffffff66",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: inkFaded,
                  marginBottom: 10,
                }}
              >
                ✎ DM notes
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                  <strong>Hook:</strong> {card.notes?.hook}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                  <strong>Komplikation:</strong> {card.notes?.komplikation}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                  <strong>Belønning:</strong> {card.notes?.belønning}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg, #d9be7a66, #7b4b1533)",
              borderTop: `1px solid ${dividerColor}`,
              padding: "13px 22px",
              display: "flex",
              gap: 9,
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <FBtn primary onClick={draw}>⚄ Træk nyt kort</FBtn>
              <FBtn onClick={copy}>{copied ? "✓ Kopieret" : "⎘ Kopiér"}</FBtn>
            </div>
            <div style={{ fontSize: 11, color: inkFaded }}>
              Weirdness {card.weirdness} · {card.weather.tags?.join(", ")}
            </div>
          </div>

          <div
            style={{
              background: `linear-gradient(90deg, #6c3e12, ${accent}, #6c3e12)`,
              height: 6,
            }}
          />
        </main>

        {sortedHistory.length > 0 && (
          <section style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffffff55", textAlign: "center", marginBottom: 11 }}>
              ✦ Historik · pinnede kort ligger først ✦
            </div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
              {sortedHistory.map(h => {
                const isPinned = pinned.has(h.id);
                const hAccent = toneColor[h.tone] || gold;
                return (
                  <div
                    key={h.id}
                    onClick={() => setCard(h)}
                    style={{
                      flex: "0 0 172px",
                      background: isPinned
                        ? "linear-gradient(180deg, #4a310f, #251607)"
                        : "linear-gradient(180deg, #2a1a0b, #160d06)",
                      border: `1px solid ${isPinned ? gold : "#ffffff1f"}`,
                      borderRadius: 16,
                      padding: "12px 13px",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: isPinned ? "0 0 18px #b8962e33" : "none",
                    }}
                  >
                    <div style={{ fontSize: 10, color: typeColor[h.type] || "#aaa", marginBottom: 5, letterSpacing: "0.08em" }}>
                      {TYPE_SIGILS[h.type]} {h.type}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: parchmentLight, lineHeight: 1.25, marginBottom: 7, paddingRight: 16 }}>
                      {h.title}
                    </div>
                    <div style={{ fontSize: 10, color: hAccent, marginBottom: 5 }}>
                      {TONE_SIGILS[h.tone]} {h.tone}
                    </div>
                    <div style={{ fontSize: 10, color: "#ffffff55" }}>
                      {SEASON_ICONS[h.weather.season]} {h.weather.name}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        togglePin(h.id);
                      }}
                      title={isPinned ? "Fjern pin" : "Pin kort"}
                      style={{
                        position: "absolute",
                        top: 9,
                        right: 9,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 15,
                        color: isPinned ? gold : "#ffffff35",
                        padding: 0,
                      }}
                    >
                      {isPinned ? "★" : "☆"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer style={{ textAlign: "center", color: "#ffffff33", fontSize: 11, marginTop: 10 }}>
          Ingen eksterne assets · vejr matches via weatherTags · klar til bordbrug
        </footer>
      </div>
    </div>
  );
}
