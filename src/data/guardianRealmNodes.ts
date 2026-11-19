import { DialogueNode } from '../types/game';

export const GUARDIAN_REALM_STORY_NODES: Record<string, DialogueNode> = {
  g1_guardians_nexus: {
    id: 'g1_guardians_nexus',
    speaker: 'A KILENC BIRODALOM CSARNOKA',
    speakerRole: 'VI. Fejezet · Nem-lineáris Dimenzió-kapuk',
    location: 'Az Őrzők Központi Tengelye // Kilenc Világ',
    timestamp: 'Az Őrzők Órája',
    atmosphere: 'cosmic',
    illustrationKey: 'theInfinite',
    text: 'Kassarah és Ir-Haya tanácstermének falai szétnyílnak. Nem kilenc egyszerű szobor áll előtted, hanem kilenc teljes, élő birodalom nyíló kapuja — a folyékony Emlékek Óceánjától a Fordított Égen át egészen a Végtelen Küszöbéig.\n\nA középső pulton kilenc sötét foglalat izzik halkan: A Kilenc Visszhang (The Nine Echoes) helye. Minden birodalomban tett lépésed, megmentett emléked vagy feltárt titkod átformálhatja a többi világot is. Válassz szabadon útirányt, térj vissza a korábbi kapukhoz új képességekkel, és figyelj az apró, oda nem illő jelekre...',
    ngPlusText:
      'Második Lélegzet: Mind a kilenc kapu peremén apró arany fénypontok jelzik, hol hagyta ott a nyomát a Rejtett Megfigyelő az előző időkörből.',
    subtext:
      'Tipp: Használd az alábbi interaktív Birodalmi Felfedezőt a zónák bejárásához, vagy válassz közvetlen átlépést a kapukon!',
    dynamicVariants: [
      {
        id: 'var_nexus_all_echoes',
        title: 'Mind a Kilenc Visszhang Összeállt!',
        text: 'Mind a kilenc ősi rezonanciamag a központi pultba süllyedt. A kilencedik kapun túl megnyílt az eddig láthatatlan A KILENCEDIKEN TÚLI KAMRA!',
        requiresWorldFlag: 'chamberBeyondNinthUnlocked',
      },
      {
        id: 'var_nexus_observer_done',
        title: 'A Láthatatlan Figyelő Jelensége',
        text: 'Mind a kilenc birodalomból összegyűjtött apró ellentmondás összeért. Tudod már: az út kezdete óta valaki a másik oldalról nézte a választásaidat.',
        requiresWorldFlag: 'observerConvergenceTriggered',
      },
    ],
    choices: [
      {
        id: 'c_nexus_enter_r1',
        label: 'I. Birodalom: Kassarah — Az Emlékek Óceánja',
        reflection: 'Fagyott csarnokból nyíló folyékony emléktenger és elsüllyedt archívumváros.',
        nextSceneId: 'g1_realm_1',
      },
      {
        id: 'c_nexus_enter_r2',
        label: 'II. Birodalom: Ir-Haya — A Felejtés Sivataga',
        reflection: 'Fekete hamu-dűnék, átrendeződő labirintus és szándékosan eltemetett város.',
        nextSceneId: 'g1_realm_2',
      },
      {
        id: 'c_nexus_enter_r3',
        label: 'III. Birodalom: Thal-Muren — Az Időtörés Királysága',
        reflection: 'Megállt óratornyok, visszafelé folyó időfolyam és 1959/1982/Jövő paradoxon.',
        nextSceneId: 'g1_realm_3',
      },
      {
        id: 'c_nexus_enter_r4',
        label: 'IV. Birodalom: Az-Zahir — A Tükrök Dimenziója',
        reflection: 'Végtelen tükörfolyosók, Tükör-Kódváros és lehetséges éned árnyékai.',
        nextSceneId: 'g1_realm_4',
      },
      {
        id: 'c_nexus_enter_r5',
        label: 'V. Birodalom: Nok-Tura — A Csend Katedrálisa',
        reflection: 'Hangból épült boltívek, láthatatlan hidak és a Néma Harangtorony.',
        nextSceneId: 'g1_realm_5',
      },
      {
        id: 'c_nexus_enter_r6',
        label: 'VI. Birodalom: Var-Elis — A Lélek Gépezete',
        reflection: 'Biomechanikus tudathálózat Budapest és az Antarktisz között.',
        nextSceneId: 'g1_realm_6',
      },
      {
        id: 'c_nexus_enter_r7',
        label: 'VII. Birodalom: Kor-Vatha — A Fordított Ég',
        reflection: 'Csillagtérkép a lábad alatt, felfelé függő sziklák és gravitációs pályák.',
        nextSceneId: 'g1_realm_7',
      },
      {
        id: 'c_nexus_enter_r8',
        label: 'VIII. Birodalom: Sen-Maria — A Néma Kert',
        reflection: 'Meleg vörös porból növő emlékliget és a kilenc birodalmat összekötő gyökerek.',
        nextSceneId: 'g1_realm_8',
      },
      {
        id: 'c_nexus_enter_r9',
        label: 'IX. Birodalom: A Kilencedik — A Végtelen Küszöbe',
        reflection: 'Döntésekből formált lépcsők és a Kilenc Visszhang kapuja.',
        nextSceneId: 'g1_realm_9',
      },
      {
        id: 'c_nexus_chamber_beyond',
        label: '★ Titkos: Belépés A Kilencediken Túli Kamrába',
        reflection: 'Mind a 9 birodalmi Visszhang-mag egyesítése megnyitotta a rejtett kamrát.',
        requiresWorldFlags: { chamberBeyondNinthUnlocked: true },
        personalityBias: { explorer: 2, architect: 2 },
        effect: {
          resonancePointsDelta: 40,
          triggerCinematicId: 'cin_chamber_beyond_ninth',
        },
        nextSceneId: 'g1_chamber_beyond_ninth',
      },
      {
        id: 'c_nexus_to_infinite',
        label: 'Továbbhaladás A Végtelen Szeme Elé (Végső Fejezet)',
        reflection: 'Az eddig összegyűjtött visszhangokkal és próbákkal belépsz a Spirál Magjába.',
        nextSceneId: 'inf_final_encounter',
      },
    ],
  },

  g1_realm_1: {
    id: 'g1_realm_1',
    speaker: 'KASSARAH · I. BIRODALOM',
    speakerRole: 'A Döntések Emlékezője // Az Emlékek Óceánja',
    location: 'I. Birodalom · Az Emlékek Óceánja (Ψ–1)',
    timestamp: 'Időn Kívüli Mélység',
    atmosphere: 'calm',
    illustrationKey: 'subglacialCavern',
    text: 'Kassarah Csarnoka alatt határtalan, kék derengésű tenger terül el. A megdermedt hullámok belsejében elsüllyedt állomások és befagyott párbeszédek lebegnek. Ahogy a kristálypartra lépsz, megérzed: a víz nem sós, hanem sűrített emlékezet — és a mélyben valaki megpróbálta szépíteni Viktor és Lena közös történetét.',
    subtext: 'Járd be az óceán zónáit az interaktív térképen, oldd meg a szonár-rekonstrukciót, és szerezd meg a Kék Mélység Magját!',
    choices: [
      {
        id: 'c_r1_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        reflection: 'Más birodalmakat is felkereshetsz — a megszerzett visszhangok hatással lesznek rájuk.',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r1_to_r4_mirrors',
        label: 'Átlépés a IV. Birodalomba (Az-Zahir Tükrök Dimenziója)',
        reflection: 'Az Emlékek Óceánjának visszatükröződése közvetlenül Az-Zahir üvegfalaihoz vezet.',
        nextSceneId: 'g1_realm_4',
      },
    ],
  },

  g1_realm_2: {
    id: 'g1_realm_2',
    speaker: 'IR-HAYA · II. BIRODALOM',
    speakerRole: 'A Felejtés Őrzője // A Felejtés Sivataga',
    location: 'II. Birodalom · A Felejtés Sivataga (Ω–2)',
    timestamp: 'Eltörölt Óra',
    atmosphere: 'silence',
    illustrationKey: 'subglacialCavern',
    text: 'A fekete hó végtelen, ezüsthamus dűnékké szilárdult. A homokból ősi várostornyok csúcsai merednek ki, falai azonban folyamatosan átrendeződnek, mintha maga a táj menekülne az emlékezés elől. Ir-Haya árnyéka itt sokkal halkabb — és nyugtalanabb, mert rájött: ezt a birodalmat nem ő, hanem egy külső akarat radírozta le.',
    subtext: 'Kövesd a halványuló nyomokat a Homoklabirintusban, gyűjtsd be az 285 Hz-es szalagot és a Hamu-csend Magját!',
    choices: [
      {
        id: 'c_r2_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r2_to_r6_machine',
        label: 'Átlépés a VI. Birodalomba (Var-Elis Lélek Gépezete)',
        reflection: 'A hamuba temetett szalag nyomai a Gépezet vezetékei felé vezetnek.',
        nextSceneId: 'g1_realm_6',
      },
    ],
  },

  g1_realm_3: {
    id: 'g1_realm_3',
    speaker: 'THAL-MUREN · III. BIRODALOM',
    speakerRole: 'A Tükrözött Idő // Az Időtörés Királysága',
    location: 'III. Birodalom · Az Időtörés Királysága (Δ–3)',
    timestamp: '1959 ⟷ 1982 ⟷ Jövő',
    atmosphere: 'fracture',
    illustrationKey: 'theInfinite',
    text: 'Körülötted megállt óratornyok, felfelé zuhanó vízesések és egyetlen épületen belül egymásnak feszülő évtizedek tornyosulnak. Egy faasztal jobb oldala 1959-ben porlik, a közepe 1982-ben remeg, a tetején pedig egy még meg sem hozott döntésed fénye világít.',
    subtext: 'Rakd helyre a három időréteg fordított oksági kapcsolóját és szerezd meg a Krono-hurok Magját!',
    choices: [
      {
        id: 'c_r3_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r3_to_r2_desert',
        label: 'Visszalépés a II. Birodalomba (Ir-Haya Sivataga)',
        reflection: 'A helyreállított 1959-es óra megnyithatta a sivatag eltemetett kútját.',
        nextSceneId: 'g1_realm_2',
      },
    ],
  },

  g1_realm_4: {
    id: 'g1_realm_4',
    speaker: 'AZ-ZAHIR · IV. BIRODALOM',
    speakerRole: 'A Formátlan Tudat // A Tükrök Dimenziója',
    location: 'IV. Birodalom · A Tükrök Dimenziója (Σ–4)',
    timestamp: 'Párhuzamos Szimmetria',
    atmosphere: 'discovery',
    illustrationKey: 'kodvarosCity',
    text: 'Végtelen smaragdszínű tükörfolyosók nyílnak előtted. Az egyik üveglap mögött egy üres, kihalt Kódváros áll; a másikban egy másik Viktor sosem tért vissza a fagyból. Az-Zahir itt nem falakat épít, hanem a meg nem járt döntéseid tükörképeit feszíti egymásnak.',
    subtext: 'Irányítsd a fénysugarakat a Prizma-labirintusban, és nézz szembe a saját alternatív tükörképeddel!',
    choices: [
      {
        id: 'c_r4_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r4_to_r8_garden',
        label: 'Átlépés a VIII. Birodalomba (Sen-Maria Néma Kertje)',
        reflection: 'A tükörképek között megmaradt melegség a Néma Kert gyökereit táplálja.',
        nextSceneId: 'g1_realm_8',
      },
    ],
  },

  g1_realm_5: {
    id: 'g1_realm_5',
    speaker: 'NOK-TURA · V. BIRODALOM',
    speakerRole: 'A Hangok Alagútja // A Csend Katedrálisa',
    location: 'V. Birodalom · A Csend Katedrálisa (Φ–5)',
    timestamp: '528 Hz & 0 Hz',
    atmosphere: 'silence',
    illustrationKey: 'subglacialCavern',
    text: 'Monumentális, arany fénysípokból formált katedrális boltívei alatt állsz. A mély szakadékok fölött láthatatlan hidak lebegnek, amelyek csak tiszta rezgésre szilárdulnak meg — míg a központi Néma Harangtorony ajtaja csak a teljes csönd pillanatában enged tovább.',
    subtext: 'Hangold be az oszcillátorokat a csendkapu tiszteletével (hang nélkül is teljes vizuális visszajelzéssel)!',
    choices: [
      {
        id: 'c_r5_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r5_to_r7_sky',
        label: 'Átlépés a VII. Birodalomba (Kor-Vatha Fordított Ege)',
        reflection: 'A 528 Hz-es hanghullám átrezeg a fordított égbolt boltíveire.',
        nextSceneId: 'g1_realm_7',
      },
    ],
  },

  g1_realm_6: {
    id: 'g1_realm_6',
    speaker: 'VAR-ELIS · VI. BIRODALOM',
    speakerRole: 'A Szinkronlélek // A Lélek Gépezete',
    location: 'VI. Birodalom · A Lélek Gépezete (Π–6)',
    timestamp: '58 BPM · Élő Hálózat',
    atmosphere: 'tension',
    illustrationKey: 'antarcticOutpost',
    text: 'Óriási rézgömbök és fénylő szerves idegpályák lüktetnek körülötted 58 BPM-es szívverés ütemére. Ez a gépezet köti össze Budapestet az Antarktisz 3200 méteres mélyével — de a négy karakter pólusa mellett egy rejtélyes ötödik idegvonal is látható: OBSERVER_0.',
    subtext: 'Kapcsold össze a biomechanikus szinapszisokat túltöltés nélkül, és vizsgáld meg Var-Elis életbentartó hurkát!',
    choices: [
      {
        id: 'c_r6_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r6_to_r8_garden',
        label: 'Átlépés a VIII. Birodalomba (Sen-Maria Néma Kertje)',
        reflection: 'A szinkron-ideg melege egyenesen a kilenc birodalom gyökércsomópontjába fut.',
        nextSceneId: 'g1_realm_8',
      },
    ],
  },

  g1_realm_7: {
    id: 'g1_realm_7',
    speaker: 'KOR-VATHA · VII. BIRODALOM',
    speakerRole: 'A Mozgó Építészet // A Fordított Ég',
    location: 'VII. Birodalom · A Fordított Ég (Λ–7)',
    timestamp: '180°-os Tengelyfordulat',
    atmosphere: 'cosmic',
    illustrationKey: 'kodvarosCity',
    text: 'A lábad alatt nem szilárd föld van, hanem egy mérhetetlen csillagközi mélység, amelyben kilenc ismeretlen csillagkép forog lassan. A fejed felett sziklák és jéghegységek lógnak súlyos, fordított hegyláncokként. Kor-Vatha itt egyetlen kérdést tesz fel: mit látsz, ha megfordítod az iránytűdet?',
    subtext: 'Navigáld át a fénymagot a 4 irányú gravitációs pályatéren, és fedezd fel a mennyezeti csillagvizsgálót!',
    choices: [
      {
        id: 'c_r7_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r7_to_r9_threshold',
        label: 'Továbblépés a IX. Birodalomba (A Végtelen Küszöbe)',
        reflection: 'A csillagkoordináták kirajzolják a Kilencedik Küszöbének lépcsőit.',
        nextSceneId: 'g1_realm_9',
      },
    ],
  },

  g1_realm_8: {
    id: 'g1_realm_8',
    speaker: 'SEN-MARIA · VIII. BIRODALOM',
    speakerRole: 'A Vörös Porszoba // A Néma Kert',
    location: 'VIII. Birodalom · A Néma Kert (Θ–8)',
    timestamp: '36,6 °C · Örök Parázs',
    atmosphere: 'calm',
    illustrationKey: 'subglacialCavern',
    text: 'A hosszú fagy után hirtelen meleg, vörös-arany levegő ölel körül. Biolumineszcens fák ligete nyílik előtted, amelyek törzsében emberi emlékek melegsége lüktet. A talaj alatt kilenc hatalmas gyökér fut szét — és a fák közt egy valódi földi tölgyfalevél pihen a vörös poron.',
    subtext: 'Kösd össze a kilenc gyökér biológiai ritmusát, és szerezd meg az Élő Melegség Magját!',
    choices: [
      {
        id: 'c_r8_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r8_to_r1_ocean',
        label: 'Visszatérés az I. Birodalomba (Kassarah Óceánja)',
        reflection: 'A kertből hozott élő melegség felolvaszthatja az óceán hamisított öblét.',
        nextSceneId: 'g1_realm_1',
      },
    ],
  },

  g1_realm_9: {
    id: 'g1_realm_9',
    speaker: 'A KILENCEDIK · IX. BIRODALOM',
    speakerRole: 'A Nyitott Ablakú Küszöb // A Végtelen Küszöbe',
    location: 'IX. Birodalom · A Végtelen Küszöbe (Δ–9)',
    timestamp: 'A Mindenség Előtere',
    atmosphere: 'cosmic',
    illustrationKey: 'theInfinite',
    text: 'Csillagokból és megdermedt döntéseidből épült lépcsősor vezet felfelé nyolc ragyogó obeliszkhez — és egy kilencedik, teljesen üres, fehér kőlaphoz. Minden lépcsőfokon visszacseng Viktor bátorsága, Lena keresése, Mira kérdése és Levente kulcsa. És ha mind a kilenc Visszhang-magot összegyűjtötted, a kilencedik talapzat mögött feltárul az út a Kilencediken Túli Kamrába.',
    subtext: 'Teljesítsd a Kilenc Birodalom Mátrixát, nézz szembe a Kilencedik próbájával, vagy egyesítsd a Kilenc Visszhangot!',
    choices: [
      {
        id: 'c_r9_open_chamber',
        label: '★ Belépés A Kilencediken Túli Kamrába (Mind a 9 Visszhang Egyesítve)',
        reflection: 'A kilenc rezonanciamag kinyitotta az eddig rejtett ajtót a kilencedik talapzat mögött.',
        requiresWorldFlags: { chamberBeyondNinthUnlocked: true },
        personalityBias: { explorer: 2, architect: 2 },
        effect: {
          resonancePointsDelta: 50,
          triggerCinematicId: 'cin_chamber_beyond_ninth',
        },
        nextSceneId: 'g1_chamber_beyond_ninth',
      },
      {
        id: 'c_r9_back_nexus',
        label: 'Visszatérés A Kilenc Birodalom Csarnokába',
        nextSceneId: 'g1_guardians_nexus',
      },
      {
        id: 'c_r9_to_infinite',
        label: 'Továbblépés A Végtelen Elé (VII. Fejezet)',
        reflection: 'Átlépsz a Végtelen Szeme elé az utolsó nagy döntésre.',
        nextSceneId: 'inf_final_encounter',
      },
    ],
  },

  // =====================================================================
  // A KILENCEDIKEN TÚLI KAMRA (THE CHAMBER BEYOND THE NINTH)
  // =====================================================================
  g1_chamber_beyond_ninth: {
    id: 'g1_chamber_beyond_ninth',
    speaker: 'A KILENCEDIKEN TÚLI KAMRA',
    speakerRole: 'A Kilenc Visszhang Szintézise · Θ–∞–Δ',
    location: 'Túl a Kilencediken // A Közös Lélegzet Terme',
    timestamp: 'Időn Túli Csend',
    atmosphere: 'silence',
    illustrationKey: 'theInfinite',
    cinematicEventId: 'cin_chamber_beyond_ninth',
    text: 'Amint mind a kilenc birodalom rezonanciamagja a helyére csúszik, a nyolc külső Őrző hangja egyetlen tiszta csendbe olvad. A kilencedik talapzat mögött nem egy tizedik trón áll — nem létezik tizedik Őrző. Ehelyett egy kerek, meleg fa- és csillagfényű kamrába lépsz, amelynek közepén egy eddig sosem látott, lassan forgó szimbólum lebeg: Θ–∞–Δ.\n\nA falakon kilenc fénylő szál fonódik össze Kassarah óceánjától Sen-Maria gyökeréig. Megérted: a kilenc birodalom nem kilenc akadály volt, amivel teszteltek téged. Hanem annak a kilenc sejtnek a falai, amelyek azért védték ezt a néma magot, hogy mire elérsz ide, ne félj attól a kérdéstől, amely még a Végtelennél is régebbi:\n\n„Amikor bezárod vagy megnyitod a könyvet — ki marad a szobában veled?”',
    ngPlusText:
      'Második Lélegzet: A Θ–∞–Δ jel közepén felismered a saját korábbi időhurkod apró arany vonalát is — minden újrajátszás hozzáadott egy újabb gyűrűt a kamrához.',
    subtext:
      'Ez a kamra csak mind a 9 Visszhang egyesítésével érhető el. Választásod végleg beépül a Végtelen előtti végső küszöbbe.',
    dynamicVariants: [
      {
        id: 'var_chamber_observer',
        title: 'A Rejtett Megfigyelő Nyomai Összeálltak',
        text: 'A falon kilenc apró jel villan fel: a tengerfenéki cédulától a tölgyfalevélig minden egyes anomália erre a kamrára mutatott. Valaki már azelőtt is figyelt a nyitott ablak túloldalán, hogy Viktor bekapcsolta volna a georadart.',
        requiresWorldFlag: 'observerConvergenceTriggered',
      },
      {
        id: 'var_chamber_raw_truth',
        title: 'Kassarah Tiszta Emléke',
        text: 'Mivel megőrizted a nyers igazságot az Emlékek Óceánjában, a kilenc emlékfonál egyetlen torzítás nélkül világítja meg az 1959-es és 1982-es kutatók neveit.',
        requiresChoiceId: 'trial_r1_raw_truth',
      },
    ],
    hotspots: [
      {
        id: 'hs_chamber_unknown_glyph',
        label: 'A Korábban Nem Látott Θ–∞–Δ Szimbólum Vizsgálata',
        kind: 'secret_door',
        description: 'Három egymásba fonódó ív: emlékezet, csend és a még meg nem írt pillanat.',
        revealText:
          'A jel jelentése nem fordítható le emberi nyelvre, mégis érzed: ez az a közös lélegzet, amely miatt az emberiség, az Őrzők és a Végtelen egyetlen történetet alkotnak. (+50 Rezonancia)',
        resonanceReward: 50,
      },
    ],
    choices: [
      {
        id: 'c_chamber_carry_mystery',
        label: 'Elfogadom a válasz nélküli rejtélyt: a Spirál élő kérdés maradjon',
        reflection: 'Nem akarsz minden titkot lezárni — hagyod, hogy a kilenc birodalom tovább lélegezzen.',
        personalityBias: { intuitive: 2, explorer: 2, architect: 1 },
        effect: {
          spiralAwarenessDelta: 20,
          consciousnessDepthDelta: 1,
          resonancePointsDelta: 60,
          unlockMemoryId: 'mem_chamber_beyond_ninth',
          unlockRelicId: 'relic_ninth_key',
          unlockAchievementId: 'ach_chamber_beyond',
          unlockSecretId: 'sec_chamber_beyond_ninth',
          setWorldFlags: {
            chamberBeyondNinthCompleted: true,
            chamberBeyondChoiceId: 'c_chamber_carry_mystery',
          },
        },
        nextSceneId: 'inf_final_encounter',
      },
      {
        id: 'c_chamber_bind_nine_voices',
        label: 'Összekötöm a kilenc hangot a jég alatti emberek emlékezetével',
        reflection: 'Viktor, Lena, Mira, Levente, Sára, Tamás és Kovács Áron neveit vésed a Θ–∞–Δ közepébe.',
        personalityBias: { preserver: 3, analytical: 1 },
        effect: {
          memoryIntegrityDelta: 20,
          spiralAwarenessDelta: 15,
          resonancePointsDelta: 60,
          unlockMemoryId: 'mem_chamber_beyond_ninth',
          unlockRelicId: 'relic_ninth_key',
          unlockAchievementId: 'ach_chamber_beyond',
          unlockSecretId: 'sec_chamber_beyond_ninth',
          setWorldFlags: {
            chamberBeyondNinthCompleted: true,
            chamberBeyondChoiceId: 'c_chamber_bind_nine_voices',
          },
        },
        nextSceneId: 'inf_final_encounter',
      },
      {
        id: 'c_chamber_return_nexus',
        label: 'Még körülnézek a Kilenc Birodalom Csarnokában a Végső Döntés előtt',
        nextSceneId: 'g1_guardians_nexus',
      },
    ],
  },
};
