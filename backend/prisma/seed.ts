import { PrismaClient, SessionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { medicalModulesData as medicalModules } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed complet...\n');

  // Nettoyer les données existantes (optionnel)
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.userAnswer.deleteMany();
  await prisma.correctAnswer.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.part.deleteMany();
  await prisma.module.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();
  console.log('✅ Données nettoyées\n');

  // 1. Créer les années académiques
  console.log('📚 Création des années académiques...');
  const academicYears = [];
  for (let i = 1; i <= 6; i++) {
    const year = await prisma.academicYear.create({
      data: {
        name: `${i}ère année`,
        order: i,
        isActive: true,
      },
    });
    academicYears.push(year);
  }
  console.log(`✅ ${academicYears.length} années académiques créées\n`);

  // 2. Créer les semestres
  console.log('📅 Création des semestres...');
  const semesters = [];
  let semesterOrder = 1;
  for (const year of academicYears) {
    for (let s = 1; s <= 2; s++) {
      const semester = await prisma.semester.create({
        data: {
          code: `S${semesterOrder}`,
          name: `Semestre ${semesterOrder}`,
          order: semesterOrder,
          academicYearId: year.id,
          isActive: true,
        },
      });
      semesters.push(semester);
      semesterOrder++;
    }
  }
  console.log(`✅ ${semesters.length} semestres créés\n`);

  // 3. Créer les modules, parties, chapitres, sessions et questions
  console.log('📖 Création des modules, parties, chapitres, sessions et questions...');
  const s1 = semesters.find((s) => s.code === 'S1')!;
  const s2 = semesters.find((s) => s.code === 'S2')!;
  const s3 = semesters.find((s) => s.code === 'S3')!;

  let totalModules = 0;
  let totalParts = 0;
  let totalChapters = 0;
  let totalSessions = 0;
  let totalQuestions = 0;

  for (let moduleIndex = 0; moduleIndex < medicalModules.length; moduleIndex++) {
    const moduleData = medicalModules[moduleIndex];
    const targetSemester = moduleIndex < 2 ? s1 : moduleIndex < 4 ? s2 : s3;

    // Créer le module
    const module = await prisma.module.create({
      data: {
        name: moduleData.name,
        code: moduleData.code,
        description: moduleData.description,
        semesterId: targetSemester.id,
        order: moduleIndex + 1,
        isActive: true,
      },
    });
    totalModules++;
    console.log(`  ✓ Module: ${moduleData.name}`);

    // Créer les parties
    for (let partIndex = 0; partIndex < moduleData.parts.length; partIndex++) {
      const partData = moduleData.parts[partIndex];
      const part = await prisma.part.create({
        data: {
          name: partData.name,
          code: partData.code,
          description: partData.description,
          moduleId: module.id,
          order: partIndex + 1,
          isActive: true,
        },
      });
      totalParts++;
      console.log(`    ✓ Partie: ${partData.name}`);

      // Créer les chapitres
      for (let chapterIndex = 0; chapterIndex < partData.chapters.length; chapterIndex++) {
        const chapterData = partData.chapters[chapterIndex];
        const chapter = await prisma.chapter.create({
          data: {
            title: chapterData.title,
            code: chapterData.code,
            description: chapterData.description,
            partId: part.id,
            order: chapterIndex + 1,
            isActive: true,
          },
        });
        totalChapters++;
        console.log(`      ✓ Chapitre: ${chapterData.title}`);

        // Créer les sessions (NORMAL et RATTRAPAGE pour les années 2023 et 2024)
        for (const year of [2023, 2024]) {
          for (const sessionType of [SessionType.NORMAL, SessionType.RATTRAPAGE]) {
            const session = await prisma.session.create({
              data: {
                type: sessionType,
                year: year,
                chapterId: chapter.id,
                isActive: true,
              },
            });
            totalSessions++;
            console.log(`        ✓ Session: ${sessionType} ${year}`);

            // Créer les questions
            for (let qIndex = 0; qIndex < chapterData.questions.length; qIndex++) {
              const questionData = chapterData.questions[qIndex];
              const { choices, ...questionInfo } = questionData;

              const question = await prisma.question.create({
                data: {
                  ...questionInfo,
                  order: qIndex + 1,
                  sessionId: session.id,
                  isActive: true,
                  choices: {
                    create: choices.map((choice: any, cIndex: number) => ({
                      label: choice.label,
                      text: choice.text,
                      order: cIndex + 1,
                    })),
                  },
                },
              });

              // Créer les réponses correctes
              for (const choiceData of choices) {
                if (choiceData.isCorrect) {
                  const choice = await prisma.choice.findFirst({
                    where: {
                      questionId: question.id,
                      label: choiceData.label,
                    },
                  });

                  if (choice) {
                    await prisma.correctAnswer.create({
                      data: {
                        questionId: question.id,
                        choiceId: choice.id,
                      },
                    });
                  }
                }
              }
              totalQuestions++;
            }
          }
        }
      }
    }
  }

  console.log(`\n✅ ${totalModules} modules créés`);
  console.log(`✅ ${totalParts} parties créées`);
  console.log(`✅ ${totalChapters} chapitres créés`);
  console.log(`✅ ${totalSessions} sessions créées`);
  console.log(`✅ ${totalQuestions} questions créées\n`);

  // 4. Créer des utilisateurs de test
  console.log('👤 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@medical-qcm.com' },
    update: {},
    create: {
      email: 'superadmin@medical-qcm.com',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      accessType: 'PAID',
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medical-qcm.com' },
    update: {},
    create: {
      email: 'admin@medical-qcm.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      accessType: 'PAID',
      isActive: true,
      academicYearId: academicYears[0].id,
    },
  });

  // Créer plusieurs étudiants
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@medical-qcm.com` },
      update: {},
      create: {
        email: `student${i}@medical-qcm.com`,
        passwordHash: hashedPassword,
        firstName: `Étudiant${i}`,
        lastName: `Test${i}`,
        role: 'STUDENT',
        accessType: i <= 5 ? 'TRIAL' : 'PAID',
        isActive: true,
        academicYearId: academicYears[Math.floor((i - 1) / 2)].id,
      },
    });
    students.push(student);
  }

  console.log('✅ Utilisateurs créés');
  console.log('   - Super Admin: superadmin@medical-qcm.com / password123');
  console.log('   - Admin: admin@medical-qcm.com / password123');
  console.log('   - Étudiants: student1@medical-qcm.com à student10@medical-qcm.com / password123\n');

  console.log('🎉 Seed terminé avec succès !');
  console.log(`\n📊 Résumé:`);
  console.log(`   - ${academicYears.length} années académiques`);
  console.log(`   - ${semesters.length} semestres`);
  console.log(`   - ${totalModules} modules`);
  console.log(`   - ${totalParts} parties`);
  console.log(`   - ${totalChapters} chapitres`);
  console.log(`   - ${totalSessions} sessions`);
  console.log(`   - ${totalQuestions} questions`);
  console.log(`   - ${students.length + 2} utilisateurs\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
