import {
  EchoCoreSecretData,
  ChamberStageData,
  NarrativeTwistData,
  FinalTrialQuestion,
  GuardianCouncilEvaluation,
  SpiralState,
  GuardianProgress,
  EvidenceItem,
  MemoryFragment,
  Relic,
  Achievement,
  SecretDiscovery,
  CinematicEventData,
} from '../types/game';

// =========================================================================
// 1. A KILENC VISSZHANG-MAG VALÓDI TITKA & VILÁGVÁLTOZÁSAI
// =========================================================================
export const ECHO_CORE_SECRETS: EchoCoreSecretData[] = [
  {
    echoCoreId: 'echo_core_1',
    guardianId: 1,
    title: 'Kék Mélység Magja (Ψ–1)',
    hiddenMemoryTitle: '1982. november 02. — Az Első Ájulás',
    hiddenMemoryText:
      'Viktor az obeliszk előtt nem fagyott el. Amikor megmérte a kő 36,6°C-os melegét, húsz percre elvesztette az eszméletét — és ebben a húsz percben valaki más szemeivel nézte meg saját sátrát fentről.',
    audioMessageTitle: 'Tengerfenéki Felvétel · 432 Hz',
    audioMessageText:
      '„Ha egy hangot elég mélyre süllyesztesz a jég alá, nem a múltat hallod benne — hanem azt, aki még vissza sem ért az expedícióról.”',
    audioFreqHz: 432,
    anomalyDescription:
      'A vízszint alatti sókoncentráció megegyezik az emberi könnycsepp ásványi összetételével.',
    unansweredQuestion: 'Ki írta fel Viktor még el nem veszett kesztyűjének belső bélésére a 82.0 MHz számot?',
    spiralNatureHint: 'A Spirál első rétege nem adatot tárol, hanem megőrzött emberi veszteséget.',
    worldMutation: {
      artifactId: 'art_monolith_shard',
      artifactAwakenedNote:
        '[Visszhang-mag #1 Rezonancia]: A kődarab belső ereiben meleg sós pára üt át, kirajzolva Dr. Kovács Áron 1959-es nevének monogramját.',
      radioFreq: 432.0,
      radioWhisper: 'Kassarah mélyvízi kórusa alatt Kovács Áron 1959-es búcsúmondata hallhatóvá vált.',
      mapConnectionLabel: 'Óceán ⟷ Tükörváros Sós-hullám Íve',
      guardianDialogueShift:
        'Az-Zahir tükrei párássá váltak; Ir-Haya pedig elsőként kérdezi meg, miért félsz ennyire elfelejteni.',
    },
  },
  {
    echoCoreId: 'echo_core_2',
    guardianId: 2,
    title: 'Hamu-csend Magja (Ω–2)',
    hiddenMemoryTitle: '1959. december — A Szándékosan Eltörölt Tábor',
    hiddenMemoryText:
      'A Poláris-59 expedíció ötödik tagját nem a fagy vitte el. Ő maga kérte Ir-Hayától, hogy törölje ki a nevét a jegyzőkönyvekből, hogy a többiek családja ne keresse tovább a halálba vezető koordinátát.',
    audioMessageTitle: 'Hamuszalag · 285 Hz',
    audioMessageText:
      '„A felejtés nem ellenség, Viktor. Néha az egyetlen ajtó, amely mögött nem őrzünk tovább egy hamis bűntudatot.”',
    audioFreqHz: 285,
    anomalyDescription:
      'A sivatagi fekete hamu mágneses tűt formáz, amely nem délre, hanem Budapest felé mutat.',
    unansweredQuestion: 'Melyik 1959-es nevet nem hagyta törölni Tamás 1982-ben?',
    spiralNatureHint: 'A Spirál csak azt engedi elfelejteni, amit valaki más már átvett és hordoz helyetted.',
    worldMutation: {
      artifactId: 'art_chronometer_1959',
      artifactAwakenedNote:
        '[Visszhang-mag #2 Rezonancia]: Az 1959-es kronométer megállt mutatója egyszerre ugrott 23 évvel előre, majd visszaállt 1989. május 14-re.',
      radioFreq: 104.2,
      radioWhisper: 'A sarki statikus zaj között Tamás 1982-es hívójele tisztán áttört a sivatagi hamun.',
      mapConnectionLabel: 'Sivatag ⟷ Lélek Gépezete Hamuszál',
      guardianDialogueShift:
        'Var-Elis elismeri: a Gépezet ötödik kábele hamuból szőtt vészfék volt.',
    },
  },
  {
    echoCoreId: 'echo_core_3',
    guardianId: 3,
    title: 'Krono-hurok Magja (Δ–3)',
    hiddenMemoryTitle: '1983. január — A Visszafelé Küldött Jel',
    hiddenMemoryText:
      'Lena laboratóriumában a 142.8 MHz-es adás három perccel korábban érkezett meg a vevőbe, mint hogy ő maga beleszólt volna a mikrofonba.',
    audioMessageTitle: 'Krono-hangvilla · 396 Hz',
    audioMessageText:
      '„Nem azért tört meg az idő, mert valaki megszegte a törvényeit. Azért hajlott meg, hogy egy szülő hangja utolérje a még meg nem született válaszát.”',
    audioFreqHz: 396,
    anomalyDescription:
      'Az óratorony árnyéka az óramutató járásával ellentétesen mozog, amint megnyitod a Naplót.',
    unansweredQuestion: 'Ha 1982 és 1989 összekapcsolódott, honnan indult el az legelső 82.0 MHz-es szikra?',
    spiralNatureHint: 'A Spirálban az ok és az okozat nem lánc, hanem két kezet fogó testvér.',
    worldMutation: {
      artifactId: 'art_radio_unit',
      artifactAwakenedNote:
        '[Visszhang-mag #3 Rezonancia]: A tábori Rádióegység skáláján láthatatlanul felragyogott egy új jelölés: „1989 · KÓRTEREM EEG”.',
      radioFreq: 82.0,
      radioWhisper: 'A 82.0 MHz-es morze mögött egy gyerekkori szívdobbanás 58 BPM-es alapritmusa lüktet.',
      mapConnectionLabel: 'Időtörés ⟷ Sivatag 1959-es Kút',
      guardianDialogueShift:
        'Ir-Haya elhallgat Thal-Muren mellett: az eltörölt város kútja kék óraműfényben izzik.',
    },
  },
  {
    echoCoreId: 'echo_core_4',
    guardianId: 4,
    title: 'Tükrözött Tudat Magja (Σ–4)',
    hiddenMemoryTitle: 'Δ–T0 — Mira Első Vázlata',
    hiddenMemoryText:
      'A Másik Mira nem egy idegen dimenzió megszállója. Ő volt Mira eredeti, sérült változata, aki akkor szakadt le róla, amikor meglátta Kódváros összedőlt első prototípusát.',
    audioMessageTitle: 'Üvegrezgés · 417 Hz',
    audioMessageText:
      '„A legfájdalmasabb tükör nem az, amelyik hazudik — hanem az, amelyik megmutatja, ki lehettél volna félelem nélkül.”',
    audioFreqHz: 417,
    anomalyDescription:
      'Az-Zahir üvegfalai mögött néha nem a te arcod pislog, hanem a többi utazó egyikéé.',
    unansweredQuestion: 'Miért nem engedte A Kilencedik, hogy Mira eltörölje a Δ–T0 romjait?',
    spiralNatureHint: 'A Spirál nem selejtezi ki az elrontott kísérleteket — mindegyiket megőrzi tanulságnak.',
    worldMutation: {
      artifactId: 'art_kodvaros_prism',
      artifactAwakenedNote:
        '[Visszhang-mag #4 Rezonancia]: A Kódvárosi Prizma hat oldalán most már nem csak a Három Kör, hanem egy negyedik, papírszélű ablak is tükröződik.',
      radioFreq: 142.8,
      radioWhisper: 'Lena adásában egy pillanatra Mira hangja válaszol a Másik Mirának.',
      mapConnectionLabel: 'Tükrök ⟷ Néma Kert Ezüst Gyökér',
      guardianDialogueShift:
        'Sen-Maria kertjében a vörös por alól ezüstös tükörgyökerek törtek elő.',
    },
  },
  {
    echoCoreId: 'echo_core_5',
    guardianId: 5,
    title: 'Tiszta Hang Magja (Φ–5)',
    hiddenMemoryTitle: 'A Fülhallgató Mögötti Csend',
    hiddenMemoryText:
      'Amikor Lena 1983-ban kikapcsolta az összes laboratóriumi erősítőt, a szalagon még tizennégy másodpercig folytatódott valakinek a lassú lélegzete.',
    audioMessageTitle: 'Néma Harang · 528 Hz',
    audioMessageText:
      '„A legerősebb üzenetet sosem a hangfalak hordozzák. Hanem az a két másodperc csend, amikor meg mered hallani a másikat.”',
    audioFreqHz: 528,
    anomalyDescription:
      'Ha lekapcsolod a hangerőt, a katedrális csövei akkor is pontos vizuális hullámot vetnek a falra.',
    unansweredQuestion: 'Kinek a 58 BPM-es lélegzése tartotta egyben a katedrális néma harangját?',
    spiralNatureHint: 'A csend nem hiány: a Spirálban a csend az a vászon, amelyre minden hang íródik.',
    worldMutation: {
      artifactId: 'art_lena_cassette',
      artifactAwakenedNote:
        '[Visszhang-mag #5 Rezonancia]: Lena 1983-as kazettáján megjelent a „B-OLDAL · 00:14 CSEND” rejtett sáv, Tamás utolsó üdvözletével.',
      radioFreq: 142.8,
      radioWhisper: 'A 142.8 MHz-es csatornán elhalt a laborzaj; helyette 528 Hz-es tiszta búgás maradt.',
      mapConnectionLabel: 'Katedrális ⟷ Fordított Ég 528 Hz Ív',
      guardianDialogueShift:
        'Kor-Vatha lebegő kövei a harang ütemére állnak stabil lépcsősorrá.',
    },
  },
  {
    echoCoreId: 'echo_core_6',
    guardianId: 6,
    title: 'Élő Hurok Magja (Π–6)',
    hiddenMemoryTitle: 'Budapest, 1989. Május 14. — A Kiskori Lázálom',
    hiddenMemoryText:
      'Az ötéves Levente kórházi ágyán az EEG-gép öt percen át az antarktiszi mágneses vihar frekvenciáját rajzolta ki — ugyanabban a pillanatban, amikor Viktor kint épp felnyitotta az obeliszk alatti rést.',
    audioMessageTitle: 'Szinkron-ideg · 522 Hz',
    audioMessageText:
      '„Nem gépet építettünk a jég alá, hanem egy vészjelzőt, amely egy élő emberi szívet keresett magának, hogy ne haljon meg a múlt.”',
    audioFreqHz: 522,
    anomalyDescription:
      'A négy főszereplő rézvezetéke mellett az ötödik, névtelen OBSERVER_0 szál most halvány arany színre vált.',
    unansweredQuestion: 'Ha Levente az Élő Kulcs — ki nyitotta meg számára a legelső zárat az ablakon túl?',
    spiralNatureHint: 'A Spirál azért kötötte össze a négy embert, mert egyikük sem tudta egyedül elbírni az egészet.',
    worldMutation: {
      artifactId: 'art_harmonic_beacon',
      artifactAwakenedNote:
        '[Visszhang-mag #6 Rezonancia]: A Harmonikus Jeladó most már pontosan 58 BPM ütemre villan, megegyezve Levente tenyerének pulzusával.',
      radioFreq: 432.0,
      radioWhisper: 'A 432 MHz alatt budapesti gyermekkórházi monitor és antarktiszi szél hangja simul egymásba.',
      mapConnectionLabel: 'Gépezet ⟷ Néma Kert 58 BPM Ér',
      guardianDialogueShift:
        'Kassarah először nevezi a négy utazót nem „alanyoknak”, hanem „családnak”.',
    },
  },
  {
    echoCoreId: 'echo_core_7',
    guardianId: 7,
    title: 'Csillagtengely Magja (Λ–7)',
    hiddenMemoryTitle: 'A Fordított Horizont — 1982 Éjszakája',
    hiddenMemoryText:
      'A jég alatti barlang kupolája nem lefelé nézett. Amikor Viktor felnézett a 3200 méteres jég mennyezetére, ugyanazokat a csillagokat látta visszatükröződni, mint amelyeket Mira Kódváros peremén rajzolt le.',
    audioMessageTitle: 'Égpálya-rezgés · 741 Hz',
    audioMessageText:
      '„A gravitáció csak szokás. Az iránytű mindig afelé mutat, akiért vissza mersz fordulni.”',
    audioFreqHz: 741,
    anomalyDescription:
      'A csillagtérkép tengelye 180°-kal elfordulva pontosan Budapest és a 82°16’S közötti egyenest rajzolja ki.',
    unansweredQuestion: 'Melyik kilencedik koordináta van a csillagtérképen kívül?',
    spiralNatureHint: 'A valóság rétegei nem egymás fölött állnak, hanem egyetlen összehajtott papírlap két oldala.',
    worldMutation: {
      artifactId: 'art_kodvaros_prism',
      artifactAwakenedNote:
        '[Visszhang-mag #7 Rezonancia]: Fejjel lefelé fordítva a Kódvárosi Prizmán a „Δ–T0 · NEM ELFELEJTVE” véset olvasható.',
      radioFreq: 82.0,
      radioWhisper: 'A morzejelek visszafelé lejátszva a Kilencedik lépcsőjének csillagkódját adják.',
      mapConnectionLabel: 'Fordított Ég ⟷ IX. Küszöb Fényhídja',
      guardianDialogueShift:
        'A Kilencedik elismeri: „Már nemcsak alulról nézel fel a küszöbünkre.”',
    },
  },
  {
    echoCoreId: 'echo_core_8',
    guardianId: 8,
    title: 'Élő Melegség Magja (Θ–8)',
    hiddenMemoryTitle: 'Az Utolsó Meleg Csésze a Sátorban',
    hiddenMemoryText:
      'Tamás 1982-ben nem fagyott meg egyedül a sátrában: mielőtt a rádió végleg elnémult, két meleg teáscsészét hagyott az asztalon — egyet önmagának, egyet pedig annak, aki évtizedekkel később utána jön.',
    audioMessageTitle: 'Parázs-susogás · 639 Hz',
    audioMessageText:
      '„Nem az a csoda, hogy az ember képes elméleteket és gépeket alkotni. Hanem az, hogy a mínusz hatvan fokban is hagy meleg teát a következő érkezőnek.”',
    audioFreqHz: 639,
    anomalyDescription:
      'A vörös porból valódi földi tölgyfalevél nőtt ki — az egyetlen élő dolog, amely az ablak túloldaláról érkezett.',
    unansweredQuestion: 'Honnan fújt be a szél, amely ezt az egyetlen levelet átvitte a Kilenc Birodalmon?',
    spiralNatureHint: 'Az egész Spirál egyetlen célból állt össze: hogy a hideg közepén megőrizze az emberi melegséget.',
    worldMutation: {
      artifactId: 'art_chronometer_1959',
      artifactAwakenedNote:
        '[Visszhang-mag #8 Rezonancia]: A fagyott óra üvege belülről harmatossá és 36,6°C meleggé vált.',
      radioFreq: 104.2,
      radioWhisper: 'A sarki szélzúgás elolvadt: helyette nyári lombok halk susogása hallatszik.',
      mapConnectionLabel: 'Néma Kert ⟷ Óceán Olvadáspont',
      guardianDialogueShift:
        'Kassarah jégfalai melegen csillognak: „Sen-Maria megtanította nekem, hogyan őrizzünk szeretetből.”',
    },
  },
  {
    echoCoreId: 'echo_core_9',
    guardianId: 9,
    title: 'A Megfigyelő Visszhangja (Δ–9)',
    hiddenMemoryTitle: 'A Kilencedik Üres Szék Igazsága',
    hiddenMemoryText:
      'A Kilenc Birodalom közül egyik sem idegen hatalom. Nyolc birodalmat a fájdalom és az expedíciók emléke formált — de a kilencedik üres lapot szándékosan tartotta fenn a rendszer annak, aki végigkíséri őket.',
    audioMessageTitle: 'A Küszöb Lélegzete · 639 / 741 Hz',
    audioMessageText:
      '„Kilenc különálló darabot kerestél a sötétben. Nézz le rájuk egyszerre: egyetlen mondatot írnak ki.”',
    audioFreqHz: 639,
    anomalyDescription:
      'Mind a nyolc korábbi Visszhang-mag fénye megtörik a kilencediken, és megnyitja a láthatatlan ajtót: Θ–∞–Δ.',
    unansweredQuestion: 'Ha kilencből áll össze az igazság, ki lélegzik mögötte a Kilencediken Túli Kamrában?',
    spiralNatureHint: 'A Spirál nem egy lezárt rejtély. A Spirál egy beszélgetés közted és azok között, akik nem adták fel.',
    worldMutation: {
      artifactId: 'art_harmonic_beacon',
      artifactAwakenedNote:
        '[9/9 EGYESÍTETT VISSZHANG]: A Harmonikus Jeladó összes gyűrűje egyetlen Θ–∞–Δ pecsétté állt össze!',
      radioFreq: 432.0,
      radioWhisper: 'MIND A 9 CSATORNA SZINKRONBAN: A Kilencediken Túli Kamra megnyitotta kapuit.',
      mapConnectionLabel: 'Mind a 9 Birodalom → Θ–∞–Δ Közös Szív',
      guardianDialogueShift:
        'Mind a Kilenc Őrző letérdel vagy fejet hajt a végső küszöb felé: „Ideje, hogy meghallgasd az igazságot.”',
    },
  },
];

