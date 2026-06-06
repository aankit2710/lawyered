import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from '../modules/users/entities/user.entity';
import { Will } from '../modules/wills/entities/will.entity';
import { ChatMessage } from '../modules/wills/entities/chat-message.entity';
import { WillSnapshot } from '../modules/wills/entities/will-snapshot.entity';
import { WillSnapshotState } from '../modules/wills/memory/will-snapshot-state';

export const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@lawyered.com';
export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Demo@Lawyered1';

const reset = process.argv.includes('--reset');

async function clearDemoData() {
  const userRepo = AppDataSource.getRepository(User);
  const demoUser = await userRepo.findOne({ where: { email: DEMO_EMAIL } });
  if (demoUser) {
    await userRepo.remove(demoUser);
    console.log(`Removed existing demo user ${DEMO_EMAIL}`);
  }
}

async function seedWill(
  user: User,
  title: string,
  status: string,
  completion: number,
  snapshot: WillSnapshotState,
  messages: Array<{ role: 'user' | 'assistant'; content: string; metadata?: Record<string, unknown> }>,
): Promise<Will> {
  const willRepo = AppDataSource.getRepository(Will);
  const snapshotRepo = AppDataSource.getRepository(WillSnapshot);
  const chatRepo = AppDataSource.getRepository(ChatMessage);

  const will = await willRepo.save(
    willRepo.create({
      user,
      title,
      status,
      completion_percentage: completion,
    }),
  );

  await snapshotRepo.save(
    snapshotRepo.create({
      will,
      snapshot: { ...snapshot, title },
    }),
  );

  for (const message of messages) {
    await chatRepo.save(
      chatRepo.create({
        will,
        role: message.role,
        content: message.content,
        metadata: message.metadata,
      }),
    );
  }

  return will;
}

