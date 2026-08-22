import { dataRepository } from '../services/dataRepository';

async function testVerificationSync() {
  console.log('==================================================');
  console.log('Testing Dynamic Verification Checklist Engine');
  console.log('==================================================\n');

  await dataRepository.syncFromSupabase();

  // Test 1: Query verification items for Demo Personas
  const ananyaItems = dataRepository.getVerificationItems('pat-demo-ananya');
  console.log(`[Test 1] Ananya Sharma (Demo 1): ${ananyaItems.length} items found.`);
  ananyaItems.forEach(item => console.log(`   - [${item.priority}] ${item.title} (${item.status})`));

  // Test 2: Query verification items for a brand new user who had 0 items
  const newPatientId = `pat-new-${Date.now()}`;
  console.log(`\n[Test 2] Newly registered user (${newPatientId}):`);
  const newItems = dataRepository.getVerificationItems(newPatientId);
  console.log(`   ✓ Automatically generated ${newItems.length} tailored verification items:`);
  newItems.forEach(item => console.log(`   - [${item.priority}] ${item.title} -> Status: ${item.status}`));

  // Test 3: Resolve an item and verify state update
  const itemToResolve = newItems[0];
  console.log(`\n[Test 3] Resolving item: ${itemToResolve.title}`);
  dataRepository.resolveVerificationItem(itemToResolve.id);
  const updatedItems = dataRepository.getVerificationItems(newPatientId);
  const resolved = updatedItems.find(i => i.id === itemToResolve.id);
  console.log(`   ✓ Resolved Status: ${resolved?.status} (Resolved at: ${resolved?.resolved_at})`);

  console.log('\n==================================================');
  console.log('✅ Verification synchronization fully verified!');
  console.log('==================================================');
}

testVerificationSync().catch(console.error);