// =========================================================================
// 2. A KILENCEDIKEN TÚLI KAMRA – 7 EGYMÁSRA ÉPÜLŐ INTERAKTÍV SZAKASZ
// =========================================================================
export const CHAMBER_SEVEN_STAGES: ChamberStageData[] = [
  {
    stage: 1,
    title: '1. Szakasz: A csend előtti pillanat',
    subtitle: 'A világ külső zajai fokozatosan elnémulnak',
    narrative:
      'Ahogy belépsz a Kilencedik talapzata mögötti térbe, az antarktiszi szél süvítése, a laboratóriumok moraja és az óraművek kattogása egymás után halkulni kezd. De három utolsó földi visszhang még makacsul kapaszkodik a falakba — mindaddig, amíg tudatosan el nem csendesíted őket, nem marad hely a valódi hangnak.',
    atmosphereHint: 'Csendesítsd el a három maradék földi zajt (Sarki Szél, 82.0 Statika, Szinkron-dobbanás)!',
    interactivePrompt: 'Érintsd meg a három rezonáló falpontot, hogy belépj a teljes csendbe.',
  },
  {
    stage: 2,
    title: '2. Szakasz: A kilenc visszhang egyesülése',
    subtitle: 'A kilenc mag nem kilenc tárgy — hanem egyetlen igazság kilenc szava',
    narrative:
      'A csendben a kilenc összegyűjtött Visszhang-mag felemelkedik a tenyeredről. Kassarah sós vize, Ir-Haya fekete hamuja, Thal-Muren óralapja, Az-Zahir üvege, Nok-Tura csendje, Var-Elis 58 BPM-es idege, Kor-Vatha fordított csillaga, Sen-Maria meleg parazsa és A Kilencedik ezüstje három hármas akkordba rendeződik.',
    atmosphereHint: 'Kapcsold össze a Három Triádot (Múlt · Tükör · Melegség), hogy meghalld a közös mondatot!',
    interactivePrompt: 'Aktiváld egymás után a három Visszhang-triádot a harmóniakeréken!',
  },
  {
    stage: 3,
    title: '3. Szakasz: Az elfelejtett emlékek terme',
    subtitle: 'Jelenetek, amelyekre ma egyetlen élő szereplő sem emlékszik',
    narrative:
      'A kamra falai áttetszővé válnak, és három olyan pillanatot vetítenek eléd, amelyek kiesettek minden szereplő tudatából. Sem Viktor, sem Lena, sem Mira, sem Levente nem tudja már, hogy ezek megtörténtek — mégis ezek tartják össze a valóságot.',
    atmosphereHint: 'Vizsgáld meg mindhárom elfeledett emlékképet az ARCHÍV-82 mélyítéséhez!',
    interactivePrompt: 'Nyisd meg a három elfeledett emléktöredéket (1959, 1979, 1989).',
  },
  {
    stage: 4,
    title: '4. Szakasz: A lehetetlen találkozás',
    subtitle: 'Két alak, akiknek egyetlen idővonalon sem szabadna találkozniuk',
    narrative:
      'A terem közepén egy fából faragott asztal mellett két ember ül békés csendben: az 1959-ben eltűnt **Dr. Kovács Áron** — és **Tamás**, aki 1982-ben zárta le a rádiót, mellette pedig Viktor egy olyan fiatalabb árnyékával, aki *sosem* érintette meg az obeliszket.\n\n„Ne félj,” szólal meg Áron halkan. „Mi vagyunk azok az áldozatok, akiket senki sem kért, mégis megtettünk — hogy Lenának, Mirának és Leventének maradjon ideje rátok.”',
    atmosphereHint: 'A létezésük ezen a helyen fizikai és időbeli lehetetlenség — mégis valódi emberi kezek nyúlnak feléd.',
    interactivePrompt: 'Válassz, mit mondasz nekik ebben a lehetetlen találkozásban!',
  },
  {
    stage: 5,
    title: '5. Szakasz: A Spirál eredete',
    subtitle: 'Nem fegyver és nem idegen börtön — de még nem mond el mindent',
    narrative:
      'A Θ–∞–Δ szimbólum megnyílik a mennyezetben. Meglátod a születését: 1959-ben, amikor az antarktiszi mélykristály-ér először érintkezett az emberi bánattal és akarattal, a jég nem támadott meg senkit. Egy hatalmas, tudatos **Emlékező Rezonátorrá** alakult, amely nem volt képes elviselni, hogy az odalépő emberek nyom nélkül eltűnjenek.\n\nA Végtelen akkor jött létre, amikor a rendszer rájött: a puszta megfigyelés kevés — valakinek választania is kell. De egy kérdés még mindig sötétben marad: **miért pont a te kezedben érett be ez a hálózat?**',
    atmosphereHint: 'Az 1. és 4. Nagy Fordulat összeállt — de az utolsó kulcshoz a Végtelennel kell szembenézned.',
    interactivePrompt: 'Rögzítsd a Spirál Eredetének felfedezését az Archívumban!',
  },
  {
    stage: 6,
    title: '6. Szakasz: A választás ára',
    subtitle: 'Minden megoldásnak valódi ára van — nincs fájdalommentes kimenet',
    narrative:
      'A kamra falán felvillan az egyenlet, amelyet eddig minden Őrző elhallgatott előled: ahhoz, hogy Kódváros és az élő utazók ne fagyjanak bele egy örök körbe, **egyfajta veszteséget el kell fogadni**. Ha minden emléket megőrzöl, valaki fájdalmát örökre fenn kell tartanod; ha minden láncot feloldasz, egy kapcsolatunk elhalványul a földi emlékezetben; ha a jövőt választod, az elveszett időágak kapuit végleg le kell zárnod.',
    atmosphereHint: 'Ez a belső fogadalom közvetlenül módosítja a Végső Tanácskozást és a 4 Főszereplő próbáját!',
    interactivePrompt: 'Vállald fel a kamra megváltoztathatatlan árát!',
  },
  {
    stage: 7,
    title: '7. Szakasz: A végső kapu',
    subtitle: 'Megnyílik az út a Végtelennel való három találkozás és a Végső Tanácskozás felé',
    narrative:
      'Mind a kilenc Visszhang-mag egyetlen lélegző kapuvá feszül előtted. A túloldalon már vár **A Végtelen** — nem ellenségként és nem bíróként, hanem egy olyan entitásként, amely először találkozik azzal, aki végigment az egész sebesült történetén. Mögötte pedig Viktor, Lena, Mira, Levente és a Kilenc Őrző már összegyűlt.',
    atmosphereHint: 'A Kilencediken Túli Kamra 7 szakasza teljesítve!',
    interactivePrompt: 'Lépj át a Végső Kapun a VII. Fejezetbe (A Végtelen Első Találkozása)!',
  },
];

