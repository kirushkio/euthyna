import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { generateSeededScenario } from '../packages/bench/src/generator.js';
import { AgentOrchestrator } from '../packages/agent/src/orchestrator.js';
import { deployTreasuryInfrastructure } from './deploy.js';

export async function seedDemoEnvironment() {
  console.log('Seeding demo environments for 5 business vaults...');

  // Ensure deployments exist
  const deployments = await deployTreasuryInfrastructure();

  if (!existsSync('data')) {
    mkdirSync('data', { recursive: true });
  }

  const businessStates: any[] = [];
  const allDecisionRecords: any[] = [];

  for (let b = 0; b < deployments.businesses.length; b++) {
    const biz = deployments.businesses[b];
    const seed = 100 + b * 17;
    const scenario = generateSeededScenario(seed);
    const snapshot = scenario.initialSnapshot;
    snapshot.businessId = biz.id;

    // Use test agent private key for signing decision records
    const testAgentKey: `0x${string}` = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a9';
    const orchestrator = new AgentOrchestrator(testAgentKey);

    const history: any[] = [];
    let currentSnap = snapshot;

    // Simulate 14 days of live operation for the dashboard
    for (let day = 0; day <= 14; day++) {
      currentSnap.simulatedDay = day;
      const tickResult = await orchestrator.tick(currentSnap);
      currentSnap = tickResult.updatedSnapshot;
      history.push(tickResult);
      allDecisionRecords.push(tickResult.decisionRecord);
    }

    businessStates.push({
      business: biz,
      currentSnapshot: JSON.parse(
        JSON.stringify(currentSnap, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      ),
      history: history.map(h => ({
        simulatedDay: h.simulatedDay,
        roundsCount: h.roundsCount,
        executed: h.executed,
        escalated: h.escalated,
        decisionRecord: h.decisionRecord,
        receiptTxHash: h.receiptTxHash
      }))
    });
  }

  writeFileSync(
    'data/seed_state.json',
    JSON.stringify({ businessStates, allDecisionRecords }, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2),
    'utf8'
  );
  console.log(`Successfully seeded 5 business vaults with 75 decision records in data/seed_state.json`);
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDemoEnvironment().catch(console.error);
}
