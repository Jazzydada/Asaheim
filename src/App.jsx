import { useState, useMemo, useCallback } from "react";

// ── RACE WEIGHTS ────────────────────────────────────────────────
const raceWeights = [
  { race: "Human", weight: 45 }, { race: "Half-Elf", weight: 12 },
  { race: "Dwarf", weight: 10 }, { race: "Elf", weight: 9 },
  { race: "Halfling", weight: 7 }, { race: "Tiefling", weight: 5 },
  { race: "Gnome", weight: 4 }, { race: "Half-Orc", weight: 4 },
  { race: "Dragonborn", weight: 2 }, { race: "Goblin", weight: 1 },
  { race: "Hobgoblin", weight: 1 },
];

// ── WEATHER — 20 per season ─────────────────────────────────────
const weatherBySeason = {
  Forår: [
    { name: "Let forårsregn", text: "Regnen falder blidt. Blade nikker under dråberne. Vejen føles næsten venlig.", effect: "Animal Handling får advantage." },
    { name: "Forårskulde", text: "Blomster står åbne i kulden. Fugle synger tappert. Dagen prøver at være venlig.", effect: "Animal Handling og Nature får advantage." },
    { name: "Skinnende dug", text: "Duggen ligger som perler i græsset. Hvert skridt sender små glimt op. Morgenens lys føles rent.", effect: "Første helbredelsesfortryllelse heler +1d4 HP." },
    { name: "Varm aftenvind", text: "En varm vind glider hen over vejen. Græsset bøjer sig langsomt. Dagen slipper ikke helt sit tag.", effect: "Persuasion får advantage ved fredelige møder." },
    { name: "Regn efter sol", text: "Regnen falder gennem sollys. Dråberne glimter som små varsler. Verden virker både vasket og afsløret.", effect: "Insight får advantage." },
    { name: "Hidsig byge", text: "Regnen kommer pludseligt og hårdt. Så stopper den lige så brat. Verden drypper som efter et chok.", effect: "Første Stealth-check efter bygen får advantage." },
    { name: "Urolig vind", text: "Vinden skifter retning uden mønster. Ord blæser væk midt i sætninger. Intet føles helt stabilt.", effect: "Concentration checks har DC +2." },
    { name: "Duft af lyng", text: "Vinden bærer lyng og våd jord. Bakkerne virker ældre end kortene. Vejen føles glemt, men ikke fjendtlig.", effect: "Survival får advantage." },
    { name: "Grønligt lys", text: "Lyset får blade, hud og sten til at virke grønne. Skoven føles tættere på, også hvor der ingen skov er.", effect: "Nature og Arcana får advantage ved fey-tegn." },
    { name: "Kold morgen", text: "Frosten ligger som sølv i grøfterne. Åndedræt står hvidt. Selv læder knirker i kulden.", effect: "Første DEX-check har disadvantage, medmindre gruppen varmer op." },
    { name: "Pludselig hagl", text: "Små hagl slår mod hjelme, kapper og blade. Verden bliver hvidprikket og hård. Samtaler dør hurtigt.", effect: "Perception over 60 ft. har disadvantage." },
    { name: "Lun tåge", text: "Tågen er lun og mærkelig blød. Den lægger sig om ansigter og hænder som ånde. Afstande bliver usikre.", effect: "Stealth får advantage." },
    { name: "Fin støvregn", text: "Fin regn hænger i luften uden rigtigt at falde. Alt glinser svagt. Lyde virker dæmpede, næsten hellige.", effect: "Religion eller Arcana får advantage." },
    { name: "Fjern havgus", text: "En salt dis driver ind over vejen. Luften smager af kyst, selv langt inde i landet. Måger høres uden at ses.", effect: "Nature eller Survival til vejrtegn får advantage." },
    { name: "Tavs solopgang", text: "Solen står op uden fuglesang. Lyset breder sig langsomt. Stilheden når frem først.", effect: "Første encounter starter med alle passive Perception -2." },
    { name: "Lysende skyer", text: "Skyerne lyser svagt indefra. Ikke som lyn. Mere som noget, der drømmer bag dem.", effect: "Arcana får advantage; Wild Magic anbefales." },
    { name: "Varm jordduft", text: "Jorden dufter varmt og mørkt. Rødder, svampe og gamle ting vækkes. Noget under jer lever.", effect: "Nature DC 13 afslører underjordisk aktivitet." },
    { name: "Vejrskifte", text: "Varmen falder pludseligt. Fugle letter. Et eller andet i kroppen ved, at noget vender.", effect: "Perception eller Insight får advantage én gang." },
    { name: "Strid modregn", text: "Regnen slår direkte imod jer. Ansigter må vendes væk. Vejen bliver til arbejde.", effect: "Man kan ikke holde hurtig march uden CON-save DC 13." },
    { name: "Klar efterregn", text: "Regnen er stoppet. Alt står skarpt og vådt. Spor er friske, og verden har ikke nået at lyve igen.", effect: "Tracking får advantage." },
  ],
  Sommer: [
    { name: "Trykkende varme", text: "Luften står stille. Sveden kommer hurtigt. Selv små byrder føles større.", effect: "Ved hård march: CON-save DC 12 eller 1 level exhaustion." },
    { name: "Sprukken tørke", text: "Jorden er hård og sprukken. Græsset rasler som papir. Alt vand føles værdifuldt.", effect: "CON-save DC 13 ved lang rejse, eller 1 exhaustion." },
    { name: "Støvstorm", text: "Støv rejser sig som en mur. Øjne svier. Vejen forsvinder i brun luft.", effect: "Blinded ud over 15 ft.; Survival DC 14 for ikke at fare vild." },
    { name: "Uventet varme", text: "Varmen kommer brat, som om nogen åbnede en ovn. Fugle tier. Jorden damper svagt.", effect: "Ildskade får +1 skade pr. terning én gang." },
    { name: "Guldlys", text: "Eftermiddagslyset ligger varmt på alt. Selv ødelagte ting virker smukke. Det er svært at være kynisk.", effect: "Persuasion og Performance får advantage." },
    { name: "Honningvarm sol", text: "Solen ligger blød og gylden på vejen. Bier summer ved blomsterne. Verden virker næsten uskyldig.", effect: "Karakterer får advantage på ét socialt check, hvis de ikke starter fjendtligt." },
    { name: "Blød sommerregn", text: "Regnen falder varmt og blidt. Den vasker støv af blade og skuldre. Rejsen føles et øjeblik mindre lang.", effect: "Short rest heler +1 HP pr. Hit Die." },
    { name: "Klam varme", text: "Varmen klæber. Insekter summer i grøfterne. Selv stilheden virker svedig.", effect: "CON-saves mod gift/sygdom har disadvantage denne time." },
    { name: "Torden i det fjerne", text: "Mørke skyer samler sig uden at bryde. Torden rumler langt væk, som et løfte. Noget er på vej.", effect: "Intimidation får advantage." },
    { name: "Varme lyn", text: "Lyn flakker lydløst inde i skyerne. Luften lugter af metal. Hår rejser sig på arme og nakke.", effect: "Lyn/tordenskader får +1 skade pr. terning én gang." },
    { name: "Fjern stormfront", text: "En storm står som en mur i horisonten. Den bevæger sig langsomt. Men den bevæger sig mod jer.", effect: "Gruppen kan vælge: hurtig rejse med exhaustion-risiko eller forsinkelse." },
    { name: "Blå klarhed", text: "Himlen er blå og nådesløs. Ingen skyer, ingen skjul. Horisonten virker for langt væk.", effect: "Perception over lange afstande får advantage." },
    { name: "Knastør blæst", text: "Vinden tørrer læber, øjne og tanker. Græsset hvisler. Ild ville elske denne dag.", effect: "Ild breder sig dobbelt så hurtigt." },
    { name: "Rød solnedgang", text: "Himlen brænder rødt. Skygger falder lange og sorte. Vejen ligner noget, der fører ind i et gammelt sagn.", effect: "Arcana får advantage indtil mørket falder på." },
    { name: "Lav dis", text: "En svag dis ligger lavt over jorden. Solen er der, men uden varme. Alt føles som et valg, der allerede er truffet.", effect: "WIS-save DC 13. Ved fejl: disadvantage på næste Insight-check." },
    { name: "Mild nat", text: "Natten er mild. Flammer står rolige. Stjernerne virker tættere end normalt.", effect: "Første short rest giver én karakter 1 ekstra Hit Die tilbage." },
    { name: "Sol gennem røg", text: "Solen ses gennem et røgslør. Lyset bliver kobberfarvet. Alt virker som før et slag.", effect: "Initiative får advantage for karakterer, der opdager røgens kilde." },
    { name: "Fjern lynild", text: "Lyn flakker bag horisonten. Tordenen kommer meget senere. Noget langt væk er vredt.", effect: "Arcana eller Religion DC sænkes med 2 ved varsler." },
    { name: "Mosevarm tåge", text: "Tågen er varm og fugtig. Den lugter af stillestående vand. Hvert skridt lyder vådt.", effect: "Saves mod gift/sygdom har disadvantage." },
    { name: "Død luft", text: "Luften rører sig ikke. Ingen blade, ingen støv, ingen insekter. Verden holder vejret.", effect: "Initiative får advantage for den første, der handler beslutsomt." },
  ],
  Efterår: [
    { name: "Efterårsblæst", text: "Blade løber over vejen som små dyr. Vinden bærer lugten af råd og æbler. Alt er på vej væk.", effect: "Survival til at finde ly får advantage." },
    { name: "Kobberfarvet aften", text: "Aftenen gløder kobberrød. Ansigter får hårde kanter. Selv venlige ord lyder skarpere.", effect: "Intimidation får advantage; Persuasion har disadvantage." },
    { name: "Tung regn", text: "Regnen falder tungt og konstant. Jorden drikker uden at blive mæt. Hver lyd føles tættere på end den er.", effect: "Ranged attacks over 30 ft. har disadvantage." },
    { name: "Grå himmel", text: "Himlen er ensfarvet og tung. Lyset kommer alle steder fra og ingen steder. Farverne virker flade.", effect: "Investigation får advantage på små detaljer." },
    { name: "Lilla skumring", text: "Skumringen bliver lilla. Træer og sten mister deres almindelige farve. Noget feyagtigt ligger under huden på verden.", effect: "WIS-save DC 13, ellers er karakteren charmed af stemningen i 1 minut." },
    { name: "Bitter vind", text: "Vinden skærer gennem tøj. Den finder gamle skader og nye bekymringer. Ingen går afslappet.", effect: "Constitution saves mod exhaustion har disadvantage." },
    { name: "Mørke bygeskyer", text: "Bygeskyer driver som sorte dyr over himlen. Solen dukker op og forsvinder. Humøret følger med.", effect: "Insight DC +2 under sociale konflikter." },
    { name: "Dyb skygge", text: "Skyerne lukker sig tæt. Selv midt på dagen føles det som sen aften. Farverne trækker sig tilbage.", effect: "Udøde og onde væsner får +1 på Stealth i området." },
    { name: "Piskende regn", text: "Regnen slår hårdt mod ansigtet. Den vil ind i øjne, mund og tanker. Verden bliver til linjer af vand.", effect: "Trylleformelangreb over 30 ft. har disadvantage." },
    { name: "Askefarvet dag", text: "Dagen har ingen farve. Solen er skjult bag en grå hinde. Alt smager svagt af røg.", effect: "Survival DC 13 finder retning mod katastrofens kilde." },
    { name: "Mørk vind", text: "Vinden føles koldere end luften. Den bærer lugten af stenrum og gammel jord.", effect: "Opdagelse af udøde eller Religion får advantage." },
    { name: "Kold tågeregn", text: "Regn og tåge er blevet samme ting. Den samler sig i hår og øjenbryn. Verden drypper uden lyd.", effect: "Stealth får advantage; ranged attacks har disadvantage." },
    { name: "Askesne", text: "Grå flager falder fra en skyfri himmel. De smelter ikke. De lægger sig som sorg på skuldrene.", effect: "Religion DC 13 afslører varsel; ved succes genvinder én karakter inspiration." },
    { name: "Natteblæst", text: "Vinden går gennem mørket som fingre. Lanterner flakker. Noget uset bevæger sig med den.", effect: "Synsbaseret Perception har disadvantage." },
    { name: "Klar efterregn", text: "Regnen er stoppet. Alt står skarpt og vådt. Spor er friske, og verden har ikke nået at lyve igen.", effect: "Tracking får advantage." },
    { name: "Måneklar nat", text: "Månen ligger stor og lys over vejen. Sten, blade og ansigter får sølvkanter. Hemmeligheder har svært ved at gemme sig.", effect: "Perception får advantage; Stealth har disadvantage." },
    { name: "Stille efter storm", text: "Alt er vådt og væltet. Grenene drypper. Stilheden bagefter føles næsten skyldig.", effect: "Investigation af spor efter kaos får advantage." },
    { name: "Fjern klokketone", text: "Vejret er stille, men en klokke høres langt væk. Ingen by er på kortet. Lyden kommer med vinden og forsvinder igen.", effect: "Religion eller History får advantage." },
    { name: "Gennemsigtig regn", text: "Regnen falder så fint, at den næsten ikke ses. Men alt bliver vådt. Hemmeligheder ligeså.", effect: "Deception har disadvantage." },
    { name: "Sol og sorte skyer", text: "Solen skinner på jer, mens sorte skyer hænger længere fremme. Vejen går direkte mod mørket.", effect: "WIS-saves får advantage, indtil gruppen når skyerne." },
  ],
  Vinter: [
    { name: "Knitrende frost", text: "Alt er dækket af tynd rim. Buske knitrer ved berøring. Vejen lyder gammel under støvlerne.", effect: "Stealth har disadvantage på hård jord." },
    { name: "Hård frostnat", text: "Natten bider. Vand fryser ved kanten af flasker. Søvn kommer som en fjende.", effect: "Long rest kræver ly og varme; ellers fjernes ingen exhaustion." },
    { name: "Tynd isslag", text: "En næsten usynlig is lægger sig på sten og hjulspor. Vejen ser sikker ud, indtil den ikke er det.", effect: "DEX-save DC 12 ved løb eller bevægelse i kamp." },
    { name: "Rim på våben", text: "Tynd frost samler sig på metal. Klingerne bliver blege. Selv blod ville se sort ud her.", effect: "Første nærkampsangreb med metalvåben har -1 to hit." },
    { name: "Klar stjernefrost", text: "Natten er iskold og klar. Stjernerne er nåle. Hvert ord fryser næsten fast.", effect: "Navigation efter stjerner får advantage." },
    { name: "Tør kulde", text: "Kulden bider uden fugt. Læber sprækker. Metal føles sultent mod huden.", effect: "Sleight of Hand har disadvantage uden handsker." },
    { name: "Stille sne", text: "Sne falder uden vind. Spor dækkes langsomt. Verden bliver mindre og mere hemmelig.", effect: "Tracking har disadvantage." },
    { name: "Våd sne", text: "Sne falder tungt og vådt. Den bliver til sjap under støvler. Kulden kravler op nedefra.", effect: "Bevægelse i åbent terræn reduceres med 10 ft." },
    { name: "Spredte snefnug", text: "Snefnug falder enkeltvis og langsomt. De virker for store. Nogle når aldrig jorden.", effect: "Arcana DC 12 afslører planar påvirkning." },
    { name: "Mørk sne", text: "Sne falder gennem skumring. Flagerne virker grå, før de rammer. Verden bliver stille på en utryg måde.", effect: "Stealth får advantage; morale checks har disadvantage." },
    { name: "Vinterklar sol", text: "Solen skinner klart over frost. Det er smukt og ubarmhjertigt. Alt glitrer, alt afslører.", effect: "Investigation får advantage i dagslys." },
    { name: "Kold sol", text: "Solen skinner uden varme. Skyggerne er skarpe. Det smukke ved dagen virker ligeglad.", effect: "WIS-saves mod frygt får advantage." },
    { name: "Rasende blæst", text: "Vinden river i hår og kapper. Småsten hopper over vejen. Stemmer bliver flået i stykker.", effect: "Flyvende væsner har disadvantage på angreb." },
    { name: "Sølvregn", text: "Dråberne glimter sølv i luften. De efterlader ingen fugt. Selv skeptikere bliver stille.", effect: "Detect Magic afslører svag transmutation over området." },
    { name: "Sort regn", text: "Regnen falder mørk mod sten og hud. Den lugter svagt af aske. Ingen kommenterer det først.", effect: "CON-save DC 13, ellers er karakteren forgiftet i 10 minutter." },
    { name: "Kraftig medvind", text: "Vinden presser jer fremad. Kapper flyver bagud. Vejen virker utålmodig.", effect: "Rejsehastighed øges med 25%, men Perception bagud har disadvantage." },
    { name: "Klar fuldmåne", text: "Fuldmånen hænger stor og lys over vejen. Alt kaster hårde skygger. Natten lyver ikke.", effect: "Perception og Investigation får advantage om natten." },
    { name: "Frost i skyggerne", text: "Kun skyggerne har frost. Solpletter er varme. Verden virker delt i to regler.", effect: "Arcana DC 14 afslører svag planar/nekrotisk påvirkning." },
    { name: "Vejr uden lyd", text: "Regn falder, men I hører den næsten ikke. Vinden rører sig, men siger intet. Det føles stjålet.", effect: "Lydbaseret Perception har disadvantage." },
    { name: "Skærende klart vejr", text: "Alt står skarpt. Bjerge, træer og fugle virker tættere på. Det er svært at lyve for sig selv.", effect: "Insight får advantage." },
  ],
};