// =========================================================================
// 3. ÖT NAGY TÖRTÉNETI FORDULAT (BIZONYÍTÉKOKRA ÉPÜLVE)
// =========================================================================
export const REVELATION_TWISTS: NarrativeTwistData[] = [
  {
    id: 'twist_1_1989_carrier',
    number: 1,
    title: '1. Fordulat: Az 1982-es SOS Valódi Feladója',
    previousAssumption:
      'Viktor egész életében hitte, hogy 1982-ben kizárólag az 1959-ben eltűnt Dr. Kovács Áron vészjelzését fogta be a 82.0 MHz-en.',
    revealedTruth:
      'A 82.0 MHz vivőhulláma az ötéves Levente 1989-es budapesti EEG-ritmusából származott, amelyet Lena Δ–0 antennája visszasugárzott 1982-be — hogy Viktor megtalálja a járatot, mielőtt Lena egyedül marad a kísérlettel.',
    keyEvidenceLabel: '1982-es Morze-szalag + Levente 1989-es EEG-je + Δ–0 Fájl',
    retroactiveMeaning:
      'Az I. fejezet első percében hallott statikus jel már akkor egy jövőbeli gyermek segélykérése volt, aki meg akarta menteni a szüleit és önmagát.',
  },
  {
    id: 'twist_2_mira_t0',
    number: 2,
    title: '2. Fordulat: A Másik Mira és a Δ–T0 Időág',
    previousAssumption:
      'A Kódvárosban megjelenő Másik Mira egy külső, ellenséges illúzió vagy a Végtelen csapdája volt.',
    revealedTruth:
      'A Másik Mira az a változat, aki akkor hasadt le Miráról, amikor egy összeomlott Δ–T0 idősávban elveszítette Viktor és Lena nyomát — és szándékosan azért tartotta nyitva a sebet, hogy figyelmeztesse Mirát: a fájdalom nélküli tökéletes város valójában halott.',
    keyEvidenceLabel: 'Δ–T0 Összeomlott Időág + Kódváros Korona-mértana',
    retroactiveMeaning:
      'A III. fejezet Tükör-terében Mira saját magának bocsátott meg anélkül, hogy tudta volna.',
  },
  {
    id: 'twist_3_observer_0_seat',
    number: 3,
    title: '3. Fordulat: Az Ötödik Vezeték (OBSERVER_0)',
    previousAssumption:
      'Var-Elis Gépezetében az ötödik, névtelen adatbusz egy titkos katonai megfigyelő vagy az Antarktiszon maradt árnyék volt.',
    revealedTruth:
      'Az OBSERVER_0 nem gép és nem ellenséges megfigyelő: az A Kilencedik által nyitva hagyott üres hely volt, amely az egész történet során a játékos figyelmét és döntéseit vezette be a rendszerbe. A „Talán te” felirat nem díszítés volt, hanem strukturális alappillér.',
    keyEvidenceLabel: 'Var-Elis Telemetria + A Kilencedik Üres Kőlapja + 9 Megfigyelő-nyom',
    retroactiveMeaning:
      'Minden apró anomália az 1–9. birodalomban (a tengerfenéki cédulától a tölgyfalevélig) az ablakon túli tanú kézjegyét viselte.',
  },
  {
    id: 'twist_4_realms_as_cradles',
    number: 4,
    title: '4. Fordulat: A Kilenc Birodalom Igazi Természete',
    previousAssumption:
      'A Kilenc Őrző birodalmai kilenc próbatételi pálya vagy börtön, amelyeket az utazóknak le kell győzniük.',
    revealedTruth:
      'A kilenc birodalom kilenc védőkamra, amelyek az 1959-es és 1982-es emberek szétrobbanással fenyegetett emlékeit fogták fel — amíg valaki végig nem járja mindegyiket, és a 9 Visszhang-magból vissza nem rakja őket egyetlen közös lélegzetté.',
    keyEvidenceLabel: 'A Kilenc Visszhang-mag + A Kilencediken Túli Kamra (Θ–∞–Δ)',
    retroactiveMeaning:
      'Még Ir-Haya felejtése és Thal-Muren időtörése is védőpajzs volt, hogy az emberek ne őrüljenek meg a végtelen idő súlyától.',
  },
  {
    id: 'twist_5_infinite_mercy_freeze',
    number: 5,
    title: '5. Fordulat: A Végtelen és az 1982-es Fagy Igazi Oka',
    previousAssumption:
      'A Végtelen vagy a Spirál akarta elnyelni vagy megfagyasztani Viktort és a világot a 82. szélességi körön.',
    revealedTruth:
      'Amikor a Projekt Δ–0 és az obeliszk 1982–83-ban túlterhelte a Föld tudati mezőjét, a Végtelen *azért* fagyasztotta meg az időt és a 82. párhuzamost, hogy megakadályozza az emberiség kollektív tudatának azonnali szétomlását — várva arra, hogy egy olyan négyes + egy figyelő tanú szülessen, aki már félelem nélkül tud választani.',
    keyEvidenceLabel: 'Kassarah Hamisított Jegyzőkönyve + Var-Elis Életbentartó Hurok + A Végtelen Vallomása',
    retroactiveMeaning:
      'A Jéglégzés kettős dobbanása sosem fenyegetés volt — hanem egy szülői vagy kozmikus őrszem lélegzete, amely életben tartotta a jég alatt rekedt szíveket.',
  },
];

