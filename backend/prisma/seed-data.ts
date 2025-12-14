import { QuestionType } from '@prisma/client';

// Fonction helper pour générer des questions
function generateQuestions(baseQuestions: any[], count: number): any[] {
  const questions = [...baseQuestions];
  
  // Générer des variations pour atteindre le nombre souhaité
  while (questions.length < count) {
    const baseQ = baseQuestions[questions.length % baseQuestions.length];
    questions.push({
      ...baseQ,
      text: `${baseQ.text} (Variante ${Math.floor(questions.length / baseQuestions.length) + 1})`,
    });
  }
  
  return questions.slice(0, count);
}

export const medicalModulesData = [
  {
    name: 'Anatomie',
    code: 'ANAT',
    description: 'Anatomie générale et descriptive du corps humain',
    parts: [
      {
        name: 'Anatomie du système osseux',
        code: 'ANAT-OS',
        description: 'Anatomie descriptive du squelette',
        chapters: [
          {
            title: 'Le crâne',
            code: 'CRANE',
            description: 'Anatomie du crâne et de la face',
            questions: generateQuestions([
              {
                text: 'Combien d\'os composent le crâne chez l\'adulte ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le crâne adulte est composé de 22 os : 8 os pour la boîte crânienne et 14 os pour la face.',
                choices: [
                  { label: 'A', text: '20 os', isCorrect: false },
                  { label: 'B', text: '22 os', isCorrect: true },
                  { label: 'C', text: '24 os', isCorrect: false },
                  { label: 'D', text: '26 os', isCorrect: false },
                ],
              },
              {
                text: 'Quel os forme la partie antérieure de la base du crâne ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'os ethmoïde forme la partie antérieure de la base du crâne.',
                choices: [
                  { label: 'A', text: 'L\'os frontal', isCorrect: false },
                  { label: 'B', text: 'L\'os ethmoïde', isCorrect: true },
                  { label: 'C', text: 'L\'os sphénoïde', isCorrect: false },
                  { label: 'D', text: 'L\'os occipital', isCorrect: false },
                ],
              },
              {
                text: 'Le foramen magnum est situé dans :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le foramen magnum est une grande ouverture située dans l\'os occipital.',
                choices: [
                  { label: 'A', text: 'L\'os frontal', isCorrect: false },
                  { label: 'B', text: 'L\'os temporal', isCorrect: false },
                  { label: 'C', text: 'L\'os occipital', isCorrect: true },
                  { label: 'D', text: 'L\'os pariétal', isCorrect: false },
                ],
              },
              {
                text: 'Les os du crâne sont reliés par des sutures. Parmi ces sutures, lesquelles existent ?',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Les principales sutures du crâne sont la suture coronale, sagittale et lambdoïde.',
                choices: [
                  { label: 'A', text: 'Suture coronale', isCorrect: true },
                  { label: 'B', text: 'Suture sagittale', isCorrect: true },
                  { label: 'C', text: 'Suture lambdoïde', isCorrect: true },
                  { label: 'D', text: 'Suture frontale', isCorrect: false },
                ],
              },
              {
                text: 'Le crâne protège le cerveau.',
                type: QuestionType.TRUE_FALSE,
                explanation: 'Vrai, le crâne forme une boîte osseuse qui protège le cerveau.',
                choices: [
                  { label: 'A', text: 'Vrai', isCorrect: true },
                  { label: 'B', text: 'Faux', isCorrect: false },
                ],
              },
              {
                text: 'Quel os contient l\'organe de l\'ouïe ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'os temporal contient les structures de l\'oreille interne, moyenne et externe.',
                choices: [
                  { label: 'A', text: 'Os temporal', isCorrect: true },
                  { label: 'B', text: 'Os pariétal', isCorrect: false },
                  { label: 'C', text: 'Os frontal', isCorrect: false },
                  { label: 'D', text: 'Os occipital', isCorrect: false },
                ],
              },
              {
                text: 'La fontanelle antérieure se ferme généralement vers :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La fontanelle antérieure (grande fontanelle) se ferme généralement entre 12 et 18 mois.',
                choices: [
                  { label: 'A', text: '6 mois', isCorrect: false },
                  { label: 'B', text: '12-18 mois', isCorrect: true },
                  { label: 'C', text: '24 mois', isCorrect: false },
                  { label: 'D', text: '36 mois', isCorrect: false },
                ],
              },
            ], 20), // 20 questions pour ce chapitre
          },
          {
            title: 'Le rachis',
            code: 'RACHIS',
            description: 'Anatomie de la colonne vertébrale',
            questions: generateQuestions([
              {
                text: 'Combien de vertèbres composent la colonne vertébrale chez l\'adulte ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La colonne vertébrale adulte est composée de 33 vertèbres : 7 cervicales, 12 thoraciques, 5 lombaires, 5 sacrées et 4 coccygiennes.',
                choices: [
                  { label: 'A', text: '30 vertèbres', isCorrect: false },
                  { label: 'B', text: '33 vertèbres', isCorrect: true },
                  { label: 'C', text: '35 vertèbres', isCorrect: false },
                  { label: 'D', text: '28 vertèbres', isCorrect: false },
                ],
              },
              {
                text: 'Quelle est la courbure normale de la colonne vertébrale au niveau cervical ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La colonne cervicale présente une lordose (courbure concave vers l\'arrière).',
                choices: [
                  { label: 'A', text: 'Lordose', isCorrect: true },
                  { label: 'B', text: 'Cyphose', isCorrect: false },
                  { label: 'C', text: 'Scoliose', isCorrect: false },
                  { label: 'D', text: 'Rectiligne', isCorrect: false },
                ],
              },
              {
                text: 'Combien de vertèbres cervicales possède l\'être humain ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'être humain possède 7 vertèbres cervicales, numérotées de C1 à C7.',
                choices: [
                  { label: 'A', text: '5 vertèbres', isCorrect: false },
                  { label: 'B', text: '6 vertèbres', isCorrect: false },
                  { label: 'C', text: '7 vertèbres', isCorrect: true },
                  { label: 'D', text: '8 vertèbres', isCorrect: false },
                ],
              },
              {
                text: 'L\'atlas (C1) s\'articule avec :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'atlas (C1) s\'articule avec l\'os occipital du crâne et l\'axis (C2).',
                choices: [
                  { label: 'A', text: 'L\'os occipital', isCorrect: true },
                  { label: 'B', text: 'L\'os temporal', isCorrect: false },
                  { label: 'C', text: 'La première vertèbre thoracique', isCorrect: false },
                  { label: 'D', text: 'L\'axis uniquement', isCorrect: false },
                ],
              },
            ], 18), // 18 questions
          },
          {
            title: 'Le thorax',
            code: 'THORAX',
            description: 'Anatomie de la cage thoracique',
            questions: generateQuestions([
              {
                text: 'Combien de côtes possède un être humain normalement ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Un être humain possède normalement 12 paires de côtes, soit 24 côtes au total.',
                choices: [
                  { label: 'A', text: '20 côtes (10 paires)', isCorrect: false },
                  { label: 'B', text: '24 côtes (12 paires)', isCorrect: true },
                  { label: 'C', text: '28 côtes (14 paires)', isCorrect: false },
                  { label: 'D', text: '16 côtes (8 paires)', isCorrect: false },
                ],
              },
              {
                text: 'Les côtes flottantes sont :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Les côtes flottantes sont les 11ème et 12ème paires, qui ne s\'articulent pas avec le sternum.',
                choices: [
                  { label: 'A', text: 'Les 9ème et 10ème paires', isCorrect: false },
                  { label: 'B', text: 'Les 11ème et 12ème paires', isCorrect: true },
                  { label: 'C', text: 'Les 7ème et 8ème paires', isCorrect: false },
                  { label: 'D', text: 'Toutes les côtes', isCorrect: false },
                ],
              },
            ], 15), // 15 questions
          },
          {
            title: 'Le bassin',
            code: 'BASSIN',
            description: 'Anatomie du bassin osseux',
            questions: generateQuestions([
              {
                text: 'Le bassin est formé par :',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Le bassin est formé par les deux os coxaux (ilium, ischion, pubis) et le sacrum.',
                choices: [
                  { label: 'A', text: 'Les os coxaux', isCorrect: true },
                  { label: 'B', text: 'Le sacrum', isCorrect: true },
                  { label: 'C', text: 'Le coccyx', isCorrect: false },
                  { label: 'D', text: 'Les vertèbres lombaires', isCorrect: false },
                ],
              },
            ], 12), // 12 questions
          },
        ],
      },
      {
        name: 'Anatomie du système musculaire',
        code: 'ANAT-MUSC',
        description: 'Anatomie des muscles',
        chapters: [
          {
            title: 'Muscles du membre supérieur',
            code: 'MUSC-SUP',
            description: 'Anatomie des muscles du bras et de l\'avant-bras',
            questions: generateQuestions([
              {
                text: 'Quel muscle est responsable de la flexion du coude ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le muscle biceps brachial est le principal fléchisseur du coude.',
                choices: [
                  { label: 'A', text: 'Triceps brachial', isCorrect: false },
                  { label: 'B', text: 'Biceps brachial', isCorrect: true },
                  { label: 'C', text: 'Deltoïde', isCorrect: false },
                  { label: 'D', text: 'Pectoral', isCorrect: false },
                ],
              },
              {
                text: 'Le muscle deltoïde est responsable de :',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Le deltoïde permet l\'abduction, la flexion et l\'extension du bras.',
                choices: [
                  { label: 'A', text: 'L\'abduction du bras', isCorrect: true },
                  { label: 'B', text: 'La flexion du bras', isCorrect: true },
                  { label: 'C', text: 'L\'extension du bras', isCorrect: true },
                  { label: 'D', text: 'La rotation interne', isCorrect: false },
                ],
              },
            ], 16), // 16 questions
          },
          {
            title: 'Muscles du membre inférieur',
            code: 'MUSC-INF',
            description: 'Anatomie des muscles de la jambe',
            questions: generateQuestions([
              {
                text: 'Quel muscle est le principal extenseur de la jambe ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le quadriceps fémoral est le principal extenseur de la jambe au niveau du genou.',
                choices: [
                  { label: 'A', text: 'Quadriceps fémoral', isCorrect: true },
                  { label: 'B', text: 'Ischio-jambiers', isCorrect: false },
                  { label: 'C', text: 'Gastrocnémien', isCorrect: false },
                  { label: 'D', text: 'Tibial antérieur', isCorrect: false },
                ],
              },
            ], 14), // 14 questions
          },
        ],
      },
      {
        name: 'Anatomie du système nerveux',
        code: 'ANAT-NERV',
        description: 'Anatomie du système nerveux central et périphérique',
        chapters: [
          {
            title: 'Le cerveau',
            code: 'CERVEAU',
            description: 'Anatomie du cerveau',
            questions: generateQuestions([
              {
                text: 'Quelles sont les principales parties du cerveau ?',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Le cerveau comprend le télencéphale, le diencéphale, le tronc cérébral et le cervelet.',
                choices: [
                  { label: 'A', text: 'Télencéphale', isCorrect: true },
                  { label: 'B', text: 'Diencéphale', isCorrect: true },
                  { label: 'C', text: 'Tronc cérébral', isCorrect: true },
                  { label: 'D', text: 'Cervelet', isCorrect: true },
                ],
              },
            ], 17), // 17 questions
          },
        ],
      },
    ],
  },
  {
    name: 'Physiologie',
    code: 'PHYS',
    description: 'Physiologie générale et systémique',
    parts: [
      {
        name: 'Physiologie cardiovasculaire',
        code: 'PHYS-CV',
        description: 'Fonctionnement du système cardiovasculaire',
        chapters: [
          {
            title: 'Le cœur',
            code: 'COEUR',
            description: 'Physiologie cardiaque',
            questions: generateQuestions([
              {
                text: 'Quelle est la fréquence cardiaque normale au repos chez un adulte ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La fréquence cardiaque normale au repos varie entre 60 et 100 battements par minute.',
                choices: [
                  { label: 'A', text: '40-60 bpm', isCorrect: false },
                  { label: 'B', text: '60-100 bpm', isCorrect: true },
                  { label: 'C', text: '100-120 bpm', isCorrect: false },
                  { label: 'D', text: '120-140 bpm', isCorrect: false },
                ],
              },
              {
                text: 'Le nœud sinusal est situé dans :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le nœud sinusal, qui génère l\'influx cardiaque, est situé dans l\'oreillette droite.',
                choices: [
                  { label: 'A', text: 'Oreillette droite', isCorrect: true },
                  { label: 'B', text: 'Oreillette gauche', isCorrect: false },
                  { label: 'C', text: 'Ventricule droit', isCorrect: false },
                  { label: 'D', text: 'Ventricule gauche', isCorrect: false },
                ],
              },
              {
                text: 'Le volume d\'éjection systolique normal est d\'environ :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le volume d\'éjection systolique normal est d\'environ 70 ml par battement.',
                choices: [
                  { label: 'A', text: '50 ml', isCorrect: false },
                  { label: 'B', text: '70 ml', isCorrect: true },
                  { label: 'C', text: '100 ml', isCorrect: false },
                  { label: 'D', text: '120 ml', isCorrect: false },
                ],
              },
            ], 20), // 20 questions
          },
          {
            title: 'La circulation sanguine',
            code: 'CIRC',
            description: 'Physiologie de la circulation',
            questions: generateQuestions([
              {
                text: 'Quelle est la pression artérielle normale ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La pression artérielle normale est inférieure à 120/80 mmHg.',
                choices: [
                  { label: 'A', text: '< 120/80 mmHg', isCorrect: true },
                  { label: 'B', text: '< 140/90 mmHg', isCorrect: false },
                  { label: 'C', text: '< 100/60 mmHg', isCorrect: false },
                  { label: 'D', text: '< 160/100 mmHg', isCorrect: false },
                ],
              },
            ], 18), // 18 questions
          },
        ],
      },
      {
        name: 'Physiologie respiratoire',
        code: 'PHYS-RESP',
        description: 'Fonctionnement du système respiratoire',
        chapters: [
          {
            title: 'La ventilation',
            code: 'VENT',
            description: 'Mécanismes de la respiration',
            questions: generateQuestions([
              {
                text: 'Quel muscle est le principal responsable de l\'inspiration ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le diaphragme est le principal muscle inspiratoire.',
                choices: [
                  { label: 'A', text: 'Diaphragme', isCorrect: true },
                  { label: 'B', text: 'Intercostaux', isCorrect: false },
                  { label: 'C', text: 'Sternocléidomastoïdien', isCorrect: false },
                  { label: 'D', text: 'Abdominaux', isCorrect: false },
                ],
              },
              {
                text: 'La capacité vitale est :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La capacité vitale est le volume maximal d\'air qu\'on peut expirer après une inspiration maximale.',
                choices: [
                  { label: 'A', text: 'Le volume d\'air inspiré normalement', isCorrect: false },
                  { label: 'B', text: 'Le volume maximal expiré après inspiration maximale', isCorrect: true },
                  { label: 'C', text: 'Le volume résiduel', isCorrect: false },
                  { label: 'D', text: 'Le volume courant', isCorrect: false },
                ],
              },
            ], 16), // 16 questions
          },
        ],
      },
      {
        name: 'Physiologie rénale',
        code: 'PHYS-REN',
        description: 'Fonctionnement du système rénal',
        chapters: [
          {
            title: 'La filtration glomérulaire',
            code: 'FILT-GLOM',
            description: 'Mécanismes de filtration rénale',
            questions: generateQuestions([
              {
                text: 'Le débit de filtration glomérulaire normal est d\'environ :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'Le DFG normal est d\'environ 120 ml/min chez l\'adulte.',
                choices: [
                  { label: 'A', text: '60 ml/min', isCorrect: false },
                  { label: 'B', text: '120 ml/min', isCorrect: true },
                  { label: 'C', text: '180 ml/min', isCorrect: false },
                  { label: 'D', text: '240 ml/min', isCorrect: false },
                ],
              },
            ], 15), // 15 questions
          },
        ],
      },
    ],
  },
  {
    name: 'Pathologie',
    code: 'PATH',
    description: 'Pathologie générale et systémique',
    parts: [
      {
        name: 'Pathologie cardiovasculaire',
        code: 'PATH-CV',
        description: 'Maladies du système cardiovasculaire',
        chapters: [
          {
            title: 'L\'infarctus du myocarde',
            code: 'IDM',
            description: 'Pathologie de l\'infarctus',
            questions: generateQuestions([
              {
                text: 'Quel est le signe électrocardiographique caractéristique de l\'infarctus du myocarde ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'élévation du segment ST est caractéristique de l\'infarctus du myocarde avec sus-décalage de ST.',
                choices: [
                  { label: 'A', text: 'Ondes Q profondes', isCorrect: false },
                  { label: 'B', text: 'Élévation du segment ST', isCorrect: true },
                  { label: 'C', text: 'Ondes T pointues', isCorrect: false },
                  { label: 'D', text: 'Prolongation du QT', isCorrect: false },
                ],
              },
            ], 19), // 19 questions
          },
          {
            title: 'L\'hypertension artérielle',
            code: 'HTA',
            description: 'Pathologie de l\'hypertension',
            questions: generateQuestions([
              {
                text: 'L\'hypertension artérielle est définie par une pression artérielle :',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'L\'HTA est définie par une PA ≥ 140/90 mmHg.',
                choices: [
                  { label: 'A', text: '≥ 120/80 mmHg', isCorrect: false },
                  { label: 'B', text: '≥ 140/90 mmHg', isCorrect: true },
                  { label: 'C', text: '≥ 160/100 mmHg', isCorrect: false },
                  { label: 'D', text: '≥ 180/110 mmHg', isCorrect: false },
                ],
              },
            ], 17), // 17 questions
          },
        ],
      },
      {
        name: 'Pathologie respiratoire',
        code: 'PATH-RESP',
        description: 'Maladies du système respiratoire',
        chapters: [
          {
            title: 'L\'asthme',
            code: 'ASTHME',
            description: 'Pathologie de l\'asthme',
            questions: generateQuestions([
              {
                text: 'L\'asthme est caractérisé par :',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'L\'asthme est une maladie inflammatoire chronique avec obstruction réversible des voies aériennes.',
                choices: [
                  { label: 'A', text: 'Inflammation chronique', isCorrect: true },
                  { label: 'B', text: 'Obstruction réversible', isCorrect: true },
                  { label: 'C', text: 'Hyperréactivité bronchique', isCorrect: true },
                  { label: 'D', text: 'Destruction irréversible', isCorrect: false },
                ],
              },
            ], 16), // 16 questions
          },
        ],
      },
    ],
  },
  {
    name: 'Pharmacologie',
    code: 'PHARM',
    description: 'Pharmacologie générale et clinique',
    parts: [
      {
        name: 'Pharmacologie cardiovasculaire',
        code: 'PHARM-CV',
        description: 'Médicaments du système cardiovasculaire',
        chapters: [
          {
            title: 'Les antihypertenseurs',
            code: 'AHT',
            description: 'Médicaments contre l\'hypertension',
            questions: generateQuestions([
              {
                text: 'Quelle classe de médicaments est utilisée en première intention dans l\'hypertension artérielle ?',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Les inhibiteurs de l\'enzyme de conversion (IEC) et les antagonistes des récepteurs de l\'angiotensine II (ARA II) sont souvent utilisés en première intention.',
                choices: [
                  { label: 'A', text: 'IEC (Inhibiteurs de l\'enzyme de conversion)', isCorrect: true },
                  { label: 'B', text: 'Bêta-bloquants', isCorrect: false },
                  { label: 'C', text: 'ARA II (Antagonistes des récepteurs de l\'angiotensine II)', isCorrect: true },
                  { label: 'D', text: 'Diurétiques thiazidiques', isCorrect: true },
                ],
              },
            ], 18), // 18 questions
          },
        ],
      },
    ],
  },
  {
    name: 'Biochimie',
    code: 'BIOC',
    description: 'Biochimie fondamentale et métabolisme',
    parts: [
      {
        name: 'Métabolisme glucidique',
        code: 'BIOC-GLUC',
        description: 'Métabolisme des glucides',
        chapters: [
          {
            title: 'La glycolyse',
            code: 'GLYCO',
            description: 'Voie métabolique de la glycolyse',
            questions: generateQuestions([
              {
                text: 'Combien de molécules d\'ATP sont produites par la glycolyse anaérobie ?',
                type: QuestionType.SINGLE_CHOICE,
                explanation: 'La glycolyse anaérobie produit 2 molécules d\'ATP nettes (4 produites, 2 consommées).',
                choices: [
                  { label: 'A', text: '1 ATP', isCorrect: false },
                  { label: 'B', text: '2 ATP', isCorrect: true },
                  { label: 'C', text: '4 ATP', isCorrect: false },
                  { label: 'D', text: '36 ATP', isCorrect: false },
                ],
              },
            ], 17), // 17 questions
          },
        ],
      },
    ],
  },
  {
    name: 'Histologie',
    code: 'HIST',
    description: 'Histologie et embryologie',
    parts: [
      {
        name: 'Tissus fondamentaux',
        code: 'HIST-TISS',
        description: 'Les quatre types de tissus fondamentaux',
        chapters: [
          {
            title: 'Le tissu épithélial',
            code: 'EPITH',
            description: 'Caractéristiques du tissu épithélial',
            questions: generateQuestions([
              {
                text: 'Quelles sont les caractéristiques du tissu épithélial ?',
                type: QuestionType.MULTIPLE_CHOICE,
                explanation: 'Le tissu épithélial est avasculaire, polarisé, et forme des revêtements et des glandes.',
                choices: [
                  { label: 'A', text: 'Avasculaire', isCorrect: true },
                  { label: 'B', text: 'Polarisé', isCorrect: true },
                  { label: 'C', text: 'Très vascularisé', isCorrect: false },
                  { label: 'D', text: 'Forme des revêtements', isCorrect: true },
                ],
              },
            ], 15), // 15 questions
          },
        ],
      },
    ],
  },
];

