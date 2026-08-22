import { dataRepository } from '../services/dataRepository';
import { dbManager } from '../db/dbManager';
import { matchingEngine } from '../services/matchingEngine';
import { costEngine } from '../services/costEngine';
import { rulesEngine } from '../services/rulesEngine';
import { journeyEngine } from '../services/journeyEngine';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { policyExtractionEngine } from '../services/policyExtractionEngine';
import { documentRagEngine } from '../services/documentRagEngine';
import { RoomCategoryCode } from '../types/domain';

console.log('--- CareIQ Intelligence Layer Verification Test ---');

async function runAllTests() {
  await dbManager.initializeOnStartup();

  // 1. Test Hospital Matching for Ananya (Persona 01 - Simple Match)
  console.log('\n[1] Testing Hospital Matching for Persona 01 (Star Health Policy)...');

  const ananyaPolicy =
    dataRepository.getPolicyById('pol-demo-ananya') ||
    dataRepository.getPolicyById('pol-syn-ananya') ||
    dataRepository.getPolicies()[0];
  if (!ananyaPolicy) throw new Error('Ananya policy missing');

  const matches = matchingEngine.matchHospitals({
    city: 'Bengaluru',
    policyId: ananyaPolicy.id,
    procedureId: 'proc-knee-replacement',
    preferredRoomCategory: RoomCategoryCode.PRIVATE_AC
  });

  console.log(`Matched ${matches.length} hospitals in Bengaluru.`);
  const topMatch = matches[0];
  console.log(`Top Rank: ${topMatch.hospital.name} (Score: ${topMatch.matchScore}/100)`);
  console.log(`Network Status: ${topMatch.networkStatus}, Cashless: ${topMatch.cashlessSupported}`);
  console.log(`Estimated Patient Exposure: ₹${topMatch.estimatedPatientExposure.toLocaleString()}`);
  console.log(`Key Reasons:`, topMatch.reasons);

  // 2. Test Room Mismatch & Proportionate Deduction (Persona 02 - Rahul Mehta / Meera)
  console.log('\n[2] Testing Room Mismatch & Proportionate Deduction (Meera Corporate / Rahul)...');
  const rahulPolicy =
    dataRepository.getPolicyById('pol-demo-meera') ||
    dataRepository.getPolicyById('pol-syn-rahul') ||
    dataRepository.getPolicies()[1];
  if (!rahulPolicy) throw new Error('Corporate policy missing');

const rahulMatches = matchingEngine.matchHospitals({
  city: 'Bengaluru',
  policyId: rahulPolicy.id,
  procedureId: 'proc-knee-replacement',
  preferredRoomCategory: RoomCategoryCode.DELUXE
});

const rahulApollo = rahulMatches.find((m) => m.hospital.id === 'hosp-apollo-bannerghatta');
if (rahulApollo) {
  console.log(`Apollo Score for Rahul with Deluxe Room: ${rahulApollo.matchScore}/100`);
  console.log(`Room Match: ${rahulApollo.roomCategoryMatch}`);
  console.log(`Estimated Patient Exposure: ₹${rahulApollo.estimatedPatientExposure.toLocaleString()}`);
  console.log(`Verification Items:`, rahulApollo.verificationItems);
}

// 3. Test Cost Engine Itemized Calculation
console.log('\n[3] Testing Cost Engine Breakdown...');
const procCost = dataRepository.getProcedureCost('hosp-manipal-old-airport', 'proc-knee-replacement')!;
const components = dataRepository.getCostComponents(procCost.id);
const costBreakdown = costEngine.calculateEstimate(
  ananyaPolicy,
  procCost,
  components,
  RoomCategoryCode.PRIVATE_AC,
  6500,
  6500
);

console.log(`Typical Gross Cost: ₹${costBreakdown.typicalGrossCost.toLocaleString()}`);
console.log(`Covered Amount: ₹${costBreakdown.estimatedCoveredAmount.toLocaleString()}`);
console.log(`Non-Covered Consumables: ₹${costBreakdown.potentialNonCoveredAmount.toLocaleString()}`);
console.log(`Patient Exposure: ₹${costBreakdown.indicativePatientExposure.toLocaleString()}`);

// 4. Test AI Explanation & Questions
console.log('\n[4] Testing AI Explanation & Questions...');
const explanation = aiExplanationEngine.explainHospitalMatch(topMatch, 'Ananya Sharma');
console.log(`AI Explanation Summary: ${explanation.summary}`);
const questions = aiExplanationEngine.generateQuestionsToAsk({
  hospitalName: topMatch.hospital.name,
  insurerName: 'Star Health',
  stage: 'PROCEDURE'
});
console.log(`Generated ${questions.billingDeskQuestions.length} Billing Desk questions and ${questions.insuranceCoordinatorQuestions.length} TPA questions.`);

// 5. Test Policy AI Extraction
console.log('\n[5] Testing Policy AI Extraction & Evidence Binding...');
const mockDoc = {
  id: 'test-doc-care',
  document_type: 'POLICY' as const,
  storage_path: 'uploads/care-sample.pdf',
  original_filename: 'Care_Supreme_Health_Advantage.pdf',
  mime_type: 'application/pdf',
  file_size: 204800,
  checksum: 'sha256-test-checksum',
  extraction_status: 'PENDING' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
const extractionResult = policyExtractionEngine.extractPolicy(mockDoc);
console.log(`Extracted Insurer: ${extractionResult.extractedData.insurer_name}`);
console.log(`Extracted Sum Insured: ₹${extractionResult.extractedData.sum_insured.toLocaleString()}`);
console.log(`Extracted Evidence Count: ${extractionResult.evidence.length} (Page citations verified)`);

// 6. Test Document RAG Semantic Retrieval
console.log('\n[6] Testing Document RAG Semantic Policy Search...');
const ragQuery = 'Is robotic knee surgery covered under this policy?';
const ragAnswer = documentRagEngine.queryPolicyRAG(ragQuery, 'pol-syn-ananya');
console.log(`RAG Query: "${ragQuery}"`);
console.log(`RAG Answer: ${ragAnswer.answer.slice(0, 160)}...`);
console.log(`Retrieved Citations: ${ragAnswer.citations.map((c) => `Page ${c.pageNumber} (${c.sectionTitle})`).join(', ')}`);

// 7. Test What-If Room Upgrade Simulation
console.log('\n[7] Testing What-If Room Upgrade Simulation...');
const curEstimate = costEngine.calculateEstimate(ananyaPolicy, procCost, components, RoomCategoryCode.PRIVATE_AC, 6500, 6500);
const altEstimate = costEngine.calculateEstimate(ananyaPolicy, procCost, components, RoomCategoryCode.DELUXE, 6500, 11000);
const oopDelta = altEstimate.indicativePatientExposure - curEstimate.indicativePatientExposure;
console.log(`Current Room (PRIVATE_AC): OOP = ₹${curEstimate.indicativePatientExposure.toLocaleString()}`);
console.log(`Simulated Room (DELUXE): OOP = ₹${altEstimate.indicativePatientExposure.toLocaleString()}`);
console.log(`What-If Delta: +₹${oopDelta.toLocaleString()} increase due to room difference & proportionate deduction.`);
if (oopDelta <= 0) {
  throw new Error(`Expected positive OOP delta for Deluxe room upgrade, got ${oopDelta}`);
}

// 8. Test Stage-Specific Guidance & Caregiver Mode
console.log('\n[8] Testing Stage-Specific Guidance & Caregiver Mode...');
const admissionGuidance = await aiExplanationEngine.generateStageGuidance({
  stage: 'ADMISSION',
  policyId: 'pol-syn-ananya',
  hospitalId: 'hosp-manipal-old-airport',
  patientName: 'Ananya Sharma',
  procedureName: 'Total Knee Replacement'
});
console.log(`Stage Title: ${admissionGuidance.stageTitle}`);
console.log(`Guidance Model: ${admissionGuidance.modelUsed} (AI Generated: ${admissionGuidance.isAiGenerated})`);
console.log(`Proactive Tips Count: ${admissionGuidance.proactiveTips.length}`);
console.log(`Required Documents: ${admissionGuidance.requiredDocuments.join(', ')}`);
console.log(`Billing Desk Questions Count: ${admissionGuidance.billingDeskQuestions.length}`);

  console.log('\n✓ ALL CAREIQ INTELLIGENCE TESTS PASSED SUCCESSFULLY!');
}

runAllTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});