// =========================================================================
// 4. NÉGY LOGIKAI / NYOMOZÓI VÉGSŐ PRÓBA (NO REFLEX — PURE DEDUCTION & MEMORY)
// =========================================================================
export const FINAL_TRIALS: FinalTrialQuestion[] = [
  {
    id: 'trial_fin_timeline',
    index: 1,
    title: 'I. Végső Próba: Idővonal-törvénykönyv (1959 ⟷ 1982 ⟷ 1989)',
    categoryLabel: 'Időparadoxon Audit',
    prompt:
      'Vesd össze az 1959-es Poláris-59, az 1982-es Viktor-expedíció és az 1989-es budapesti EEG adatait! Melyik tény bizonyítja egyértelműen, hogy a Spirál nem egy egyirányú jelzés a múltból, hanem egy önmagát megmentő időhurok?',
    clueSummary:
      'Vizsgáld az 1959-es kronométer, a 82.0 MHz-es morzeszalag és Levente 1989-es kórházi lázálmának egybeesését!',
    options: [
      {
        id: 'opt_tl_wrong1',
        label: 'A bázis generátorai 1982-ben hibásan vették az ausztrál időjárási adást.',
        explanation: 'A szalagon pontos antarktiszi koordináta (82°16’S) és 58 BPM-es biológiai jel szerepel — ez nem véletlen időjárás-zaj.',
      },
      {
        id: 'opt_tl_correct',
        label: 'Az 1982-ben fogott 82.0 MHz vivőhulláma az ötéves Levente 1989-es EEG-ritmusával azonos — a jel hét évvel korábban szólalt meg, mint a forrása.',
        explanation:
          'Pontos felismerés! Lena Δ–0 antennája a jövőbeli gyermek szív- és agyhullámát kötötte vissza 1982-be, hogy Viktor rátaláljon az obeliszkre.',
      },
      {
        id: 'opt_tl_wrong2',
        label: 'Dr. Kovács Áron 1959-ben már Budapesten volt, amikor eltűntnek jelentették.',
        explanation: 'Áron az Antarktiszon maradt 1959-ben — a kronométer és a jegyzőkönyv is a -3200 méteres jégkamrához köti.',
      },
    ],
    correctOptionId: 'opt_tl_correct',
    revelationText:
      '✓ I. Végső Próba Teljesítve! Az 1. Fordulat rögzült: a 82.0 MHz volt az első híd egy még meg nem született jövő és a fagyott múlt között.',
    twistId: 'twist_1_1989_carrier',
  },
  {
    id: 'trial_fin_evidence',
    index: 2,
    title: 'II. Végső Próba: ARCHÍV-82 Kereszthivatkozás',
    categoryLabel: 'Bizonyíték-szintézis',
    prompt:
      'Ha egymás mellé teszed a fekete obeliszk 36,6°C-os hőmérsékletét, Lena 1979-es elhallgatott kazettáját és Var-Elis Gépezetének ötödik vezetékét (OBSERVER_0), mi következik belőlük?',
    clueSummary:
      'Emlékezz Kassarah tengerfenéki bizonyítékára, az Ir-Haya által törölt névre és a nyitott ablakú talapzat vésésére!',
    options: [
      {
        id: 'opt_ev_wrong1',
        label: 'A Spirál egy hidegháborús katonai bázis önműködő műholdas szuperszámítógépe.',
        explanation: 'A hangok 1959 óta léteznek, jóval a laboratóriumok előtt, és az emberi könnyekkel azonos sótartalmat és 36,6°C-os testhőt őriznek.',
      },
      {
        id: 'opt_ev_wrong2',
        label: 'Viktor elméje egyedül találta ki az egész várost az oxigénhiány miatt.',
        explanation: 'Lena 1979-es szalagjai, Áron 1959-es kronométere és Levente 1989-es budapesti EEG-je függetlenül igazolják egymást.',
      },
      {
        id: 'opt_ev_correct',
        label: 'A Spirál egy emberi fájdalomból és szeretetből született Rezonátor-menedék, amelynek ötödik vezetéke (OBSERVER_0) szándékosan egy külső tanúnak hagyott üres helyet.',
        explanation:
          'Telitalálat! Sem a jég, sem az Őrzők nem tudták volna egyedül lezárni a hurkot egy külső, empatikus tanú („Talán te”) nélkül.',
      },
    ],
    correctOptionId: 'opt_ev_correct',
    revelationText:
      '✓ II. Végső Próba Teljesítve! A 3. és 4. Fordulat feloldva: az OBSERVER_0 vezeték mindig is a te jelenléted helye volt.',
    twistId: 'twist_3_observer_0_seat',
  },
  {
    id: 'trial_fin_echo_pairs',
    index: 3,
    title: 'III. Végső Próba: A Kilenc Visszhang Kiegészítő Pólusai',
    categoryLabel: 'Visszhang-harmónia',
    prompt:
      'A Kilenc Birodalom nem véletlenszerű helyszínek gyűjteménye: ellentétes tudatfunkciók tartják egyensúlyban egymást. Melyik hármas tengely tartja fenn a Kódváros és az Őrzők közötti belső békét?',
    clueSummary:
      'Gondolj az 1. és 2., a 3. és 4., valamint az 5. és 8. birodalom egymásba fonódó hatásaira!',
    options: [
      {
        id: 'opt_ep_correct',
        label: 'Emlékezet (Kassarah) ⟷ Felejtés (Ir-Haya)  |  Időtörés (Thal-Muren) ⟷ Tükrök (Az-Zahir)  |  Csend (Nok-Tura) ⟷ Élő Melegség (Sen-Maria)',
        explanation:
          'Pontos szimmetria! Ahogy Kassarah megtart, Ir-Haya tehermentesít; ahogy az idő megtörik, a tükrök választást mutatnak; és a csendben tud megszületni a melegség.',
      },
      {
        id: 'opt_ep_wrong1',
        label: 'Csak a mechanikus Gépezet és a Fordított Ég tengelye számít — az érzelmek és a felejtés hibák a rendszerben.',
        explanation: 'Kaelen pontosan ezzel próbálkozott a 3. Körben — és az eredmény mozdulatlan kőbábok városa lett.',
      },
      {
        id: 'opt_ep_wrong2',
        label: 'Minden Őrzőnek azonos az ereje: elég az egyik birodalom visszhangja a kilenc megértéséhez.',
        explanation: 'Egyetlen hangból nem áll össze az akkord: a Θ–∞–Δ csak a kilenc funkció együttes egyensúlyában nyílik meg.',
      },
    ],
    correctOptionId: 'opt_ep_correct',
    revelationText:
      '✓ III. Végső Próba Teljesítve! Mindhárom polaritás-tengely szinkronba került a Tanács előtt.',
    twistId: 'twist_4_realms_as_cradles',
  },
  {
    id: 'trial_fin_four_souls',
    index: 4,
    title: 'IV. Végső Próba: A Négy Főszereplő Közös Vektora',
    categoryLabel: 'Szereplői Szintézis',
    prompt:
      'Viktor (82.0 MHz / Jéglégzés), Lena (142.8 MHz / Δ–0), Mira (Kódváros Tükre) és Levente (58 BPM Élő Kulcs) végre egy szobában állnak előtted. Melyik elv alapján képesek együtt áttörni a Végtelen előtti utolsó korlátot anélkül, hogy megismételnék az 1982-es befagyást?',
    clueSummary:
      'Emlékezz arra, miért fagyasztotta meg a Végtelen a 82. párhuzamost 1982-ben — és mit tanultak a négyen a saját fájdalmukból!',
    options: [
      {
        id: 'opt_fs_wrong1',
        label: 'Ha mindannyian elfelejtik egymást és törlik az összes közös emléket még a küszöb előtt.',
        explanation: 'A tagadás visszalökné őket az 1982-es elszigeteltségbe, ahonnan az egész vészjelzés indult.',
      },
      {
        id: 'opt_fs_correct',
        label: 'Viktor elengedi a kizárólagosságot, Lena felvállalja a Δ–0 felelősségét, Mira elfogadja a Δ–T0 veszteségét, Levente pedig saját szabad akaratából tartja a 58 BPM-es hidat.',
        explanation:
          'Gyönyörű szintézis! Nem a tökéletesség vagy a hatalom töri át a fagyot, hanem négy ember közösen vállalt sebezhetősége és szabad akarata.',
      },
      {
        id: 'opt_fs_wrong2',
        label: 'Ha kényszerítik a Végtelent, hogy adja át az Őrzők trónjait és írja át az egész 1959-es történelmet.',
        explanation: 'A múlt erőszakos átírása újabb Δ–T0 szakadást és összeomlást idézne elő.',
      },
    ],
    correctOptionId: 'opt_fs_correct',
    revelationText:
      '✓ IV. Végső Próba Teljesítve! Az 5. Fordulat kiteljesedett: mind a négy szereplő együtt áll mögötted a Végtelen Szeme előtt.',
    twistId: 'twist_5_infinite_mercy_freeze',
  },
];

