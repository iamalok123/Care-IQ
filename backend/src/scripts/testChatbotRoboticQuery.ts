import { documentRagEngine } from '../services/documentRagEngine';
import { dataRepository } from '../services/dataRepository';

async function main() {
  console.log('===============================================================');
  console.log('     CareIQ AI Chatbot — Robotic Surgery & Policy Query Test   ');
  console.log('===============================================================\n');

  await dataRepository.ensureDataLoaded();

  const testCases = [
    {
      name: 'Star Comprehensive — Robotic Knee Surgery Query',
      policyId: 'pol-star-comp-5l',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'HDFC ERGO Optima Restore — Robotic Knee Surgery Query',
      policyId: 'pol-hdfc-optima-10l',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'Care Supreme — Robotic Knee Surgery Query',
      policyId: 'pol-care-supreme-7l',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'New India Mediclaim — Robotic Knee Surgery Query',
      policyId: 'pol-new-india-mediclaim-3l',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'Ayushman Bharat PM-JAY — Knee Replacement Query',
      policyId: 'pol-pmjay-scheme-5l',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'Generic Policy Context — Robotic Knee Surgery Query',
      policyId: undefined,
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      name: 'Consumables & PPE Query',
      policyId: 'pol-star-comp-5l',
      query: 'Are gloves, PPE kits, and admission consumables covered?'
    },
    {
      name: 'Room Rent & Proportionate Deduction Query',
      policyId: 'pol-star-comp-5l',
      query: 'What is the room rent limit and does proportionate deduction apply if I choose a Deluxe room?'
    }
  ];

  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n---------------------------------------------------------------`);
    console.log(`[TEST ${i + 1}] ${tc.name}`);
    console.log(`Policy ID: ${tc.policyId || '(None - Universal)'}`);
    console.log(`Query: "${tc.query}"`);
    console.log(`---------------------------------------------------------------`);

    const res = await documentRagEngine.queryPolicyRAGAsync(tc.query, tc.policyId);

    console.log(`Confidence: ${res.confidence}`);
    console.log(`Citations Count: ${res.citations.length}`);
    res.citations.forEach((c, cIdx) => {
      console.log(`  [Citation ${cIdx + 1}] ${c.policyName} | ${c.sectionTitle} (Page ${c.pageNumber})`);
    });

    console.log(`\n--- AI COPILOT ANSWER ---`);
    console.log(res.answer);
    console.log(`\nDisclaimer: ${res.disclaimer}`);

    // Verify key safety criteria
    const lowerAnswer = res.answer.toLowerCase();
    const isRobotic = tc.query.toLowerCase().includes('robotic');
    const mentionsCovered = lowerAnswer.includes('covered') || lowerAnswer.includes('yes') || lowerAnswer.includes('sub-limit') || lowerAnswer.includes('irdai');
    const hasCitations = res.citations.length > 0;

    const passed = isRobotic ? (mentionsCovered && hasCitations) : hasCitations;
    if (!passed) {
      console.error(`❌ TEST FAILED: Missing coverage confirmation or citations.`);
      allPassed = false;
    } else {
      console.log(`✅ TEST PASSED`);
    }
  }

  console.log(`\n===============================================================`);
  if (allPassed) {
    console.log(`✅ ALL ${testCases.length} CHATBOT TEST CASES PASSED SUCCESSFULLY!`);
  } else {
    console.error(`❌ SOME CHATBOT TEST CASES FAILED.`);
    process.exit(1);
  }
  console.log(`===============================================================\n`);
}

main().catch((err) => {
  console.error('Fatal error running chatbot tests:', err);
  process.exit(1);
});
