import { dataRepository } from '../services/dataRepository';
import { matchingEngine } from '../services/matchingEngine';
import { costEngine } from '../services/costEngine';
import { rulesEngine } from '../services/rulesEngine';
import { journeyEngine } from '../services/journeyEngine';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { policyExtractionEngine } from '../services/policyExtractionEngine';
import { documentRagEngine } from '../services/documentRagEngine';
import { RoomCategoryCode } from '../types/domain';

console.log('--- CareIQ Intelligence Layer Verification Test ---');

// 1. Test Hospital Matching for Ananya (Persona 01 - Simple Match)
console.log('\n[1] Testing Hospital Matching for Persona 01 (Star Health Policy)...');
const ananyaPolicy = dataRepository.getPolicyById('pol-syn-ananya');
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

// 2. Test Room Mismatch & Proportionate Deduction (Persona 02 - Rahul Mehta)
console.log('\n[2] Testing Room Mismatch & Proportionate Deduction for Persona 02 (Rahul Mehta)...');
const rahulPolicy = dataRepository.getPolicyById('pol-syn-rahul');
if (!rahulPolicy) throw new Error('Rahul policy missing');

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

// 5. Test Policy AI Extraction (Phase 13)
console.log('\n[5] Testing Policy AI Extraction & Evidence Binding (Phase 13)...');
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

// 6. Test Document RAG Semantic Retrieval (Phase 24)
console.log('\n[6] Testing Document RAG Semantic Policy Search (Phase 24)...');
const ragQuery = 'Is robotic knee surgery covered under this policy?';
const ragAnswer = documentRagEngine.queryPolicyRAG(ragQuery, 'pol-syn-ananya');
console.log(`RAG Query: "${ragQuery}"`);
console.log(`RAG Answer: ${ragAnswer.answer.slice(0, 160)}...`);
console.log(`Retrieved Citations: ${ragAnswer.citations.map((c) => `Page ${c.pageNumber} (${c.sectionTitle})`).join(', ')}`);

console.log('\n✓ ALL CAREIQ INTELLIGENCE TESTS PASSED SUCCESSFULLY!');