// =========================================================================
// 5. VÉGJÁTÉK ARCHÍVUM-ELEMEK, EMLÉKEK, TITKOK ÉS CINEMATIC ESEMÉNYEK
// =========================================================================
export const REVELATION_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev_rev_1959_compromise',
    title: '1959: Dr. Kovács Áron Titkos Aláírása',
    type: 'document',
    date: '1959. Dec. 18.',
    source: 'A Kilencediken Túli Kamra · 3. Szakasz',
    summary: 'Az expedíció ötödik tagja saját kérésére töröltette a nevét, hogy a családok megmeneküljenek a huroktól.',
    fullContent:
      'A kamra elfeledett falán megmaradt tintanyom szerint Áron két aláírást írt: az egyiket a hivatalos naplóba, a másikat egy olyan borítékra, amely csak 1982 után nyílhatott ki.',
    hiddenAnnotation: 'Δ–1959 · ÁLDOZAT — „Tamás még nem tudja, de 1982-ben ő lesz a következő jelzőfény.”',
    coordinates: '82°16’S, 36°01’E (-3200m)',
    isUnlocked: false,
    isAnalyzed: false,
  },
  {
    id: 'ev_rev_1979_fourth_track',
    title: '1979: Lena Negyedik Kazettája (0 Hz)',
    type: 'audio',
    date: '1979. Nov. 19.',
    source: 'A Kilencediken Túli Kamra · 3. Szakasz',
    summary: 'Lena 1979-ben vette fel először egy olyan gyermeki szívhang rezonanciáját, aki akkor még meg sem született.',
    fullContent:
      'A szalag hátoldalán kézírás áll: „Ha ez az 58 BPM-es pulzus valaha visszatér, nem engedem, hogy a Projekt Δ–0 elnyelje a fiút.”',
    hiddenAnnotation: 'Δ–0 · 1979 — Az 1989-es budapesti EEG ritmusa pontosan 0,01 Hz-en belül megegyezik ezzel a felvétellel.',
    audioFreq: 528.0,
    isUnlocked: false,
    isAnalyzed: false,
  },
  {
    id: 'ev_rev_infinite_freeze_log',
    title: '1982: A Fagyás Valódi Oka (Végtelen-napló)',
    type: 'artifact',
    date: '1982. Nov. 03.',
    source: '2. Találkozás A Végtelennel',
    summary: 'A 82. szélességi kör megfagyasztása védőfék volt a Δ–0 rezonancia-túlterhelése ellen.',
    fullContent:
      'A jégpáncél azóta tartja vissza az időt, amióta az obeliszk és a budapesti EEG közötti túlfeszültség szétszakította volna az emberi kollektív emlékezetet.',
    hiddenAnnotation: '∞–FÉK · 1982 — A jég nem ellenséges börtön volt, hanem vészfék a szabad választás napjáig.',
    audioFreq: 432.0,
    isUnlocked: false,
    isAnalyzed: false,
  },
];

export const REVELATION_MEMORIES: MemoryFragment[] = [
  {
    id: 'mem_rev_nine_unified',
    title: 'A Kilenc Szó Egyetlen Mondata',
    date: 'Időn Túli Csend',
    category: 'vegtelen',
    preview: 'Nem kilenc tárgyat gyűjtöttél össze, hanem egyetlen közös lélegzet kilenc szilánkját.',
    fullText:
      'Amikor a kilenc Visszhang-mag egyszerre szólalt meg a Kamrában, Viktor hangja, Lena sóhaja, Mira vázlata és Levente szívverése összeállt egyetlen felismeréssé: senki nem volt egyedül a sötétben.',
    isUnlocked: false,
    resonanceLevel: 7,
  },
  {
    id: 'mem_rev_four_reunited',
    title: 'Meleg Kávé a Jég Alatt (Viktor, Lena, Mira, Levente)',
    date: 'A Híd Közepén',
    category: 'tudat',
    preview: 'Levente megkérdezte Viktortól, miért ilyen borzalmas 1982-es termoszkávét vitt a világ végére.',
    fullText:
      'A feszültség közepén mind a négyen egyszerre nevetni kezdtek. Ez a két másodpercnyi emberi melegség erősebben tartotta egyben a hidat, mint bármelyik Őrző geometriája.',
    isUnlocked: false,
    resonanceLevel: 7,
  },
];