async function runSeed() {
  await AppDataSource.initialize();

  if (reset) {
    await clearDemoData();
  }

  const userRepo = AppDataSource.getRepository(User);
  let demoUser = await userRepo.findOne({ where: { email: DEMO_EMAIL } });

  if (!demoUser) {
    demoUser = await userRepo.save(
      userRepo.create({
        email: DEMO_EMAIL,
        password: await bcrypt.hash(DEMO_PASSWORD, 10),
        firstName: 'Demo',
        lastName: 'Reviewer',
        isActive: true,
      }),
    );
    console.log(`Created demo user: ${DEMO_EMAIL}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  }

  const partialSnapshot: WillSnapshotState = {
    title: 'Partial Will (In Progress)',
    testator: {
      name: 'Anita Sharma',
      age: 52,
      address: '12 MG Road, Pune, Maharashtra',
      soundMind: true,
    },
    assets: [],
    beneficiaries: [],
    allocations: [],
    executor: null,
    guardian: null,
    witnesses: [],
    askedQuestions: ['Who should be the executor?'],
    lastNextQuestion: 'Who should be the executor?',
    pendingClarification: null,
  };

  await seedWill(
    demoUser,
    'Partial Will (In Progress)',
    'INCOMPLETE',
    30,
    partialSnapshot,
    [
      { role: 'user', content: 'My name is Anita Sharma. I am 52 and live at 12 MG Road, Pune.' },
      {
        role: 'assistant',
        content: 'Who should be the executor?',
        metadata: { extraction: { confidence: 0.8, nextQuestion: 'Who should be the executor?' } },
      },
    ],
  );

  const completeSnapshot: WillSnapshotState = {
    title: 'Complete Family Will',
    testator: {
      name: 'Rajesh Kumar',
      age: 58,
      address: '45 Lake View Apartments, Bangalore',
      soundMind: true,
    },
    assets: [
      { name: 'Family Home', description: '3BHK in Whitefield', value: '₹1.2 Cr', location: 'Bangalore' },
      { name: 'Savings Account', description: 'HDFC account', value: '₹25,00,000', location: 'Bangalore' },
    ],
    beneficiaries: [
      { name: 'Priya Kumar', relationship: 'spouse', contact: 'priya@example.com' },
      { name: 'Arjun Kumar', relationship: 'son', age: 28 },
      { name: 'Meera Kumar', relationship: 'daughter', age: 12 },
    ],
    allocations: [
      { asset: 'Family Home', beneficiary: 'Priya Kumar', percentage: 50 },
      { asset: 'Family Home', beneficiary: 'Arjun Kumar', percentage: 50 },
      { asset: 'Savings Account', beneficiary: 'Priya Kumar', percentage: 100 },
    ],
    executor: { name: 'Priya Kumar', contact: '9876543210' },
    guardian: { name: 'Anita Sharma', relationship: 'sister', contact: '9876501234' },
    witnesses: [
      { name: 'Vikram Singh', age: 40, contact: '9000000001', signature_date: '2026-06-01' },
      { name: 'Sunita Rao', age: 38, contact: '9000000002', signature_date: '2026-06-01' },
    ],
  };

  await seedWill(
    demoUser,
    'Complete Family Will',
    'COMPLETE',
    100,
    completeSnapshot,
    [
      { role: 'user', content: 'My house and savings go to my wife Priya and son Arjun equally for the house.' },
      { role: 'assistant', content: 'I have saved those details.', metadata: { extraction: { confidence: 0.92 } } },
    ],
  );

  const ambiguitySnapshot: WillSnapshotState = {
    title: 'Ambiguity Example Will',
    testator: { name: 'Suresh Patel', age: 60, address: 'Ahmedabad', soundMind: true },
    assets: [{ name: 'Residence', description: 'Primary home' }],
    beneficiaries: [],
    allocations: [],
    executor: null,
    guardian: null,
    witnesses: [],
    pendingClarification: {
      question: 'Which son should inherit everything? Please provide his full name.',
      ambiguity: 'Which son should inherit everything?',
      createdAt: new Date().toISOString(),
    },
  };

  await seedWill(
    demoUser,
    'Ambiguity Example Will',
    'INCOMPLETE',
    40,
    ambiguitySnapshot,
    [
      { role: 'user', content: 'My son gets everything.' },
      {
        role: 'assistant',
        content: 'Which son should inherit everything? Please provide his full name.',
        metadata: { extraction: { confidence: 0.45, ambiguities: ['Which son?'] }, gated: true },
      },
    ],
  );

  const complexSnapshot: WillSnapshotState = {
    title: 'Complex Allocation Will',
    testator: { name: 'Meena Iyer', age: 49, address: 'Chennai', soundMind: true },
    assets: [
      { name: 'Apartment', location: 'Chennai' },
      { name: 'Jewellery', location: 'Locker A' },
    ],
    beneficiaries: [
      { name: 'Rahul', relationship: 'son' },
      { name: 'Rohit', relationship: 'son' },
    ],
    allocations: [
      { asset: 'Apartment', beneficiary: 'Rahul', share: 0.5 },
      { asset: 'Apartment', beneficiary: 'Rohit', share: 0.5 },
      { asset: 'Jewellery', beneficiary: 'Rahul', share: 0.5 },
      { asset: 'Jewellery', beneficiary: 'Rohit', share: 0.5 },
    ],
    executor: { name: 'Meena Iyer', backup: 'Brother Sanjay', contact: '9988776655' },
    guardian: null,
    witnesses: [
      { name: 'Witness A', signature_date: '2026-05-20' },
      { name: 'Witness B', signature_date: '2026-05-20' },
    ],
  };

  await seedWill(
    demoUser,
    'Complex Allocation Will',
    'VALID_WITH_WARNINGS',
    85,
    complexSnapshot,
    [
      { role: 'user', content: 'Split my apartment and jewellery equally between Rahul and Rohit.' },
      { role: 'assistant', content: 'I have saved those details.', metadata: { extraction: { confidence: 0.88 } } },
    ],
  );

  const guardianSnapshot: WillSnapshotState = {
    title: 'Guardianship Will',
    testator: { name: 'Kavita Nair', age: 42, address: 'Kochi', soundMind: true },
    assets: [{ name: 'Residence', value: '₹80,00,000' }],
    beneficiaries: [{ name: 'Aanya', relationship: 'daughter', age: 10 }],
    allocations: [{ asset: 'Residence', beneficiary: 'Aanya', percentage: 100 }],
    executor: { name: 'Ravi Nair', contact: '9123456780' },
    guardian: { name: 'Lakshmi Nair', relationship: 'mother', contact: '9123456781' },
    witnesses: [
      { name: 'Tom Jose', signature_date: '2026-04-10' },
      { name: 'Mary Jose', signature_date: '2026-04-10' },
    ],
  };

  await seedWill(
    demoUser,
    'Guardianship Will',
    'INCOMPLETE',
    75,
    guardianSnapshot,
    [
      { role: 'user', content: 'My daughter Aanya who is 10 should inherit my home. My mother Lakshmi should be guardian.' },
      { role: 'assistant', content: 'I have saved those details.', metadata: { extraction: { confidence: 0.9 } } },
    ],
  );

  console.log('Demo wills seeded successfully.');
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Demo login email: ${DEMO_EMAIL}`);
  } else {
    console.log(`Demo user created: ${DEMO_EMAIL} (password from DEMO_USER_PASSWORD env)`);
  }

  await AppDataSource.destroy();
}

runSeed().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
