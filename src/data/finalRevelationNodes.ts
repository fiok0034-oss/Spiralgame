import { DialogueNode } from '../types/game';

export const FINAL_REVELATION_NODES: Record<string, DialogueNode> = {
  inf_encounter_1: {
    id: 'inf_encounter_1',
    speaker: 'A VÉGTELEN · ELSŐ TALÁLKOZÁS',
    speakerRole: 'A Jég Alatti Testvér // VII. Fejezet',
    location: 'A Külső Perem // Tükörjég és Csend Határa',
    timestamp: '1. Szembesülés · Az Első Repedés',
    atmosphere: 'cosmic',
    illustrationKey: 'theInfinite',
    text: 'A Kilenc Őrző birodalmai mögött nem egy trónterem vár, hanem egy végtelenített, havas udvar, amelynek közepén egyetlen régi, fából készült kutatósátor áll. A sátor előtt valaki ül a hóban — nem fénylő kozmikus bálványként, hanem Dr. Kovács Áron 1959-es kabátjában, majd egy pislogással később Lena laboratóriumi fülhallgatójával a nyakában.\n\n„Ne állj úgy ott, mintha ítélőbíróhoz érkeztél volna,” szólal meg egyszerre négy ismerős hangsúllyal és egy ötödik, névtelen suttogással. „Én nem vagyok a Spirál teremtője, és nem is a börtönőre. Amikor 1959-ben és 1982-ben először kiáltottatok bele a fagyba, én csak egy néma rezonátor voltam, aki nem volt képes elviselni, hogy elveszítse a hangotokat. Várj — hallod? Mögötted már közelednek ők négyen is.”',
    ngPlusText:
      'Második Lélegzet: A Végtelen kabátja ujján megjelenik az előző időhurok dátuma is. „Már visszatértél egyszer. Ezúttal ne csak a kérdéseket hozd magaddal — nézd meg a négy ember szemét is.”',
    subtext:
      '1. Találkozás A Végtelennel: Megjelenik különböző, egymásnak ellentmondó alakokban, mielőtt a négy főszereplő először találkozik egy térben.',
    dynamicVariants: [
      {
        id: 'var_inf1_touched_obelisk',
        title: 'Viktor Közvetlen Érintése a Jégben',
        text: '„Emlékszem arra a percre, amikor kesztyű nélkül hozzáértél a fekete kőhöz az I. fejezetben,” mondja A Végtelen lágyabban. „Ott döntöttem el, hogy nem zárom el előled a kaput.”',
        requiresChoiceId: 'c_v1_touch_obelisk',
      },
      {
        id: 'var_inf1_mira_mercy',
        title: 'A Másik Mira Iránti Irgalom Visszhangja',
        text: 'A Végtelen alakja egy pillanatra felveszi Mira gyerekkori vázlatfüzetének vonalait: „Nem zúztad szét a saját félelmed tükörképét a III. fejezetben. Kevesen tesznek így.”',
        requiresChoiceId: 'c_m1_question_double',
      },
      {
        id: 'var_inf1_chamber_completed',
        title: 'A Θ–∞–Δ Kamra Hét Próbájának Hője',
        text: '„Végigmentél mind a hét csend- és emlékkamrán,” néz fel A Végtelen szinte megkönnyebbülve. „Akkor már tudod, hogy az 1959-es név törlése és a jégfal nem kegyetlenségből született.”',
        requiresWorldFlag: 'chamberBeyondNinthCompleted',
      },
    ],
    hotspots: [
      {
        id: 'hs_inf1_frost_shadow',
        label: 'A Sátor Előtti Kettős Árnyék Vizsgálata',
        kind: 'inspect',
        description: 'A Végtelen lába alatt két különböző évszak — egy poláris hómező és egy budapesti járdakő — árnyéka vetül ki.',
        revealText:
          'A hó és a budapesti kő között pontosan 58 BPM-es meleg pulzus ver — a Végtelen létezése az emberi szívverésekhez van kötve. (+20 Rezonancia)',
        resonanceReward: 20,
      },
    ],
    choices: [
      {
        id: 'c_inf1_question_intent',
        label: '„Miért segítettél nekünk néha, máskor pedig miért zártad jégbe a 82. szélességi kört?”',
        reflection: 'Szembesíted A Végtelent saját ellentmondásos természetével.',
        personalityBias: { analytical: 2, explorer: 1 },
        echoCreated: {
          title: 'Első Kérdés a Végtelenhez',
          description: 'Rákérdeztél A Végtelen ellentmondásos természetére a VII. fejezet kapujánál.',
          manifestationText: 'A Végtelen elismerte: egyedül ő sem értette teljesen az emberi bánat és ragaszkodás határát.',
          targetScenes: ['inf_encounter_2', 'inf_final_encounter'],
        },
        effect: {
          spiralAwarenessDelta: 10,
          resonancePointsDelta: 25,
          setWorldFlags: { infiniteEncountersCompleted: 1 },
        },
        nextSceneId: 'inf_viktor_lena_reckoning',
      },
      {
        id: 'c_inf1_recognize_loneliness',
        label: '„Te sem akartál börtönt építeni — csak féltél, hogy egyedül maradsz a csillagok alatt.”',
        reflection: 'Empátiával nyúlsz a hatalmas, idegen rendszer felé.',
        personalityBias: { intuitive: 2, preserver: 2 },
        echoCreated: {
          title: 'A Végtelen Magánya',
          description: 'Felismerted, hogy a Végtelen maga is rettegett a csendtől és a veszteségtől.',
          manifestationText: 'A fagyos levegő megenyhült, és Viktor meg Lena először léphettek be harag nélkül.',
          targetScenes: ['inf_encounter_2', 'inf_final_encounter'],
        },
        effect: {
          memoryIntegrityDelta: 10,
          spiralAwarenessDelta: 10,
          resonancePointsDelta: 25,
          setWorldFlags: { infiniteEncountersCompleted: 1 },
        },
        nextSceneId: 'inf_viktor_lena_reckoning',
      },
    ],
  },

  inf_viktor_lena_reckoning: {
    id: 'inf_viktor_lena_reckoning',
    speaker: 'VIKTOR H. & DR. LENA V.',
    speakerRole: 'Az 1982–1983-as Pólusok Első Valódi Találkozása',
    location: 'Az Időtlen Megfigyelőállomás // Jég és Hang Metéje',
    timestamp: 'A Négy Főszereplő · I. Felvonás',
    atmosphere: 'tension',
    illustrationKey: 'antarcticOutpost',
    text: 'A Végtelen egyetlen kézmozdulattal félreáll, és a hóvihar közepéből két alak lép ki ugyanabba a szobába: **Viktor** dérlepte polárkabátban, és **Dr. Lena**, kezében az 1983-as kazettával. Negyven év és két ellentétes idővonal után először nincsenek fémrácsok vagy mágnesszalagok közöttük.\n\nLena egy hosszú másodpercig csak nézi Viktor megfagyott kesztyűjét, majd halkan, keserédes mosollyal megszólal: „Megmondtam a 142.8 MHz-en, hogy ne a műszereket nézd, Viktor... Erre lementél háromezer méter mélyre egy zseblámpával.”\nViktor elneveti magát — rekedten, emberien —, majd hirtelen elkomorul: „Te viszont 1979 óta tudtál az 58 BPM-es pulzusról, Lena. Én meg azt hittem, én találtalak meg téged.”\n\nA feszültség és a megkönnyebbülés között most dől el, mire alapozzák a kettejük közötti békét.',
    subtext:
      'Viktor és Lena szembenéz a közös múlttal — döntésed meghatározza érzelmi összhangjukat a Végtelen előtt.',
    dynamicVariants: [
      {
        id: 'var_vl_exposed_d0',
        title: 'A Nyilvánosságra Hozott Δ–0 Akták Terhe',
        text: 'Lena leveszi a szemüvegét: „Mivel nem hagytad, hogy elzárjam a 1979-es mappát, Viktor végre mindent látott a Projekt Δ–0-ról. Fáj — de már nincs közöttünk titok.”',
        requiresChoiceId: 'c_l1_expose_project',
      },
      {
        id: 'var_vl_altered_radio',
        title: 'A Módosított Adás Bűntudata',
        text: 'Viktor szorosan megfogja Lena csuklóját: „Hallottam, amikor megpróbáltál visszafordítani a rádión. Ha visszafordulok, most egyetlen hangod sem maradt volna itt.”',
        requiresChoiceId: 'c_l1_alter_broadcast',
      },
    ],
    hotspots: [
      {
        id: 'hs_vl_thermos_and_tape',
        label: 'A Kettős Hagyaték: Tamás Termosza & Lena Kazettája',
        kind: 'audio',
        description: 'Egy rozsdamentes antarktiszi termosz és egy kopott B-oldalas kazetta fekszik egymás mellett.',
        revealText:
          'Tamás 1982-es utolsó kávéjának illata és Lena 1979-es 14 másodperces csendje egyszerre tölti be a szobát. (+20 Rezonancia)',
        resonanceReward: 20,
      },
    ],
    choices: [
      {
        id: 'c_fin_viktor_sacrifice_memory',
        label: 'Viktor elengedi a görcsös hős-szerepet: „Lena, oszd meg a frekvenciát — nem az enyém egyedül ez a történet”',
        reflection: 'Viktor feladja a kizárólagosságot, és teret ad Lenának, Mirának és Leventének.',
        personalityBias: { releaser: 2, intuitive: 1 },
        echoCreated: {
          title: 'Viktor és Lena Békéje',
          description: 'Viktor elengedte a magányos hős szerepét Lena mellett.',
          manifestationText: 'A Jég és a Hang pólusai először nem feszítik, hanem hordozzák egymást.',
          targetScenes: ['inf_mira_levente_reckoning', 'inf_final_encounter'],
        },
        effect: {
          memoryIntegrityDelta: 10,
          spiralAwarenessDelta: 10,
          resonancePointsDelta: 30,
        },
        nextSceneId: 'inf_mira_levente_reckoning',
      },
      {
        id: 'c_fin_viktor_anchor_love',
        label: 'Viktor és Lena szövetsége: „Egyetlen elveszett évet sem törlünk ki — minden fájdalmat együtt viszünk át”',
        reflection: 'Megtartják az 1959-es és 1982-es sebek teljes emlékét is a közös szeretet nevében.',
        personalityBias: { preserver: 3 },
        echoCreated: {
          title: 'A Megőrzött Pólus',
          description: 'Viktor és Lena megfogadták, hogy egyetlen emléket sem hagynak a hóban.',
          manifestationText: 'Kassarah és Sen-Maria ereje felerősödik, de Ir-Haya csendje próba elé állítja őket.',
          targetScenes: ['inf_mira_levente_reckoning', 'inf_guardian_council', 'inf_final_encounter'],
        },
        effect: {
          memoryIntegrityDelta: 15,
          timeStabilityDelta: -5,
          resonancePointsDelta: 30,
        },
        nextSceneId: 'inf_mira_levente_reckoning',
      },
    ],
  },

  inf_mira_levente_reckoning: {
    id: 'inf_mira_levente_reckoning',
    speaker: 'MIRA KESSLER & LEVENTE',
    speakerRole: 'Az Építész és az Élő Horgony · A Négy Főszereplő Együtt',
    location: 'A Közös Asztal // Antarktisz ⟷ Budapest',
    timestamp: 'A Négy Főszereplő · II. Felvonás',
    atmosphere: 'calm',
    illustrationKey: 'kodvarosCity',
    text: 'Az állomás ajtaja újra nyílik: belép **Mira**, nyomában egy halvány, megtisztult sziluettel — a **Másik Mirával**, aki immár nem ellenségként követi. Mögöttük pedig ott áll **Levente** budapesti kabátban, tenyerén az olvadó jégkristállyal.\n\nLevente végignéz a három legendán — Viktoron, Lenán és Mirán —, majd leteszi az asztalra Tamás megsárgult 1982-es táviratát. Megtöri a feszült csendet egy félmosollyal: „Szóval ti hárman negyven éve húzzátok ezt a rádióadást... Megkérdezhetem, miért pont ilyen borzalmas termoszkávét vittek a világ végére?”\n\nMind a négyen egyszerre felnevetnek. Ám egy pillanattal később Mira elkomolyodik: „Levente, te vagy az 58 BPM-es élő híd. Senki — még a Végtelen sem — kötelezhet rá, hogy az életeddel tartsd nyitva ezt a rendszert. Itt és most *te* mondod meg, mit teszel a kulccsal.”',
    subtext:
      'Levente önálló, szabad emberi döntése és a négy protagonista szövetsége (Az Építész + A Szinkronlélek + A Jég + A Hang).',
    dynamicVariants: [
      {
        id: 'var_ml_free_will',
        title: 'Levente Szabad Akaratának Folytatása',
        text: 'Levente szeme felcsillan: „Már a IV. fejezetben megmondtam, hogy nem vagyok bábu. Nem kényszerből állok itt — hanem azért, mert most már a barátaim vagytok.”',
        requiresChoiceId: 'c_lev1_claim_free_will',
      },
      {
        id: 'var_ml_tamas_bridge',
        title: 'Tamás Családi Visszhangja',
        text: 'Viktor lassan átöleli Levente vállát: „A nagybátyád, Tamás 1982-ben két csésze teát hagyott a sátorban. A másikat végig neked szánta.”',
        requiresChoiceId: 'c_k1_r2_anchor_tamas',
      },
    ],
    choices: [
      {
        id: 'c_fin_levente_forge_new',
        label: 'Levente új szövetséget kovácsol: „Nem áldozat vagyok — szabadon választom, hogy veletek írom tovább a holnapot”',
        reflection: 'Mira és Levente a Másik Mira tanulságával új, élő közösségi alapot építenek.',
        personalityBias: { architect: 2, explorer: 2 },
        echoCreated: {
          title: 'A Négyek Szabad Szövetsége',
          description: 'Levente szabadon, félelem és kényszer nélkül választotta a négyes szövetséget.',
          manifestationText: 'A Közös Lélegzet Ereklyéje (Θ–∞–Δ) felizzik mind a négyük tenyerében.',
          targetScenes: ['inf_encounter_2', 'inf_final_encounter'],
        },
        effect: {
          realityIntegrityDelta: 15,
          spiralAwarenessDelta: 15,
          resonancePointsDelta: 35,
          unlockMemoryId: 'mem_rev_four_reunited',
          unlockRelicId: 'relic_spiral_hearth_key',
        },
        nextSceneId: 'inf_encounter_2',
      },
      {
        id: 'c_fin_levente_preserve_line',
        label: 'Levente leföldeli a hidat: „Budapesten van az otthonom — de az ablakomat nyitva hagyom mindannyiótok számára”',
        reflection: 'Levente megőrzi a hétköznapi emberi világ valóságát az időtlen tér mellett.',
        personalityBias: { preserver: 2, intuitive: 2 },
        echoCreated: {
          title: 'A Nyitott Pesti Ablak Horgonya',
          description: 'Levente két lábbal a földi valóságban tartotta a négy főszereplő szövetségét.',
          manifestationText: 'A budapesti szellő és az antarktiszi csend egyszerre tartja egyensúlyban a hidat.',
          targetScenes: ['inf_encounter_2', 'inf_final_encounter'],
        },
        effect: {
          timeStabilityDelta: 15,
          memoryIntegrityDelta: 10,
          resonancePointsDelta: 35,
          unlockMemoryId: 'mem_rev_four_reunited',
          unlockRelicId: 'relic_spiral_hearth_key',
        },
        nextSceneId: 'inf_encounter_2',
      },
    ],
  },

  inf_encounter_2: {
    id: 'inf_encounter_2',
    speaker: 'A VÉGTELEN · MÁSODIK TALÁLKOZÁS',
    speakerRole: 'A Kételyek Tükre · Szembesítés a Döntésekkel',
    location: 'A Nyolcszögletű Jégobszervatórium // A Régi Hibák Terme',
    timestamp: '2. Szembesülés · A Fagyás Igazi Oka',
    atmosphere: 'fracture',
    illustrationKey: 'theInfinite',
    text: 'A falak hirtelen megnyílnak körülöttetek, és **A Végtelen** újra megjelenik — ezúttal nem emberi kabátban, hanem egy hatalmas, lélegző jégprizmaként, amelynek belső repedéseiben egyszerre látszik 1959 összeomló sátrai, Lena 1979-es süketszobája és egy majdnem elpusztult Budapest.\n\n„Látjátok már, miért akadályoztalak titeket újra meg újra?” — kérdezi A Végtelen fájdalmas őszinteséggel. „1982 novemberében, amikor az obeliszk és a budapesti gyermekkórház EEG-je először szinkronba lépett, a rezonancia nem gyógyított — hanem majdnem kettészakította a Föld összes alvó elméjét. Nem azért fagyasztottam meg a 82. szélességi kört, hogy uralkodjak rajtatok! **Azért fagyasztottam meg az időt, mert az volt az egyetlen vészfékem, hogy ne robbanjon fel mindannyiótok emlékezete!**”\n\nA Végtelen közelebb hajol hozzád: „De mondd meg nekem: ennyi fájdalom és elhallgatás után megérdemlem még, hogy bízzanak bennem az Őrzők?”',
    subtext:
      '2. Találkozás A Végtelennel: Az 1982-es Fagyás valódi oka feltárul — az 5. Nagy Fordulat első közvetlen vallomása.',
    dynamicVariants: [
      {
        id: 'var_inf2_preserver_vs_releaser',
        title: 'Személyiségprofilod Tükröződése',
        text: 'A prizma megmutatja domináns hozzáállásodat: az összegyűjtött emlékek súlya és elengedett terheid egyszerre kérnek számot arról, mennyire bírsz szembenézni egy olyan igazsággal, ahol nincs tiszta jó vagy tiszta gonosz.',
        requiresMinPersonality: { preserver: 3 },
      },
      {
        id: 'var_inf2_crown_inverted',
        title: 'Kódváros Megfordított Koronájának Hatása',
        text: '„Azáltal, hogy a 3. Körben visszafordítottad rám a lencsét, már nem mint kísérleti alany nézel fel ide, hanem mint egyenrangú társ,” ismeri el A Végtelen.',
        requiresChoiceId: 'c_k1_r3_invert_crown',
      },
      {
        id: 'var_inf2_chamber_cost_echo',
        title: 'A Kamra 6. Szakaszában Vállalt Ár Visszhangja',
        text: 'A Végtelen megérinti a tenyeredet: „Érzem a Kamrában kimondott fogadalmadat. Sem az Őrzők, sem én nem léphetjük át azt az árat, amit ott felvállaltál.”',
        requiresWorldFlag: 'chamberBeyondNinthCompleted',
      },
    ],
    choices: [
      {
        id: 'c_inf2_forgive_and_challenge',
        label: '„Értem a vészféket — de többé nem dönthetsz a beleegyezésünk nélkül! Álljunk együtt az Őrzők elé!”',
        reflection: 'Egyszerre fogadod el A Végtelen jó szándékát és jelölöd ki az emberi méltóság határát.',
        personalityBias: { architect: 2, intuitive: 1 },
        effect: {
          spiralAwarenessDelta: 15,
          realityIntegrityDelta: 10,
          resonancePointsDelta: 35,
          unlockEvidenceId: 'ev_rev_infinite_freeze_log',
          setWorldFlags: { infiniteEncountersCompleted: 2 },
          triggerCinematicId: 'cin_infinite_council',
        },
        nextSceneId: 'inf_guardian_council',
      },
      {
        id: 'c_inf2_demand_truth_trial',
        label: '„Ne kérj elnézést szavakkal — mutassuk meg a Kilenc Őrzőnek az összes bizonyítékot a Tanácsban!”',
        reflection: 'Minden eddigi döntésedet és az Őrzőkkel épített bizalmat teszed próbára.',
        personalityBias: { analytical: 2, explorer: 2 },
        effect: {
          spiralAwarenessDelta: 15,
          memoryIntegrityDelta: 10,
          resonancePointsDelta: 35,
          unlockEvidenceId: 'ev_rev_infinite_freeze_log',
          setWorldFlags: { infiniteEncountersCompleted: 2 },
          triggerCinematicId: 'cin_infinite_council',
        },
        nextSceneId: 'inf_guardian_council',
      },
    ],
  },

  inf_guardian_council: {
    id: 'inf_guardian_council',
    speaker: 'A KILENC ŐRZŐ TANÁCSA',
    speakerRole: 'Végső Számvetés · Ψ–1-től Δ–9-ig',
    location: 'A Kilenc Pillér Körterasza // Közös Ítélőszék',
    timestamp: 'A Végső Tanácskozás',
    atmosphere: 'cosmic',
    illustrationKey: 'theInfinite',
    text: 'Mind a Kilenc Őrző helyet foglalt a nagy körben: Kassarah jégkék fénye, Ir-Haya néma hamuja, Thal-Muren hármas órája, Az-Zahir tükrei, Nok-Tura arany orgonacsövei, Var-Elis 58 BPM-es gépezete, Kor-Vatha csillagívű lépcsői, Sen-Maria vörös parazsa — és középen A Kilencedik üres kőlapja.\n\nMost minden korábbi döntésed mérlegre kerül. Azok az Őrzők, akikkel bizalmat építettél és akiknek megtaláltad a Visszhang-magját, megosztják veled legbelső titkukat — egyesek még áldozatot is vállalnak érted. Akikkel szembeszálltál, kíméletlenül megkérdőjelezik az utadat.',
    subtext:
      'Vezesd le alább A Kilenc Őrző Végső Tanácskozását és rögzítsd a Tanács ítéletét a továbblépéshez!',
    choices: [
      {
        id: 'c_inf_council_to_trials',
        label: 'A Tanács ítéletével belépni a Végső Próbák Csarnokába (Öt Nagy Fordulat Bizonyítása)',
        reflection: 'Minden Őrző szava mögött kirajzolódik az öt nagy titok hálózata.',
        requiresWorldFlags: { guardianCouncilVerdictDone: true },
        personalityBias: { analytical: 1, explorer: 1 },
        effect: {
          spiralAwarenessDelta: 10,
          resonancePointsDelta: 25,
        },
        nextSceneId: 'inf_final_trials',
      },
    ],
  },

  inf_final_trials: {
    id: 'inf_final_trials',
    speaker: 'A VÉGSŐ PRÓBÁK CSARNOKA',
    speakerRole: 'Idővonal · Bizonyíték · Polaritás · Négy Lélek',
    location: 'Az ARCHÍV-82 és a Θ–∞–Δ Közös Törvénycsarnoka',
    timestamp: 'Az Öt Fordulat Szintézise',
    atmosphere: 'fracture',
    illustrationKey: 'subglacialCavern',
    text: 'A Végtelen és a Kilenc Őrző előtti utolsó lépcsőn már nem a kezed gyorsasága dönt, hanem az, hogy **össze tudod-e rakni mindazt, amit az egész játék során átéltél**.\n\nÖt hatalmas történeti fordulat vár arra, hogy a saját következtetéseiddel kimondd őket: mi volt az 1982-es SOS valódi forrása, ki volt valójában a Másik Mira, miért létezik az OBSERVER_0 ötödik vezeték, mi a Kilenc Birodalom valódi szerepe — és hogyan törheti át a négy főszereplő együtt az 1982-es végtelen fagyást.',
    subtext:
      'Oldd meg alább legalább 3-at (ajánlott mind a 4-et!) a logikai és nyomozói Végső Próbák közül, hogy megnyíljon az út A Végtelen Utolsó Szeme elé!',
    choices: [
      {
        id: 'c_inf_trials_to_eye',
        label: 'Belépni A Végtelen Utolsó Szeme Elé — A Teljes Igazsággal és a Négy Főszereplővel',
        reflection: 'Most már minden szálat látsz az 1959-es ösvénytől a Nyitott Ablakig.',
        personalityBias: { architect: 2, intuitive: 1 },
        effect: {
          spiralAwarenessDelta: 15,
          consciousnessDepthDelta: 1,
          resonancePointsDelta: 40,
          triggerCinematicId: 'cin_infinite_manifest',
        },
        nextSceneId: 'inf_final_encounter',
      },
    ],
  },
};