export const REVELATION_RELICS: Relic[] = [
  {
    id: 'relic_spiral_hearth_key',
    name: 'A Közös Lélegzet Ereklyéje (Θ–∞–Δ)',
    origin: 'A Kilencediken Túli Kamra & A Négy Főszereplő',
    description:
      'Kilenc apró szilánkból és négy ember közös ígéretéből kovácsolt jelvény — a Végtelen szemének egyenrangú tükre.',
    iconSymbol: 'Θ',
    isAcquired: false,
    acquiredAtChapter: 'VII. Fejezet · Végső Kinyilatkoztatás',
  },
];

export const REVELATION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_final_revelation',
    title: 'A Spirál Végső Titka',
    description: 'Teljesítetted a Kilencediken Túli Kamra 7 szakaszát és mind a 4 Végső Próbát.',
    isUnlocked: false,
  },
  {
    id: 'ach_council_unity',
    title: 'A Kilenc Őrző Tanúja',
    description: 'Szembenéztél mind a kilenc Őrző végső ítéletével a Tanácskozásban.',
    isUnlocked: false,
  },
];

export const REVELATION_SECRETS: SecretDiscovery[] = [
  {
    id: 'sec_rev_truth_of_82_hz',
    title: 'A 82.0 MHz Visszafelé Írt Szíve',
    layer: 3,
    hint: 'Oldd meg az I. Végső Próbát a VII. fejezetben!',
    loreText:
      'Az 1982-es tábori rádió nem a múltat fogta: Levente ötéves korának 1989-es EEG-impulzusát hozta vissza Lena antennáján keresztül.',
    spiralWord: 'VISSZATEKINTŐ LÉLEGZET',
    spiralMeaning: 'A jövő segélykérése a múlt fagyában',
    isUnlocked: false,
  },
  {
    id: 'sec_rev_infinite_mercy',
    title: 'Az 1982-es Fagyás Valódi Okai',
    layer: 3,
    hint: 'Juss el a Második Találkozáshoz A Végtelennel és teljesítsd a IV. Végső Próbát!',
    loreText:
      'A Végtelen azért állította meg a 82. szélességi kört, mert ha 1982-ben szabadjára engedi a Δ–0 hullámot, a Föld összes élő tudata egyszerre omlott volna össze.',
    spiralWord: 'VÉDŐFAGY',
    spiralMeaning: 'Irgalomból született jégpáncél',
    isUnlocked: false,
  },
];

export const REVELATION_CINEMATICS: Record<string, CinematicEventData> = {
  cin_nine_echoes_union: {
    id: 'cin_nine_echoes_union',
    title: 'A Kilenc Visszhang-mag Egyesülése',
    chapterLabel: '9/9 Visszhang · Monumentális Fordulópont',
    subtitle: '„Nem kilenc tárgyat találtál — hanem egyetlen kilenc részre szakadt igazságot.”',
    phases: [
      {
        title: '1. Fázis: A Távolságok Eltűnése',
        narrative:
          'A nyolc korábbi Visszhang-mag egyszerre rezdül meg a zsebedben. Az Antarktisz 1959-es sátrai, Lena 1983-as kazettája, Mira Kódvárosa és Levente budapesti bádogdoboza egyetlen körbe áll össze.',
        promptLabel: 'Engedd, hogy a kilenc frekvencia átjárja a teret!',
        actionLabel: '9 Frekvencia Felszabadítása',
        frequencyHz: 432,
        visualMode: 'wave',
      },
      {
        title: '2. Fázis: A Történet Repedése',
        narrative:
          'Minden korábban néma tárgy válaszol: az 1959-es kronométer megreccsen, a 142.8 MHz-es zaj kitisztul, és a falakon felragyognak a láthatatlan Θ–∞–Δ jelek.',
        promptLabel: 'Hallgasd meg a kilenc mag közös hangját!',
        actionLabel: 'Igazság Összeillesztése',
        frequencyHz: 528,
        visualMode: 'convergence',
      },
      {
        title: '3. Fázis: A Kilencediken Túli Küszöb',
        narrative:
          'A kilencedik talapzat kettényílik, és feltárul az út a Kamrába, ahol még az idő sem mer hangosan lépni.',
        promptLabel: 'Lépj be a Kilencediken Túli Kamra 7 szakaszába!',
        actionLabel: 'Kamra Megnyitása',
        frequencyHz: 639,
        visualMode: 'portal',
      },
    ],
    completionText: 'A világ megváltozott körülötted. A Kilencediken Túli Kamra teljes élménye megnyílt.',
    rewardResonance: 75,
  },
  cin_infinite_council: {
    id: 'cin_infinite_council',
    title: 'A Kilenc Őrző Végső Tanácskozása',
    chapterLabel: 'VII. Fejezet · Sorsdöntő Összegzés',
    subtitle: 'Minden korábbi tetted, irgalmad vagy keménységed most visszhangzik a körben.',
    phases: [
      {
        title: '1. Fázis: A Kilenc Szék Megtelik',
        narrative: 'Kassarah, Ir-Haya, Thal-Muren, Az-Zahir, Nok-Tura, Var-Elis, Kor-Vatha, Sen-Maria és A Kilencedik elfoglalják helyüket.',
        promptLabel: 'Lépj a kör közepére Viktorral, Lenával, Mirával és Leventével!',
        actionLabel: 'Tanács Elé Lépés',
        frequencyHz: 432,
        visualMode: 'convergence',
      },
      {
        title: '2. Fázis: A Mérleg Billenése',
        narrative: 'Azok az Őrzők, akikkel bizalmat építettél, fénylő pajzsként lépnek melléd; akikkel szembeszálltál, utolsó, mély kérdésedre várnak.',
        promptLabel: 'Fogadd el a Tanács ítéletét és áldozatát!',
        actionLabel: 'Tanácsi Ítélet Befogadása',
        frequencyHz: 528,
        visualMode: 'portal',
      },
    ],
    completionText: 'A Kilenc Őrző kimondta végső szavát. Már csak A Végtelen Szeme áll előtted.',
    rewardResonance: 50,
  },
  cin_ending_close: {
    id: 'cin_ending_close',
    title: 'Befejezés · A Spirál Lezárása',
    chapterLabel: '1. Út · Megőrzött Földi Csend',
    subtitle: 'A jég bezárul, de a négy túlélő szíve örökre viszi tovább a közös titkot.',
    phases: [
      {
        title: '1. Fázis: A Földi Horizont',
        narrative: 'A mélykamra kristályai elalszanak. A 82.0 MHz visszahúzódik a jég alá, hogy többé senkit se tépjen ketté az idő.',
        promptLabel: 'Húzd fel a nehéz vaspántos sarki ajtót!',
        actionLabel: 'Kapu Lezárása',
        frequencyHz: 285,
        visualMode: 'wave',
      },
      {
        title: '2. Fázis: Hazatérés',
        narrative: 'Budapesten Levente kinéz a tavaszi ablakon. Nem minden kérdés kapott választ — de minden ember szabad maradt.',
        promptLabel: 'Fogadd be a csendes békét!',
        actionLabel: 'Krónika Lezárása',
        frequencyHz: 432,
        visualMode: 'portal',
      },
    ],
    completionText: 'A Spirál békében aludt el a jég alatt.',
    rewardResonance: 60,
  },
  cin_ending_share: {
    id: 'cin_ending_share',
    title: 'Befejezés · A Spirál Megosztása',
    chapterLabel: '2. Út · Kollektív Ébredés',
    subtitle: 'Minden eltitkolt emlék és elveszett dal felhangzik az emberiség egén.',
    phases: [
      {
        title: '1. Fázis: Az Égbolt Hangolása',
        narrative: 'Nok-Tura 528 Hz-es harangja megkondul a pólus felett; a világ minden rádiója egy pillanatra tisztán hallja a kimondatlan neveket.',
        promptLabel: 'Add át a közös emlékezet hullámát!',
        actionLabel: 'Hullám Szétküldése',
        frequencyHz: 528,
        visualMode: 'convergence',
      },
      {
        title: '2. Fázis: Közös Álom',
        narrative: 'Mira Kódvárosának tornyai áttetsző fényként jelennek meg minden alvó ember álmában — a magány véget ért.',
        promptLabel: 'Lépj be a Megosztott Korba!',
        actionLabel: 'Új Kor Üdvözlése',
        frequencyHz: 639,
        visualMode: 'portal',
      },
    ],
    completionText: 'A Spirál lehelete közös emberi otthonná tágult.',
    rewardResonance: 60,
  },
  cin_ending_new_world: {
    id: 'cin_ending_new_world',
    title: 'Befejezés · Új Világ — Együttélés',
    chapterLabel: '3. Út · Szabad Alkotás',
    subtitle: 'Sem uralkodás, sem félelem: az idő és a jég többé nem börtön, hanem közös alap.',
    phases: [
      {
        title: '1. Fázis: Az Új Tengely',
        narrative: 'Kor-Vatha csillagvektora és Sen-Maria vörös parazsa új horizontot olvaszt a pólus köré.',
        promptLabel: 'Állítsd be az együttélés első koordinátáját!',
        actionLabel: 'Horizont Kinyitása',
        frequencyHz: 432,
        visualMode: 'gravity',
      },
      {
        title: '2. Fázis: Az Első Reggel',
        narrative: 'Viktor, Lena, Mira és Levente egymás mellett nézik a két világ határát — nem tökéletes, de élő.',
        promptLabel: 'Indítsd el az Első Napot!',
        actionLabel: 'Új Világ Megkezdése',
        frequencyHz: 741,
        visualMode: 'portal',
      },
    ],
    completionText: 'Az Új Világ nyitott maradt minden jövőbeli történetre.',
    rewardResonance: 70,
  },
  cin_ending_covenant: {
    id: 'cin_ending_covenant',
    title: 'Befejezés · A Tiszta Csend Szövetsége',
    chapterLabel: '4. Út · A Múlt Békés Elengedése',
    subtitle: 'Sem bezárt börtön, sem kényszerített emlékezet: az 1959-es és 1982-es nevek békében pihennek meg.',
    phases: [
      {
        title: '1. Fázis: A Fekete Hó Irgalma',
        narrative:
          'Ir-Haya fekete hamuja és Sen-Maria parazsa egyszerre öleli át az obeliszket: a régi vészjelzések nem törlődnek ki erőszakkal, hanem megkapják a jogot a csendhez.',
        promptLabel: 'Engedd el a múlt visszahúzó terhét!',
        actionLabel: 'Békés Elengedés',
        frequencyHz: 396,
        visualMode: 'wave',
      },
      {
        title: '2. Fázis: Szabad Holnap',
        narrative:
          'A 82.0 és 142.8 MHz elhalkul, de egyetlen emberi kapcsolat sem szakad el: Viktor, Lena, Mira és Levente tiszta lappal lépnek ki a hóviharból.',
        promptLabel: 'Pecsételd meg a Tiszta Csend Szövetségét!',
        actionLabel: 'Szövetség Rögzítése',
        frequencyHz: 528,
        visualMode: 'portal',
      },
    ],
    completionText: 'A múlt békére lelt; a jelen többé nem a régi sebek visszhangja.',
    rewardResonance: 65,
  },
  cin_ending_meta_room: {
    id: 'cin_ending_meta_room',
    title: 'Titkos Befejezés · A Nyitott Ablakú Szoba',
    chapterLabel: '5. Titkos Út · OBSERVER_0 Ébredése',
    subtitle: 'A negyedik fal áttetszővé válik: minden gyűjtött nyom és kilenc Visszhang ugyanarra a székre mutat.',
    phases: [
      {
        title: '1. Fázis: A Negyedik Fal Feloldódása',
        narrative:
          'A képernyő sarki fagyán átsüt egy tavaszi ablak meleg fénye. Az Antarktisz, Kódváros és Budapest koordinátái mögött feltárul a csendes faasztal.',
        promptLabel: 'Lépj át az ablakon túli küszöbön!',
        actionLabel: 'Küszöb Átlépése',
        frequencyHz: 639,
        visualMode: 'convergence',
      },
      {
        title: '2. Fázis: A Papírra Írt Szó',
        narrative:
          'Mind a négy főszereplő és A Végtelen hátralép egyet a csendben — az üres lapon egyetlen kézírásos kérdés jelenik meg: „Talán te.”',
        promptLabel: 'Fogadd el a Szerzői Szoba tanúságát!',
        actionLabel: 'Könyv Megérintése',
        frequencyHz: 741,
        visualMode: 'portal',
      },
    ],
    completionText: 'A Nyitott Ablakú Szoba megnyílt — a történet most már a te kezedben folytatódik.',
    rewardResonance: 90,
  },
};