const ALL_SEASONS = ["Forår", "Sommer", "Efterår", "Vinter"];
const SEASON_ICONS = { Forår: "✿", Sommer: "☀", Efterår: "🍂", Vinter: "❄" };
const SEASON_COLORS = { Forår: "#1D9E75", Sommer: "#BA7517", Efterår: "#D85A30", Vinter: "#378ADD" };

// ── ENCOUNTERS ──────────────────────────────────────────────────
const encounters = [
  { title: "Den Delte Byrde", type: "Social", subtype: "Mystery", encounter: "En rejsende beder gruppen hjælpe med at bære en tung kiste et stykke vej.", raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 25 }, { race: "Half-Orc", chance: 25 }], twist: "Kisten er ikke tung på grund af vægt, men på grund af noget magisk, der reagerer på skyld.", effect: "STR save DC 12. Fail: disadvantage på næste STR-check. Success: advantage på næste STR-check." },
  { title: "Den Tavse Jæger", type: "Mystery", subtype: null, encounter: "En jæger følger gruppen på afstand i timevis uden at tage kontakt.", raceHints: [{ race: "Elf", chance: 50 }, { race: "Human", chance: 30 }, { race: "Tabaxi", chance: 20 }], twist: "Jægeren jager ikke gruppen, men noget der allerede følger efter dem.", effect: "Perception DC 14: opdager hvad jægeren følger. Fail: næste encounter starter med Surprise." },
  { title: "Den Lånte Hest", type: "Social", subtype: null, encounter: "En velplejet hest står bundet ved vejen uden synlig ejer.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Dragonborn", chance: 20 }], twist: "Ejeren holder øje fra afstand og vurderer, om gruppen er tyve eller ordentlige folk.", effect: "Animal Handling DC 12. Success: hesten stoler på gruppen. Fail: den vrinsker og tilkalder ejeren." },
  { title: "Den Fremmede Sang", type: "Mystery", subtype: "Wonder", encounter: "En lav sang høres fra vejen, men der er ingen at se.", raceHints: [{ race: "Half-Elf", chance: 40 }, { race: "Tiefling", chance: 30 }, { race: "Human", chance: 30 }], twist: "Sangen ændrer sig efter lytterens frygt og afslører noget, de helst ville skjule.", effect: "WIS save DC 13. Fail: disadvantage på næste check. Success: advantage på næste Insight-check." },
  { title: "Den Sårede Spejder", type: "Combat", subtype: "Social", encounter: "En såret spejder ligger skjult i grøften og beder lavmælt om hjælp.", raceHints: [{ race: "Elf", chance: 40 }, { race: "Human", chance: 40 }, { race: "Half-Orc", chance: 20 }], twist: "Fjenden leder stadig efter spejderen og er tættere på, end gruppen tror.", effect: "Medicine DC 12 stabiliserer spejderen. Stealth DC 13 skjuler gruppen. Fail: fjenden finder dem." },
  { title: "Broen uden Told", type: "Exploration", subtype: "Mystery", encounter: "En gammel stenbro krydser en mørk flod. Der er ingen vogter, ingen told, ingen spor.", raceHints: [{ race: "Human", chance: 60 }, { race: "Dwarf", chance: 25 }, { race: "Gnome", chance: 15 }], twist: "Broen måler skyld. Den karakter med mest uforløst skyld mærker stenen give efter under sig.", effect: "WIS save DC 14 ved krydsning. Fail: karakteren bliver restrained i 1 runde af stenens greb." },
  { title: "Den Forvirrede Flygtning", type: "Social", subtype: "Danger", encounter: "En panisk flygtning løber direkte ind i gruppen og trygler dem om ikke at stoppe.", raceHints: [{ race: "Halfling", chance: 40 }, { race: "Human", chance: 40 }, { race: "Gnome", chance: 20 }], twist: "Noget usynligt angriber kun dem, der står stille for længe.", effect: "Hvis gruppen stopper mere end 1 minut, udløses encounter. Bevæger de sig videre, undgår de det." },
  { title: "Den Venlige Historiefortæller", type: "Social", subtype: "Wonder", encounter: "En rejsende inviterer gruppen til bålet og fortæller historier fra hele Sværdkysten.", raceHints: [{ race: "Half-Elf", chance: 40 }, { race: "Human", chance: 40 }, { race: "Tiefling", chance: 20 }], twist: "Historierne er ikke opdigtede. De er minder stjålet fra andre rejsende.", effect: "Den der lytter i 10 minutter får advantage på næste History eller Insight-check." },
  { title: "Den Tavse Budbringer", type: "Mystery", subtype: null, encounter: "En rejsende rækker jer et brev uden at sige et ord og forsøger straks at gå videre.", raceHints: [{ race: "Human", chance: 50 }, { race: "Half-Elf", chance: 30 }, { race: "Tiefling", chance: 20 }], twist: "Brevet er ikke til jer – men det vil ændre sig, så det bliver relevant for én i gruppen.", effect: "INT save DC 13 ved læsning. Fail: disadvantage på næste check. Success: advantage på næste Insight." },
  { title: "Den Urolige Skygge", type: "Danger", subtype: null, encounter: "En af karakterernes skygge bevæger sig et splitsekund for sent.", raceHints: [{ race: "Human", chance: 60 }, { race: "Elf", chance: 25 }, { race: "Gnome", chance: 15 }], twist: "Skyggen er ved at løsne sig – og kan blive noget selvstændigt.", effect: "WIS save DC 14. Fail: disadvantage på næste attack. Success: ingen effekt." },
  { title: "Den Gamle Handelssti", type: "Exploration", subtype: null, encounter: "En gammel, næsten glemt sti krydser jeres vej.", raceHints: [{ race: "Dwarf", chance: 40 }, { race: "Human", chance: 40 }, { race: "Halfling", chance: 20 }], twist: "Stien fører hurtigere frem – men gennem noget, der stadig bruger den.", effect: "Survival DC 13 → halver rejsetid. Fail → encounter trigger." },
  { title: "Den Blinde Vagt", type: "Social", subtype: null, encounter: "En blind vagt sidder ved vejen og spørger, hvem I er.", raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 30 }, { race: "Half-Orc", chance: 20 }], twist: "Han kan ikke se jer – men ved, hvis I lyver.", effect: "Deception vs DC 14. Fail → han alarmerer nogen. Success → I passerer frit." },
  { title: "Den Forladte Kæde", type: "Mystery", subtype: null, encounter: "En tung jernkæde ligger tværs over vejen.", raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 30 }, { race: "Goblin", chance: 20 }], twist: "Den blev brugt til at holde noget fast – og det er ikke her længere.", effect: "Investigation DC 13 → spor. Fail → næste encounter får advantage mod jer." },
  { title: "Den Sultne Rejsende", type: "Social", subtype: null, encounter: "En sulten person beder om mad.", raceHints: [{ race: "Halfling", chance: 40 }, { race: "Human", chance: 40 }, { race: "Gnome", chance: 20 }], twist: "De har mad – men tester jeres villighed til at dele.", effect: "Hvis I deler: advantage på næste social check. Hvis ikke: disadvantage." },
  { title: "Den Knirkende Vogn", type: "Exploration", subtype: null, encounter: "En tom vogn ruller langsomt ned ad vejen af sig selv.", raceHints: [{ race: "Human", chance: 60 }, { race: "Dwarf", chance: 25 }, { race: "Gnome", chance: 15 }], twist: "Noget inde i vognen styrer den – og vil ikke opdages.", effect: "Perception DC 13 → opdager det først. Fail → Surprise." },
  { title: "Den Fremmede Duel", type: "Combat", subtype: "Social", encounter: "To personer står klar til duel og ignorerer jer.", raceHints: [{ race: "Human", chance: 50 }, { race: "Elf", chance: 30 }, { race: "Half-Elf", chance: 20 }], twist: "De kæmper ikke om ære – men om noget skjult.", effect: "Insight DC 12 → forstå konflikten. Success → mulighed for at påvirke udfald." },
  { title: "Den Faldne Standard", type: "Social", subtype: null, encounter: "Et banner ligger i mudderet, tydeligt tilhørende en kendt fraktion.", raceHints: [{ race: "Human", chance: 60 }, { race: "Half-Elf", chance: 25 }, { race: "Tiefling", chance: 15 }], twist: "Det er plantet for at lokke folk i en fælde.", effect: "Investigation DC 14 → undgår fælde. Fail → ambush." },
  { title: "Den Tålmodige Tigger", type: "Social", subtype: null, encounter: "En tigger sidder ved vejen og beder uden at se op.", raceHints: [{ race: "Human", chance: 50 }, { race: "Halfling", chance: 30 }, { race: "Gnome", chance: 20 }], twist: "Han er ikke fattig – han observerer rejsende systematisk.", effect: "Insight DC 13 → opdager det. Success → får info om kommende farer." },
  { title: "Den Tavse Fisker", type: "Social", subtype: "Wonder", encounter: "En fisker sidder ved en tør grøft og trækker linen ind, som om der var vand.", raceHints: [{ race: "Human", chance: 45 }, { race: "Halfling", chance: 30 }, { race: "Lizardfolk", chance: 25 }], twist: "Han fisker ikke i grøften, men i en anden verden.", effect: "Arcana DC 14. Success: han trækker en nyttig lille genstand op. Fail: noget bider linen over." },
  { title: "Den Lukkede Port", type: "Exploration", subtype: null, encounter: "En port står midt på vejen uden mur omkring sig.", raceHints: [{ race: "Dwarf", chance: 35 }, { race: "Human", chance: 35 }, { race: "Gnome", chance: 30 }], twist: "Porten åbner kun for dem, der lover ikke at vende tilbage samme vej.", effect: "WIS save DC 13 ved passage. Fail: karakteren kan ikke frivilligt gå tilbage gennem porten." },
  { title: "Den Røde Kappe", type: "Mystery", subtype: null, encounter: "En rød kappe hænger fra en gren, våd af regn men uden mudder.", raceHints: [{ race: "Human", chance: 50 }, { race: "Elf", chance: 25 }, { race: "Tiefling", chance: 25 }], twist: "Kappen tilhører en person, der endnu ikke er forsvundet.", effect: "Investigation DC 14. Success: gruppen får advantage på at forhindre forsvindingen." },
  { title: "Den Gamle Læge", type: "Social", subtype: null, encounter: "En gammel læge behandler en fremmed ved vejkanten og beder om hjælp.", raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 20 }, { race: "Gnome", chance: 25 }], twist: "Patienten er ikke syg, men forvandlingen er begyndt.", effect: "Medicine DC 14. Success: forsink forvandlingen. Fail: transformationen accelererer." },
  { title: "Kvinden med Seks Kort", type: "Mystery", subtype: "Social", encounter: "En kvinde tilbyder at lægge seks slidte kort for gruppen.", raceHints: [{ race: "Human", chance: 40 }, { race: "Tiefling", chance: 35 }, { race: "Half-Elf", chance: 25 }], twist: "Kortene viser ikke fremtiden, men det gruppen undgår at tale om.", effect: "Insight DC 13. Success: én karakter får inspiration. Fail: disadvantage på næste WIS save." },
  { title: "Den Sorte Hest", type: "Mystery", subtype: null, encounter: "En sort hest uden sadel følger vejen i samme retning som gruppen.", raceHints: [{ race: "Human", chance: 50 }, { race: "Elf", chance: 25 }, { race: "Half-Orc", chance: 25 }], twist: "Hesten viser sig kun for dem, der snart skal træffe et voldeligt valg.", effect: "Animal Handling DC 14. Success: hesten leder gruppen uden om blodbad." },
  { title: "Den Smilende Soldat", type: "Social", subtype: null, encounter: "En soldat smiler alt for roligt og spørger, om gruppen har set desertører.", raceHints: [{ race: "Human", chance: 60 }, { race: "Dragonborn", chance: 20 }, { race: "Dwarf", chance: 20 }], twist: "Han er selv desertør og leder efter sine tidligere kammerater for at advare dem.", effect: "Insight DC 14. Success: han fortæller sandheden og deler militær information." },
  { title: "Den Hængende Bro", type: "Danger", subtype: "Exploration", encounter: "En hængebro knager over en dyb kløft.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Gnome", chance: 20 }], twist: "Broen er svækket med vilje, men kun på midten.", effect: "Investigation DC 13 før passage. Fail: DEX save DC 14 eller fald/prone." },
  { title: "Den Lille Domstol", type: "Social", subtype: "Wonder", encounter: "Små fey-væsner holder retssag over en frø, der nægter sig skyldig.", raceHints: [{ race: "Gnome", chance: 45 }, { race: "Halfling", chance: 35 }, { race: "Elf", chance: 20 }], twist: "Frøen er faktisk skyldig, men loven er fuldstændig urimelig.", effect: "Persuasion DC 14. Success: gruppen får fey-favor. Fail: én mister en lille ting." },
  { title: "Den Tavse Handelsplads", type: "Exploration", subtype: "Mystery", encounter: "En tom markedsplads står midt i ødemarken med boder, skilte og vægte.", raceHints: [{ race: "Human", chance: 35 }, { race: "Halfling", chance: 30 }, { race: "Dwarf", chance: 20 }, { race: "Tiefling", chance: 15 }], twist: "Markedet vises kun for folk, der skylder nogen noget.", effect: "WIS save DC 13. Fail: karakteren ser en bod med præcis det, de ønsker." },
  { title: "Den Glemte Vuggevise", type: "Mystery", subtype: "Wonder", encounter: "En vuggevise høres fra en forladt grøft ved vejen.", raceHints: [{ race: "Human", chance: 50 }, { race: "Elf", chance: 25 }, { race: "Halfling", chance: 25 }], twist: "Sangen kommer fra et minde, ikke fra en person.", effect: "WIS save DC 13. Success: regain 1d4 HP. Fail: karakteren bliver melankolsk og får disadvantage på næste initiative." },
  { title: "Den Hvide Ræv", type: "Wonder", subtype: null, encounter: "En hvid ræv løber foran gruppen og stopper, hver gang de stopper.", raceHints: [{ race: "Elf", chance: 40 }, { race: "Human", chance: 30 }, { race: "Firbolg", chance: 30 }], twist: "Ræven leder dem ikke til fare, men væk fra en sandhed.", effect: "Følger man ræven: undgå encounter. Ignorerer man den: find skjult information." },
  { title: "Den Brudte Pil", type: "Mystery", subtype: null, encounter: "En knækket pil sidder i barken på et træ med frisk blod på spidsen.", raceHints: [{ race: "Elf", chance: 45 }, { race: "Human", chance: 35 }, { race: "Goblin", chance: 20 }], twist: "Pilen ramte ikke nogen. Blodet blev sat på bagefter.", effect: "Investigation DC 14. Success: afslør falsk jagtspor." },
  { title: "Den Vandrende Prædikant", type: "Social", subtype: null, encounter: "En prædikant taler til sten, træer og fugle, som om de var en menighed.", raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 20 }, { race: "Aasimar", chance: 30 }], twist: "Nogle af dem svarer faktisk, men kun når ingen andre lytter.", effect: "Religion DC 13. Success: få et varsel fra naturen." },
  { title: "Den Rustne Rustning", type: "Exploration", subtype: "Combat", encounter: "En rustning ligger sammenfoldet i vejsiden, som om nogen er kravlet ud af den.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Half-Orc", chance: 20 }], twist: "Rustningen er ikke forladt. Den venter på en ny bærer.", effect: "STR save DC 14 ved berøring. Fail: restrained 1 runde." },
  { title: "Den Lille Heks", type: "Social", subtype: null, encounter: "En ung pige sælger urter og små charms fra en kurv.", raceHints: [{ race: "Human", chance: 50 }, { race: "Tiefling", chance: 30 }, { race: "Halfling", chance: 20 }], twist: "Hun er ikke heks endnu, men nogen prøver at forme hende til det.", effect: "Arcana eller Insight DC 14. Success: afslør mentorens skjulte indflydelse." },
  { title: "Den Knuste Violin", type: "Mystery", subtype: null, encounter: "En knust violin ligger på vejen, men én streng vibrerer stadig.", raceHints: [{ race: "Half-Elf", chance: 35 }, { race: "Human", chance: 35 }, { race: "Tiefling", chance: 30 }], twist: "Strengen spiller, når nogen i nærheden lyver.", effect: "I 10 minutter: Deception har disadvantage inden for 30 ft." },
  { title: "Den Ensomme Spejderdrone", type: "Mystery", subtype: null, encounter: "En lille mekanisk bille følger gruppen på afstand.", raceHints: [{ race: "Gnome", chance: 55 }, { race: "Dwarf", chance: 25 }, { race: "Human", chance: 20 }], twist: "Den sender billeder til en ejer, der tror gruppen er fjender.", effect: "Sleight of Hand eller Arcana DC 14. Success: vend signalet eller stop den." },
  { title: "De Våde Fodspor", type: "Mystery", subtype: null, encounter: "Våde fodspor krydser den tørre vej og fortsætter ud i ingenting.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 25 }, { race: "Water Genasi", chance: 35 }], twist: "Fodsporene tilhører én, der druknede et andet sted.", effect: "Religion DC 13. Success: find åndens sidste besked." },
  { title: "Den Overfyldte Vogn", type: "Social", subtype: null, encounter: "En vogn er pakket med familier, poser og grædende børn.", raceHints: [{ race: "Human", chance: 55 }, { race: "Halfling", chance: 20 }, { race: "Dwarf", chance: 15 }, { race: "Tiefling", chance: 10 }], twist: "De flygter fra noget reelt, men én af dem har bragt faren med sig.", effect: "Insight DC 14. Success: identificér hvem der skjuler problemet." },
  { title: "Krigeren med Blomsterne", type: "Social", subtype: null, encounter: "En arret kriger plukker forsigtigt vilde blomster i grøften.", raceHints: [{ race: "Half-Orc", chance: 40 }, { race: "Human", chance: 40 }, { race: "Dragonborn", chance: 20 }], twist: "Blomsterne er til en grav, men graven er tom.", effect: "Persuasion DC 13. Success: krigeren deler et vigtigt rygte." },
  { title: "Den Forkerte Refleksion", type: "Mystery", subtype: null, encounter: "I en vandpyt ser én karakter sig selv stå et andet sted.", raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 30 }, { race: "Tiefling", chance: 25 }], twist: "Refleksionen viser en version af karakteren, der traf et andet valg.", effect: "WIS save DC 14. Success: inspiration. Fail: disadvantage på næste save mod charm/fear." },
  { title: "Kokken med Jernpanden", type: "Social", subtype: null, encounter: "En rejsende kok laver mad over bål og nægter at lade nogen gå sultne forbi.", raceHints: [{ race: "Halfling", chance: 50 }, { race: "Human", chance: 30 }, { race: "Dwarf", chance: 20 }], twist: "Maden er almindelig, men opskriften er fra en død kultur.", effect: "Spiser man: advantage på næste CON save. History DC 13 afslører kulturens spor." },
  { title: "Den Vridne Eg", type: "Wonder", subtype: "Danger", encounter: "En eg ved vejen vrider sig langsomt, selv uden vind.", raceHints: [{ race: "Elf", chance: 45 }, { race: "Firbolg", chance: 35 }, { race: "Human", chance: 20 }], twist: "Træet prøver at rive sine rødder fri og flygte.", effect: "Nature DC 14. Success: lær hvad træet flygter fra." },
  { title: "Den Brændte Prædikestol", type: "Mystery", subtype: null, encounter: "En forkullet prædikestol står alene ved vejen.", raceHints: [{ race: "Human", chance: 50 }, { race: "Tiefling", chance: 25 }, { race: "Aasimar", chance: 25 }], twist: "Den brændte ikke i ild, men i sandhed.", effect: "Religion DC 15. Success: én løgn i gruppen bliver afsløret uden skade." },
  { title: "Den Blødende Milepæl", type: "Mystery", subtype: "Danger", encounter: "En milepæl siver mørkt blod fra revner i stenen.", raceHints: [{ race: "Dwarf", chance: 40 }, { race: "Human", chance: 40 }, { race: "Elf", chance: 20 }], twist: "Stenen markerer ikke afstand, men antallet af døde på vejen.", effect: "Religion DC 14. Success: få advarsel om næste dødelige fare." },
  { title: "Den Glemte Melodi", type: "Wonder", subtype: null, encounter: "En melodi hænger i luften, men kun én karakter kan høre den.", raceHints: [{ race: "Half-Elf", chance: 35 }, { race: "Elf", chance: 35 }, { race: "Human", chance: 30 }], twist: "Melodien er fra karakterens barndom, selv hvis det ikke burde være muligt.", effect: "WIS save DC 13. Success: regain inspiration. Fail: karakteren bliver distracted." },
  { title: "Den Sultne Brønd", type: "Danger", subtype: "Mystery", encounter: "En gammel brønd står ved vejen, og rebet hænger ned i mørket.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Halfling", chance: 20 }], twist: "Brønden giver vand, men kun hvis nogen fortæller den en sand hemmelighed.", effect: "Fortælles en sandhed: få rent vand. Lyves der: WIS save DC 14 eller frightened 1 minut." },
  { title: "De Dansende Lys", type: "Wonder", subtype: null, encounter: "Små lys danser over grøfterne langs vejen.", raceHints: [{ race: "Elf", chance: 40 }, { race: "Gnome", chance: 30 }, { race: "Halfling", chance: 30 }], twist: "Lysene leder ikke folk i fare, men væk fra deres sorg.", effect: "Følger man dem: short rest giver +1d4 temp HP, men gruppen mister 1 time." },
  { title: "Den Høje Råber", type: "Social", subtype: null, encounter: "En meget høj mand råber ad et træ, der tilsyneladende ikke svarer.", raceHints: [{ race: "Goliath", chance: 45 }, { race: "Human", chance: 35 }, { race: "Half-Orc", chance: 20 }], twist: "Træet svarer faktisk, men kun meget langsomt.", effect: "Venter man 10 minutter: træet afslører en skjult fare længere fremme." },
  { title: "Den Tomme Barnevogn", type: "Mystery", subtype: null, encounter: "En tom barnevogn står midt på vejen og vugger af sig selv.", raceHints: [{ race: "Human", chance: 60 }, { race: "Halfling", chance: 20 }, { race: "Tiefling", chance: 20 }], twist: "Den leder efter det barn, der nu er blevet voksen.", effect: "Religion DC 14. Success: gruppen ser et minde og får et clue." },
  { title: "Den Trætte Djævel", type: "Social", subtype: null, encounter: "En lille djævel sidder på en sten og nægter at friste nogen.", raceHints: [{ race: "Imp", chance: 50 }, { race: "Tiefling", chance: 35 }, { race: "Human", chance: 15 }], twist: "Den er udbrændt og vil bryde sin egen kontrakt.", effect: "Persuasion DC 15. Success: få infernal information uden at indgå pagt." },
  { title: "Den Muntre Bøddel", type: "Social", subtype: null, encounter: "En bøddel rejser alene og er overraskende venlig.", raceHints: [{ race: "Human", chance: 55 }, { race: "Half-Orc", chance: 25 }, { race: "Dwarf", chance: 20 }], twist: "Han leder efter en dømt person, men håber ikke at finde dem.", effect: "Insight DC 14. Success: han afslører navn og forbrydelse." },
  { title: "De Sorte Fjer", type: "Mystery", subtype: null, encounter: "Sorte fjer ligger i en cirkel midt på vejen.", raceHints: [{ race: "Kenku", chance: 35 }, { race: "Human", chance: 35 }, { race: "Elf", chance: 30 }], twist: "Cirklen markerer et sted, hvor nogen slap levende fra døden.", effect: "Religion DC 13. Success: én karakter får advantage på næste death save." },
  { title: "Den Skingre Fløjte", type: "Mystery", subtype: "Danger", encounter: "En skingrende fløjtelyd høres tre gange fra skoven.", raceHints: [{ race: "Goblin", chance: 35 }, { race: "Human", chance: 35 }, { race: "Elf", chance: 30 }], twist: "Det er ikke et signal til angribere, men en advarsel fra nogen skjult.", effect: "Perception DC 14. Success: gruppen finder advareren før faren." },
  { title: "Den Gyldne Pil", type: "Wonder", subtype: null, encounter: "En gylden pil står lodret i jorden uden bue eller skytte.", raceHints: [{ race: "Elf", chance: 45 }, { race: "Human", chance: 30 }, { race: "Aasimar", chance: 25 }], twist: "Pilen rammer altid, men kun hvis målet ikke fortjener det.", effect: "Bruges den: automatisk hit mod uværdigt mål, ellers vender den mod skytten." },
  { title: "Den Fornærmede Gedebuk", type: "Social", subtype: "Wonder", encounter: "En gedebuk spærrer vejen og virker personligt fornærmet.", raceHints: [{ race: "Satyr", chance: 35 }, { race: "Halfling", chance: 30 }, { race: "Gnome", chance: 35 }], twist: "Gedebukken er en fey, der kræver en undskyldning for noget gruppen ikke ved, de har gjort.", effect: "Performance eller Persuasion DC 13. Fail: gruppen mister 1d4 timer i fey-drilleri." },
  { title: "Den Gode Løgn", type: "Social", subtype: null, encounter: "En rejsende beder gruppen bekræfte en løgn over for nogle forfølgere.", raceHints: [{ race: "Human", chance: 50 }, { race: "Tiefling", chance: 25 }, { race: "Half-Elf", chance: 25 }], twist: "Løgnen beskytter en uskyldig, men skjuler også en forbrydelse.", effect: "Insight DC 14. Success: forstå prisen før gruppen vælger." },
  { title: "Den Lysende Hjortetak", type: "Wonder", subtype: null, encounter: "En hjortetak ligger i græsset og lyser svagt indefra.", raceHints: [{ race: "Elf", chance: 45 }, { race: "Firbolg", chance: 35 }, { race: "Human", chance: 20 }], twist: "Den lyser stærkere, jo tættere gruppen er på noget helligt eller ødelagt.", effect: "Nature eller Religion DC 13. Success: brug som kompas én gang." },
  { title: "Den Døde Mands Sang", type: "Mystery", subtype: null, encounter: "En sang høres fra en gravhøj ved vejen.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Elf", chance: 20 }], twist: "Den døde synger ikke om sin egen død, men om hvem der dræbte ham.", effect: "Religion DC 14. Success: få navn eller symbol på morderen." },
  { title: "Den Grå Parade", type: "Mystery", subtype: null, encounter: "En grå parade af tavse skikkelser krydser vejen langt foran gruppen.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 30 }, { race: "Dwarf", chance: 30 }], twist: "Paraden viser dem, der vil dø, hvis gruppen intet gør senere.", effect: "WIS save DC 14. Success: én karakter husker et ansigt og får advantage på at redde dem." },
  { title: "Vejen Hjem", type: "Wonder", subtype: null, encounter: "Et øjeblik ligner vejen hjemvejen fra én karakters barndom.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 25 }, { race: "Dwarf", chance: 20 }, { race: "Halfling", chance: 15 }], twist: "Vejen tilbyder trøst, men også fristelsen til at standse rejsen.", effect: "WIS save DC 13. Success: inspiration. Fail: karakteren har disadvantage på næste forced march." },
  { title: "Den Hvide Ravns Budskab", type: "Mystery", subtype: null, encounter: "En hvid ravn lander foran gruppen med en lille sølvring i næbbet.", raceHints: [{ race: "Elf", chance: 35 }, { race: "Human", chance: 35 }, { race: "Aasimar", chance: 30 }], twist: "Ringen tilhører én, der endnu ikke har mistet den.", effect: "Investigation DC 14. Success: ringen viser retning mod sin kommende ejer." },
  { title: "Den Brændende Vognlygte", type: "Mystery", subtype: null, encounter: "En vognlygte brænder alene i vejkanten uden olie.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 30 }, { race: "Gnome", chance: 25 }], twist: "Lyset viser kun ting, der forsøger at gemme sig.", effect: "Holder man lygten: advantage på næste Perception mod skjulte væsner." },
  { title: "Den Høflige Gnoll", type: "Social", subtype: "Danger", encounter: "En gnoll træder frem, bukker stift og beder om mad i stedet for kamp.", raceHints: [{ race: "Gnoll", chance: 90 }, { race: "Half-Orc", chance: 10 }], twist: "Den kæmper desperat imod sin flokmentalitet.", effect: "Persuasion DC 15. Success: gnollen giver advarsel om sin flok. Fail: den mister kontrollen." },
  { title: "Den Venlige Kæmpeunge", type: "Social", subtype: "Wonder", encounter: "En ung kæmpe sidder forvirret ved vejen og forsøger at gemme sig bag et træ.", raceHints: [{ race: "Giant", chance: 80 }, { race: "Goliath", chance: 20 }], twist: "Den er løbet hjemmefra, fordi den ikke vil arve familiens krig.", effect: "Persuasion DC 14. Success: den hjælper med tung forhindring. Fail: dens familie finder den." },
  { title: "Den Lille Sorte Bog", type: "Mystery", subtype: null, encounter: "En lille sort bog ligger åben på en sten. Siderne vender sig selv.", raceHints: [{ race: "Human", chance: 40 }, { race: "Tiefling", chance: 35 }, { race: "Gnome", chance: 25 }], twist: "Bogen skriver en ny synd ind, hver gang nogen læser den.", effect: "WIS save DC 14. Success: lær en hemmelighed. Fail: bogen lærer én om dig." },
  { title: "Den Levende Milepæl", type: "Wonder", subtype: "Exploration", encounter: "En milepæl vender langsomt hovedet af sten og spørger, hvor gruppen skal hen.", raceHints: [{ race: "Dwarf", chance: 40 }, { race: "Gnome", chance: 30 }, { race: "Human", chance: 30 }], twist: "Den ved kun veje, der ikke længere findes.", effect: "History DC 13. Success: få genvej til ruin/gammel vej." },
  { title: "Den Sløve Banditflok", type: "Combat", subtype: "Social", encounter: "En flok banditter springer frem, men virker trætte, våde og dårligt organiserede.", raceHints: [{ race: "Human", chance: 55 }, { race: "Half-Orc", chance: 20 }, { race: "Goblin", chance: 25 }], twist: "De vil egentlig hellere ansættes end røve nogen.", effect: "Persuasion DC 13. Success: combat undgås; de deler rygter mod mad eller mønter." },
  { title: "Den Blinde Maler", type: "Social", subtype: "Wonder", encounter: "En blind maler sidder ved vejen og maler landskabet perfekt.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 35 }, { race: "Gnome", chance: 25 }], twist: "Han maler ikke det, der er foran ham, men det der snart vil ske.", effect: "Køber man billedet: advantage på næste initiative eller Insight efter DM's valg." },
  { title: "Den Skæve Gravhøj", type: "Exploration", subtype: "Danger", encounter: "En gravhøj ved vejen hælder, som om noget presser sig ud indefra.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 35 }, { race: "Elf", chance: 20 }], twist: "Den døde prøver ikke at slippe ud, men at holde noget andet inde.", effect: "Religion DC 14. Success: styrk forseglingen. Fail: noget banker hårdere." },
  { title: "Den Røde Ravneklo", type: "Mystery", subtype: null, encounter: "En rødmalet ravneklo hænger i en snor fra en vejgren.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 30 }, { race: "Kenku", chance: 30 }], twist: "Den er ikke en trussel, men en advarsel fra nogen, der ikke tør vise sig.", effect: "Survival DC 13. Success: find skjult observatør. Fail: næste encounter får Surprise." },
  { title: "Den Ensomme Trommeslager", type: "Social", subtype: "Wonder", encounter: "En gammel trommeslager sidder ved vejen og spiller samme rytme igen og igen.", raceHints: [{ race: "Human", chance: 45 }, { race: "Dwarf", chance: 30 }, { race: "Half-Orc", chance: 25 }], twist: "Rytmen holder noget sovende under jorden.", effect: "Stopper musikken: encounter trigger. Hjælper man ham: advantage på næste CON save." },
  { title: "Den Usynlige Hund", type: "Mystery", subtype: null, encounter: "En usynlig hund gør, logrer og forsøger at få gruppen til at følge efter.", raceHints: [{ race: "Halfling", chance: 40 }, { race: "Gnome", chance: 30 }, { race: "Human", chance: 30 }], twist: "Hunden er virkelig. Dens ejer er den usynlige del af mysteriet.", effect: "Animal Handling DC 12. Success: hunden leder gruppen til skjult person/genstand." },
  { title: "Den Grå Præstinde", type: "Social", subtype: null, encounter: "En præstinde i grå klæder beder gruppen om at nævne en afdød, de savner.", raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 25 }, { race: "Aasimar", chance: 30 }], twist: "Hun beder ikke for de døde, men for de levende, der ikke kan slippe dem.", effect: "Svarer man ærligt: advantage på næste WIS save. Lyver man: disadvantage." },
  { title: "Den Vrede Møller", type: "Social", subtype: null, encounter: "En møller med mel i skægget blokerer vejen med sin vogn.", raceHints: [{ race: "Human", chance: 50 }, { race: "Dwarf", chance: 25 }, { race: "Halfling", chance: 25 }], twist: "Han er ikke vred på gruppen, men på den usynlige ånd, der bliver ved med at sabotere hans hjul.", effect: "Investigation DC 13. Success: find ånden og få møllerens hjælp." },
  { title: "Den Lilla Lygtemand", type: "Wonder", subtype: null, encounter: "En lille mand med lilla lanterne vinker fra en sidevej.", raceHints: [{ race: "Gnome", chance: 40 }, { race: "Halfling", chance: 30 }, { race: "Fey", chance: 30 }], twist: "Han fører folk til steder, hvor de finder det, de mangler — ikke det, de vil have.", effect: "Følger man ham: få clue eller emotional revelation. WIS save DC 13 for ikke at blive forsinket." },
  { title: "Den Tørstige Statue", type: "Wonder", subtype: null, encounter: "En lille statue ved vejen holder en tom kop frem.", raceHints: [{ race: "Human", chance: 40 }, { race: "Dwarf", chance: 30 }, { race: "Aasimar", chance: 30 }], twist: "Den drikker kun vand, der er givet af nogen, som selv er tørstig.", effect: "Giv vand: én karakter får advantage på næste save. Nægt: ingen straf, men koppen vender sig væk." },
  { title: "Den Halve Sang", type: "Mystery", subtype: "Social", encounter: "En rejsende kan kun synge første halvdel af en sang og leder desperat efter resten.", raceHints: [{ race: "Half-Elf", chance: 35 }, { race: "Human", chance: 35 }, { race: "Tiefling", chance: 30 }], twist: "Sangens anden halvdel er gemt i en anden persons mareridt.", effect: "Performance DC 14. Success: fremkald et clue i sangen. Fail: alle får urolig søvn." },
  { title: "Den Glemte Bødelsplads", type: "Mystery", subtype: null, encounter: "Et gammelt henrettelsessted ligger skjult bag krat ved vejen.", raceHints: [{ race: "Human", chance: 55 }, { race: "Dwarf", chance: 25 }, { race: "Half-Orc", chance: 20 }], twist: "De henrettede var skyldige, men ikke i det, de blev dømt for.", effect: "History or Religion DC 14. Success: ånderne giver én sand anklage." },
  { title: "Den Urolige Gravhund", type: "Social", subtype: null, encounter: "En lille gravhund graver rasende i vejkanten.", raceHints: [{ race: "Halfling", chance: 45 }, { race: "Human", chance: 35 }, { race: "Gnome", chance: 20 }], twist: "Den graver ikke efter knogler, men efter en begravet besked.", effect: "Animal Handling DC 12. Success: hunden lader gruppen hjælpe og finder beskeden." },
  { title: "Den Lænkede Dør", type: "Exploration", subtype: "Mystery", encounter: "En dør ligger fladt på jorden, lænket fast til en trærod.", raceHints: [{ race: "Dwarf", chance: 35 }, { race: "Gnome", chance: 35 }, { race: "Human", chance: 30 }], twist: "Døren holder ikke noget ude. Den holder en kælder nede.", effect: "Athletics DC 15 eller Thieves' Tools DC 14. Fail: lyde høres nedefra." },
  { title: "Den Tavse Fest", type: "Mystery", subtype: "Social", encounter: "En gruppe velklædte rejsende holder fest uden musik eller tale.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 30 }, { race: "Tiefling", chance: 30 }], twist: "De har solgt deres stemmer for én nat uden sorg.", effect: "Insight DC 14. Success: forstå aftalen. Deltager man: regain 1d4 temp HP, men tavshed i 10 min." },
  { title: "Den Fredelige Harpy", type: "Social", subtype: "Danger", encounter: "En harpy sidder på en sten og synger lavt for sig selv.", raceHints: [{ race: "Harpy", chance: 85 }, { race: "Aarakocra", chance: 15 }], twist: "Hun forsøger ikke at lokke nogen, men at overdøve en anden sang i sit hoved.", effect: "Performance DC 14. Success: hjælp hende og få advarsel. Fail: WIS save DC 13 mod charm." },
  { title: "Den Lille Retssag", type: "Social", subtype: "Mystery", encounter: "Tre børn leger retssag over en dukke ved vejen.", raceHints: [{ race: "Human", chance: 50 }, { race: "Halfling", chance: 30 }, { race: "Tiefling", chance: 20 }], twist: "Legen gentager en virkelig uretfærdighed fra byen længere fremme.", effect: "Insight DC 13. Success: få clue om korrupt dommer eller lokal konflikt." },
  { title: "Den Runde Dør", type: "Exploration", subtype: "Wonder", encounter: "En rund dør står halvt begravet i en skråning.", raceHints: [{ race: "Halfling", chance: 45 }, { race: "Gnome", chance: 35 }, { race: "Dwarf", chance: 20 }], twist: "Døren åbner ind til et varmt hjem, men kun for folk der virkelig har brug for hvile.", effect: "Hvis gruppen er udmattet/skadet: short rest tæller som long rest for én effekt. Ellers åbner den ikke." },
  { title: "Den Grønne Ridderinde", type: "Social", subtype: "Wonder", encounter: "En ridderinde i grøn rustning beder gruppen bedømme en blomst.", raceHints: [{ race: "Elf", chance: 40 }, { race: "Human", chance: 30 }, { race: "Fey", chance: 30 }], twist: "Blomsten er hendes hjerte i forklædning.", effect: "Nature or Insight DC 14. Success: svar nænsomt og få fey-blessing." },
  { title: "Den Glemte Vagtel", type: "Wonder", subtype: null, encounter: "En vagtel løber panisk rundt med en lille metalhjelm på hovedet.", raceHints: [{ race: "Gnome", chance: 40 }, { race: "Halfling", chance: 35 }, { race: "Human", chance: 25 }], twist: "Hjelmen tilhører et miniaturiseret regiment, der leder efter deres spejder.", effect: "Animal Handling DC 12. Success: find mini-regiment og få tiny tactical advice." },
  { title: "Den Hvide Handske", type: "Social", subtype: "Danger", encounter: "En hvid handske ligger midt på vejen, ren trods mudderet.", raceHints: [{ race: "Human", chance: 45 }, { race: "Elf", chance: 30 }, { race: "Dragonborn", chance: 25 }], twist: "Samler man den op, accepterer man en udfordring fra en uset modstander.", effect: "DEX or WIS save DC 13 ved berøring. Fail: duel-marked indtil solnedgang." },
  { title: "Den Lille Stenkrig", type: "Wonder", subtype: null, encounter: "Små sten flyver vredt mellem to grøfter, som om de kastes af usynlige hære.", raceHints: [{ race: "Gnome", chance: 40 }, { race: "Fey", chance: 35 }, { race: "Halfling", chance: 25 }], twist: "To mikroskopiske fey-huse er i krig om retten til en svamp.", effect: "Persuasion DC 13. Success: våbenhvile og fey-trinket. Fail: 1d4 bludgeoning." },
  { title: "Den Vandrende Stige", type: "Wonder", subtype: "Exploration", encounter: "En træstige går af sig selv langs vejen på små ben.", raceHints: [{ race: "Gnome", chance: 50 }, { race: "Halfling", chance: 25 }, { race: "Human", chance: 25 }], twist: "Stigen leder efter noget højt nok til at nå en hemmelighed.", effect: "Følg den: find skjult udsigtspunkt eller loftsrum i ruin. Afbryd: den klatrer op ad en karakter." },
  { title: "Den Våde Fane", type: "Mystery", subtype: null, encounter: "En gennemblødt fane hænger fra et spyd. Farverne er næsten vasket væk.", raceHints: [{ race: "Human", chance: 50 }, { race: "Half-Elf", chance: 25 }, { race: "Dwarf", chance: 25 }], twist: "Fanen skifter symbol, alt efter hvem der holder den.", effect: "History DC 14. Success: afslør skjult loyalitet eller falsk flag-operation." },
  { title: "Den Sovende Troldmandsstav", type: "Wonder", subtype: null, encounter: "En stav ligger i græsset og snorker lavt.", raceHints: [{ race: "Human", chance: 35 }, { race: "Gnome", chance: 35 }, { race: "Elf", chance: 30 }], twist: "Staven har mere selvkontrol end sin tidligere ejer.", effect: "Arcana DC 15. Success: staven giver én cantrip-lignende effekt. Fail: den nægter at virke." },
  { title: "De Syv Sten", type: "Exploration", subtype: "Mystery", encounter: "Syv sten står i en halvcirkel ved vejen.", raceHints: [{ race: "Dwarf", chance: 35 }, { race: "Elf", chance: 35 }, { race: "Human", chance: 30 }], twist: "Hver sten svarer til en stemme, der engang aflagde ed her.", effect: "History DC 14. Success: lær eden og få advantage på næste Persuasion om løfter." },
  { title: "Den Langsomme Pil", type: "Mystery", subtype: null, encounter: "En pil hænger stille i luften over vejen, som om tiden er gået i stå omkring den.", raceHints: [{ race: "Elf", chance: 45 }, { race: "Human", chance: 35 }, { race: "Gnome", chance: 20 }], twist: "Når tiden slipper, rammer pilen det mål, den blev skudt efter.", effect: "Arcana DC 15. Success: flyt pilens mål sikkert. Fail: attack +6, 1d8+3 piercing." },
  { title: "Den Blinde Due", type: "Wonder", subtype: null, encounter: "En blind due lander på én karakters skulder og nægter at flyve væk.", raceHints: [{ race: "Human", chance: 40 }, { race: "Aasimar", chance: 30 }, { race: "Elf", chance: 30 }], twist: "Duen finder ikke vej med øjne, men med løfter.", effect: "Hvis karakteren nævner et løfte højt: duen flyver mod noget relevant." },
  { title: "Den Faldne Stjernepræst", type: "Social", subtype: null, encounter: "En præst ligger bevidstløs ved vejen med stjernekort spredt omkring sig.", raceHints: [{ race: "Human", chance: 40 }, { race: "Elf", chance: 30 }, { race: "Aasimar", chance: 30 }], twist: "Han faldt ikke om. Han så noget på himlen, som så tilbage.", effect: "Medicine DC 12 vækker ham. Arcana DC 14 forstår hans advarsel." },
  { title: "Den Rustne Triangel", type: "Mystery", subtype: null, encounter: "En rusten triangel hænger fra en gren og klinger uden berøring.", raceHints: [{ race: "Gnome", chance: 30 }, { race: "Dwarf", chance: 30 }, { race: "Human", chance: 40 }], twist: "Den ringer, hver gang nogen med onde hensigter nærmer sig.", effect: "Hvis gruppen tager den med: advantage på næste ambush-Perception, men lyden afslører også dem." },
  { title: "Den Ensomme Maskot", type: "Social", subtype: null, encounter: "Et lille dyr med en alt for fin krave følger efter gruppen.", raceHints: [{ race: "Halfling", chance: 40 }, { race: "Gnome", chance: 30 }, { race: "Human", chance: 30 }], twist: "Dyret er maskot for en militær enhed, der desperat leder efter det.", effect: "Animal Handling DC 12. Success: dyret leder gruppen til en venlig patrulje." },
];

const ALL_TYPES = ["Social", "Combat", "Mystery", "Exploration", "Wonder", "Danger"];
const TYPE_SIGILS = { Social: "⚜", Combat: "⚔", Mystery: "◈", Exploration: "✦", Wonder: "✧", Danger: "☠" };
const typeColor = { Social: "#7F77DD", Combat: "#D85A30", Mystery: "#533AB7", Exploration: "#1D9E75", Wonder: "#BA7517", Danger: "#E24B4A" };

function weightedRandom(items, key = "weight") {
  const total = items.reduce((s, i) => s + i[key], 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item[key]; if (r <= 0) return item; }
  return items[items.length - 1];
}
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickRace(raceHints) { return weightedRandom(raceHints, "chance").race; }

function generateCard(activeFilters, activeSeason) {
  const pool = activeFilters.length === 0
    ? encounters
    : encounters.filter(e => activeFilters.includes(e.type) || activeFilters.includes(e.subtype));
  const enc = pool.length > 0 ? randomItem(pool) : randomItem(encounters);
  const weatherPool = activeSeason ? weatherBySeason[activeSeason] : Object.values(weatherBySeason).flat();
  return { ...enc, weather: randomItem(weatherPool), npc: pickRace(enc.raceHints), id: Math.random().toString(36).slice(2) };
}

const parchment = "#F5EDD8";
const ink = "#2A1F0E";
const inkFaded = "#7A6245";
const gold = "#B8962E";
const dividerColor = "#C9A84C44";

function TypeBadge({ type }) {
  const c = typeColor[type] || "#888";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: c, border: `1px solid ${c}44`, borderRadius: 3, padding: "2px 7px" }}>{TYPE_SIGILS[type] || "◆"} {type}</span>;
}

function Section({ label, text }) {
  return <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: inkFaded, marginBottom: 4 }}>{label}</div><p style={{ margin: 0, fontSize: 14, color: ink, lineHeight: 1.65 }}>{text}</p></div>;
}