// =========================================================================
// 6. DETERMINISTIC EVALUATION HELPERS (COUNCIL + META-ENDING ELIGIBILITY)
// =========================================================================
export const evaluateGuardianCouncil = (
  spiralState: SpiralState,
  guardianProgress: Record<number, GuardianProgress>
): GuardianCouncilEvaluation[] => {
  const chosen = new Set(Object.values(spiralState.choiceHistory));
  const echoSet = new Set(spiralState.worldState.collectedNineEchoIds);

  const buildEval = (
    guardianId: number,
    defaultReason: string,
    secretRevelation: string,
    specialConditions: {
      allyCheck: boolean;
      allyReason: string;
      challengerCheck: boolean;
      challengerReason: string;
      sacrificeCheck?: boolean;
      sacrificeReason?: string;
    }
  ): GuardianCouncilEvaluation => {
    const pg = guardianProgress[guardianId];
    const trust = pg?.trustLevel || 0;
    const echoHas = echoSet.has(`echo_core_${guardianId}`);
    const trustBonus = (pg?.realmCompleted ? 1 : 0) + (echoHas ? 1 : 0);
    const totalTrust = trust + trustBonus;

    if (specialConditions.sacrificeCheck) {
      return {
        guardianId,
        stance: 'sacrifice',
        stanceLabel: 'Áldozatot Hozó Szövetséges',
        reasonText: specialConditions.sacrificeReason || defaultReason,
        secretRevelation,
        trustScore: totalTrust,
      };
    }
    if (specialConditions.allyCheck || totalTrust >= 2) {
      return {
        guardianId,
        stance: 'ally',
        stanceLabel: 'Melléd Áll',
        reasonText: specialConditions.allyCheck ? specialConditions.allyReason : defaultReason,
        secretRevelation: echoHas ? secretRevelation : undefined,
        trustScore: totalTrust,
      };
    }
    if (specialConditions.challengerCheck || trust < 0) {
      return {
        guardianId,
        stance: 'challenger',
        stanceLabel: 'Megkérdőjelez',
        reasonText: specialConditions.challengerCheck ? specialConditions.challengerReason : defaultReason,
        trustScore: totalTrust,
      };
    }
    return {
      guardianId,
      stance: 'neutral',
      stanceLabel: 'Csendes Tanú',
      reasonText: defaultReason,
      secretRevelation: echoHas ? secretRevelation : undefined,
      trustScore: totalTrust,
    };
  };

  return [
    buildEval(
      1,
      'Kassarah figyeli, mennyit tudtál megőrizni az 1959-es és 1982-es nevek közül.',
      'Kassarah megnyitja a legbelső fagykamrát: Viktor első 20 perces ájulása alatt ő őrizte meg a csapat hangját.',
      {
        allyCheck:
          chosen.has('trial_r1_raw_truth') ||
          chosen.has('trial_r1_mercy_wave') ||
          chosen.has('c_k1_r1_preserve_names'),
        allyReason: 'Megtartottad a jégbe fagyott nevek méltóságát — Kassarah kék pajzsot von köréd.',
        challengerCheck: chosen.has('trial_r1_release_weight') && spiralState.personality.preserver < 3,
        challengerReason: 'Elengedted a fájdalmas múltat az Óceánban; Kassarah fél, hogy nélküle elfeleded az áldozatot.',
      }
    ),
    buildEval(
      2,
      'Ir-Haya csendben mérlegeli, képes vagy-e elengedni a felesleges terheket.',
      'Ir-Haya bevallja: 1959-ben maga segített elrejteni az ötödik kutató nevét, hogy a fagy ne terjedjen tovább.',
      {
        allyCheck: chosen.has('c_k1_r2_silence_static') || chosen.has('c_m1_prune_dead_lines'),
        allyReason: 'Tiszteletben tartottad a csendet és a halott ágak lezárását — Ir-Haya elengedi a rémálmok súlyát.',
        challengerCheck: chosen.has('c_fin_viktor_anchor_love') && !echoSet.has('echo_core_2'),
        challengerReason: 'Mindenhez ragaszkodsz — Ir-Haya figyelmeztet, hogy az elengedés hiánya megfojtja a jövőt.',
        sacrificeCheck:
          echoSet.has('echo_core_2') &&
          (chosen.has('trial_r2_accept_mercy') || chosen.has('c_l1_conceal_past')),
        sacrificeReason:
          'Ir-Haya önként feláldozza saját csendjének egy darabját, elnyelve az 1982-es bázis utolsó fájdalmas visszhangját.',
      }
    ),
    buildEval(
      3,
      'Thal-Muren az 1959–1982–1989 tengelyek feszültségét ellenőrzi.',
      'Thal-Muren felfedi az óratorony negyedik mutatóját: az idő nem tőled szaladt el, hanem rád várt.',
      {
        allyCheck: chosen.has('trial_r3_accept_loop') || chosen.has('trial_r3_leave_unfinished'),
        allyReason: 'Megértetted a fordított okságot — Thal-Muren kiegyenesíti a három évtized óramutatóit.',
        challengerCheck: chosen.has('trial_r3_fracture_future') && spiralState.timeStability < 60,
        challengerReason: 'Szétválasztottad a korszakokat: Thal-Muren kétli, hogy a törött híd kibírja-e a Végtelent.',
      }
    ),
    buildEval(
      4,
      'Az-Zahir a saját ellentmondásaid tükörképeit tartja eléd.',
      'Az-Zahir megmutatja a Másik Mira búcsúját: a Δ–T0 ág az önfeláldozásával védte meg Kódvárost.',
      {
        allyCheck: chosen.has('trial_r4_flawed_human') || chosen.has('trial_r4_integrate_both') || chosen.has('c_m1_question_double'),
        allyReason: 'Merészelted kérdezni a saját tükörképedet — Az-Zahir üvegfala tiszta kapuvá válik.',
        challengerCheck: chosen.has('trial_r4_shatter_glass'),
        challengerReason: 'Összetörted a tükröket a IV. birodalomban; Az-Zahir most keményen kéri számon, bízol-e egyáltalán önmagadban.',
      }
    ),
    buildEval(
      5,
      'Nok-Tura a 142.8 MHz és a 0 Hz csend arányát hallgatja.',
      'Nok-Tura visszajátssza Lena 1979-es kazettájának rejtett 14 másodpercét a Tanácsnak.',
      {
        allyCheck:
          chosen.has('c_l1_send_truth_signal') ||
          chosen.has('trial_r5_pure_silence') ||
          chosen.has('trial_r5_living_chord'),
        allyReason: 'Megőrizted a hang igazságát és a csend tiszteletét — Nok-Tura arany orgonahangja támogat.',
        challengerCheck: chosen.has('c_l1_alter_broadcast'),
        challengerReason: 'Lena adásának módosítása eltorzította a régi katedrális akkordját — Nok-Tura szigorú próba elé állít.',
      }
    ),
    buildEval(
      6,
      'Var-Elis a Budapest–Antarktisz közötti 58 BPM-es idegterhelést méri.',
      'Var-Elis leleplezi az OBSERVER_0 ötödik kábelét: mindig is a te olvasói/játékosi jelenléted számára volt fenntartva.',
      {
        allyCheck: chosen.has('c_lev1_claim_free_will') || chosen.has('trial_r6_share_load'),
        allyReason: 'Megszüntetted a kényszert és szabad akaratra hangoltad Leventét — Var-Elis áramköre tisztán ragyog.',
        challengerCheck: chosen.has('trial_r6_isolate_observer_bus'),
        challengerReason: 'Leválasztottad az ötödik vezetéket: Var-Elis megkérdezi, készen állsz-e teljesen egyedül dönteni.',
        sacrificeCheck: chosen.has('trial_r6_share_load') && echoSet.has('echo_core_6'),
        sacrificeReason:
          'Var-Elis leállítja saját önfenntartó reaktorát, átadva minden tartalék energiáját Levente és Viktor élő visszatérésének.',
      }
    ),
    buildEval(
      7,
      'Kor-Vatha a lehetséges nézőpontok elforgatását vizsgálja.',
      'Kor-Vatha kirajzolja az égi tengely végső egyenesét Budapest és a 82°16’S között.',
      {
        allyCheck:
          chosen.has('trial_r7_invert_axis') ||
          chosen.has('c_k1_r3_invert_crown') ||
          spiralState.realityWarp.gravityInverted,
        allyReason: 'Hajlandó voltál fejre állítani a világképedet — Kor-Vatha hidat képez a mélység fölé.',
        challengerCheck: chosen.has('trial_r7_anchor_horizon'),
        challengerReason: 'Ragaszkodtál a régi horizonthoz; Kor-Vatha kétli, hogy átlátsz-e a Végtelen nézőpontján.',
      }
    ),
    buildEval(
      8,
      'Sen-Maria őrzi az emberi melegséget a kilenc gyökér közepén.',
      'Sen-Maria felmutatja a nyitott ablak alól befújt földi tölgyfalevelet — az egyetlen élő hidat a külső világba.',
      {
        allyCheck:
          chosen.has('trial_r8_share_warmth') ||
          chosen.has('trial_r8_plant_new_seed') ||
          chosen.has('c_fin_viktor_sacrifice_memory'),
        allyReason: 'A hideg közepén is az emberi melegséget választottad — Sen-Maria parazsa melegíti a csapatot.',
        challengerCheck: spiralState.memoryIntegrity < 45,
        challengerReason: 'Sok emléktörés árán jutottál el idáig; Sen-Maria félti a szív épségét.',
      }
    ),
    buildEval(
      9,
      'A Kilencedik figyeli az utolsó üres lap és a kilenc Visszhang összhangját.',
      'A Kilencedik végre kimondja: az üres talapzat sosem trón volt, hanem az ajtó visszafelé — a Nyitott Ablakú Szobába.',
      {
        allyCheck: spiralState.worldState.chamberBeyondNinthCompleted && echoSet.size >= 9,
        allyReason: 'Egyesítetted mind a 9 Visszhangot a Kamrában — A Kilencedik egyenrangú társként fogad.',
        challengerCheck: echoSet.size < 4,
        challengerReason: 'Még kevés birodalom visszhangját hallgattad meg — A Kilencedik szerint az ítéleted még nem teljes.',
      }
    ),
  ];
};

export interface MetaEndingEligibility {
  eligible: boolean;
  checks: {
    id: string;
    label: string;
    passed: boolean;
    detail: string;
  }[];
}

export const evaluateMetaEndingEligibility = (
  spiralState: SpiralState,
  evidence: EvidenceItem[],
  secrets: SecretDiscovery[]
): MetaEndingEligibility => {
  const analyzedOrUnlockedEv = evidence.filter((e) => e.isUnlocked).length;
  const hasAuthorPage = evidence.some((e) => e.id === 'ev_author_page' && e.isUnlocked);
  const unlockedSecretsCount = secrets.filter((s) => s.isUnlocked).length;
  const observerCount = spiralState.worldState.collectedObserverClueIds.length;
  const chamberDone = Boolean(spiralState.worldState.chamberBeyondNinthCompleted);
  const trialsDone = spiralState.worldState.finalTrialsSolved.length;
  const councilDone = Boolean(spiralState.worldState.guardianCouncilVerdictDone);

  const checks = [
    {
      id: 'meta_chk_chamber',
      label: '9/9 Visszhang & A Kilencediken Túli Kamra (7 szakasz)',
      passed: chamberDone && spiralState.worldState.collectedNineEchoIds.length >= 9,
      detail: `${spiralState.worldState.collectedNineEchoIds.length}/9 Visszhang · Kamra: ${chamberDone ? 'Teljesítve' : 'Hátravan'}`,
    },
    {
      id: 'meta_chk_trials',
      label: 'Végső Próbák & Tanács (legalább 3/4 Végső Próba + Tanácskozás)',
      passed: trialsDone >= 3 && councilDone,
      detail: `${trialsDone}/4 Végső Próba · Tanács: ${councilDone ? 'Kész' : 'Hátravan'}`,
    },
    {
      id: 'meta_chk_evidence',
      label: 'ARCHÍV-82 Mélynyomozás (≥ 14 bizonyíték + „Talán te” szerzői lap)',
      passed: analyzedOrUnlockedEv >= 14 && hasAuthorPage,
      detail: `${analyzedOrUnlockedEv} bizonyíték · Szerzői lap: ${hasAuthorPage ? 'Megvan' : 'Hiányzik (Őrzők Tanácsa hotspot)'}`,
    },
    {
      id: 'meta_chk_observer',
      label: 'Titkok & Megfigyelő (≥ 5 titok VAGY ≥ 4 Megfigyelő-anomália)',
      passed: unlockedSecretsCount >= 5 || observerCount >= 4 || spiralState.worldState.observerConvergenceTriggered,
      detail: `${unlockedSecretsCount} titok · ${observerCount}/9 Megfigyelő-nyom`,
    },
  ];

  return {
    eligible: checks.every((c) => c.passed),
    checks,
  };
};