function FBtn({ children, onClick, primary }) {
  return <button onClick={onClick} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 3, border: `1px solid ${primary ? "#B8962E" : "#7A624566"}`, background: primary ? "#7a4a0a" : "transparent", color: primary ? "#F5EDD8" : "#7A6245", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>{children}</button>;
}

export default function App() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [card, setCard] = useState(() => generateCard([], null));
  const [history, setHistory] = useState([]);
  const [pinned, setPinned] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const draw = useCallback(() => {
    const next = generateCard(activeFilters, activeSeason);
    setCard(next);
    setHistory(prev => [card, ...prev].slice(0, 12));
  }, [activeFilters, activeSeason, card]);

  const toggleFilter = t => setActiveFilters(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleSeason = s => setActiveSeason(prev => prev === s ? null : s);
  const togglePin = id => setPinned(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const cardText = `${card.title}\nType: ${card.type}${card.subtype ? ` / ${card.subtype}` : ""}\n\nHændelse:\n${card.encounter}\n\nDrejning:\n${card.twist}\n\nVejr: ${card.weather.name}\n${card.weather.text}\nEffekt: ${card.weather.effect}\n\nHændelseseffekt:\n${card.effect}`;
  const copy = async () => { try { await navigator.clipboard.writeText(cardText); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };

  const sortedHistory = useMemo(() => [...history.filter(c => pinned.has(c.id)), ...history.filter(c => !pinned.has(c.id))], [history, pinned]);

  return (
    <div style={{ background: "#1a1208", minHeight: "100vh", padding: "20px 16px 8px", fontFamily: "Georgia, 'Times New Roman', serif", color: ink }}>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: gold, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>D&D 5e · Sværdkysten</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: parchment, letterSpacing: "0.05em", margin: 0, textShadow: `0 1px 8px ${gold}55` }}>Aaheim</h1>
        <div style={{ color: parchment, fontSize: 13, letterSpacing: "0.15em", marginTop: 2, opacity: 0.75 }}>Adventures on the road</div>
        <div style={{ color: gold, fontSize: 18, marginTop: 2, opacity: 0.7 }}>✦ ✦ ✦</div>
      </div>

      {/* Season filter */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
        {ALL_SEASONS.map(s => {
          const active = activeSeason === s;
          const c = SEASON_COLORS[s];
          return <button key={s} onClick={() => toggleSeason(s)} style={{ fontSize: 12, padding: "5px 13px", borderRadius: 3, border: `1px solid ${active ? c : "#ffffff22"}`, background: active ? `${c}33` : "transparent", color: active ? c : "#ffffff55", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em" }}>{SEASON_ICONS[s]} {s}</button>;
        })}
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {ALL_TYPES.map(t => {
          const active = activeFilters.includes(t);
          const c = typeColor[t];
          return <button key={t} onClick={() => toggleFilter(t)} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 3, border: `1px solid ${active ? c : "#ffffff22"}`, background: active ? `${c}22` : "transparent", color: active ? c : "#ffffff55", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "inherit" }}>{TYPE_SIGILS[t]} {t}</button>;
        })}
      </div>

      {/* Card */}
      <div style={{ background: parchment, borderRadius: 6, border: `2px solid ${gold}88`, boxShadow: `0 0 0 4px #1a120844, 0 8px 32px #00000088`, maxWidth: 680, margin: "0 auto 16px", overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(90deg, #7a4a0a, #c89030, #7a4a0a)`, height: 4 }} />

        <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${dividerColor}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <TypeBadge type={card.type} />
              {card.subtype && <TypeBadge type={card.subtype} />}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: ink, letterSpacing: "0.02em" }}>{card.title}</h2>
            <div style={{ fontSize: 12, color: inkFaded, marginTop: 4 }}>Mødt person: <em>{card.npc}</em></div>
          </div>
          <div style={{ fontSize: 32, color: gold, opacity: 0.5, marginTop: 4 }}>{TYPE_SIGILS[card.type]}</div>
        </div>

        <div style={{ padding: "16px 22px", display: "grid", gap: 14 }}>
          <Section label="Hændelse" text={card.encounter} />
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${gold}44, transparent)` }} />
          <Section label="Drejning" text={card.twist} />

          <div style={{ background: "#E8D8B044", border: `1px solid ${gold}44`, borderRadius: 4, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: inkFaded, marginBottom: 4 }}>
              ❧ Vejr — {card.weather.name}
              {activeSeason && <span style={{ marginLeft: 8, color: SEASON_COLORS[activeSeason], fontWeight: 400 }}>{SEASON_ICONS[activeSeason]} {activeSeason}</span>}
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: ink, lineHeight: 1.6, fontStyle: "italic" }}>{card.weather.text}</p>
            <div style={{ fontSize: 12, color: inkFaded, borderTop: `1px solid ${dividerColor}`, paddingTop: 8 }}><strong>Effekt:</strong> {card.weather.effect}</div>
          </div>

          <div style={{ border: `1px solid ${dividerColor}`, borderRadius: 4, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: inkFaded, marginBottom: 4 }}>◈ Hændelseseffekt</div>
            <p style={{ margin: 0, fontSize: 14, color: ink, lineHeight: 1.6 }}>{card.effect}</p>
          </div>
        </div>

        <div style={{ background: "#E8D8B055", borderTop: `1px solid ${dividerColor}`, padding: "10px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <FBtn primary onClick={draw}>⚄ Træk nyt kort</FBtn>
          <FBtn onClick={copy}>{copied ? "✓ Kopieret" : "⎘ Kopiér"}</FBtn>
        </div>

        <div style={{ background: `linear-gradient(90deg, #7a4a0a, #c89030, #7a4a0a)`, height: 4 }} />
      </div>

      {/* History */}
      {sortedHistory.length > 0 && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffffff44", textAlign: "center", marginBottom: 10 }}>✦ Historik ✦</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {sortedHistory.map(h => {
              const isPinned = pinned.has(h.id);
              return (
                <div key={h.id} onClick={() => setCard(h)} style={{ flex: "0 0 148px", background: isPinned ? "#3a2a0a" : "#2a1e0a", border: `1px solid ${isPinned ? gold : "#ffffff18"}`, borderRadius: 5, padding: "10px 12px", cursor: "pointer", position: "relative" }}>
                  <div style={{ fontSize: 10, color: typeColor[h.type] || "#aaa", marginBottom: 4, letterSpacing: "0.08em" }}>{TYPE_SIGILS[h.type]} {h.type}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: parchment, lineHeight: 1.3, marginBottom: 6 }}>{h.title}</div>
                  <div style={{ fontSize: 10, color: "#ffffff44" }}>{h.weather.name}</div>
                  <button onClick={e => { e.stopPropagation(); togglePin(h.id); }} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: isPinned ? gold : "#ffffff33", padding: 0 }}>{isPinned ? "★" : "☆"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}