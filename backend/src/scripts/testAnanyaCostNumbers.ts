import { dataRepository } from '../services/dataRepository';
import { costEngine } from '../services/costEngine';
import { RoomCategoryCode } from '../types/domain';

async function testAnanyaDemoNumbers() {
  console.log('\n===============================================================');
  console.log('       Testing Ananya Sharma Demo Cost Breakdown & What-If     ');
  console.log('===============================================================\n');

  await dataRepository.ensureDataLoaded();

  const policy = dataRepository.getPolicyById('pol-demo-ananya');
  const procCost = dataRepository.getProcedureCost('hosp-manipal-old-airport', 'proc-knee-replacement');
  const components = procCost ? dataRepository.getCostComponents(procCost.id) : [];

  console.log('Policy:', policy?.policy_name, 'Sum Insured:', policy?.sum_insured);
  console.log('Procedure:', procCost?.procedure_id, 'Typical Cost:', procCost?.typical_cost);
  console.log('Itemized Components:');
  components.forEach((c) => {
    console.log(`  - ${c.component_name}: ₹${c.estimated_amount.toLocaleString()} (Covered: ${c.coverage_candidate})`);
  });

  // 1. Estimate in Private AC (Entitled Room)
  const estPrivate = costEngine.calculateEstimate(
    policy,
    procCost,
    components,
    RoomCategoryCode.PRIVATE_AC,
    6500,
    6500
  );

  console.log('\n[Private AC Estimate]');
  console.log('Total Gross Bill:        ₹' + estPrivate.typicalGrossCost.toLocaleString());
  console.log('Insurer Covered:         ₹' + estPrivate.estimatedCoveredAmount.toLocaleString());
  console.log('Non-Covered Consumables: ₹' + estPrivate.potentialNonCoveredAmount.toLocaleString());
  console.log('Patient Out-of-Pocket:   ₹' + estPrivate.indicativePatientExposure.toLocaleString());

  // 2. Estimate in Deluxe Suite / Deluxe (Upgraded Room)
  const estDeluxe = costEngine.calculateEstimate(
    policy,
    procCost,
    components,
    RoomCategoryCode.DELUXE,
    6500,
    11000
  );

  console.log('\n[Deluxe Suite / Deluxe Room Estimate]');
  console.log('Total Gross Bill:        ₹' + estDeluxe.typicalGrossCost.toLocaleString());
  console.log('Insurer Covered:         ₹' + estDeluxe.estimatedCoveredAmount.toLocaleString());
  console.log('Non-Covered Amount:      ₹' + estDeluxe.potentialNonCoveredAmount.toLocaleString());
  console.log('Patient Out-of-Pocket:   ₹' + estDeluxe.indicativePatientExposure.toLocaleString());

  console.log('\n[What-If Jump]');
  console.log(`₹${estPrivate.indicativePatientExposure.toLocaleString()} ➔ ₹${estDeluxe.indicativePatientExposure.toLocaleString()}`);
  console.log(`Delta: +₹${(estDeluxe.indicativePatientExposure - estPrivate.indicativePatientExposure).toLocaleString()}`);

  if (estPrivate.indicativePatientExposure === 11000 && estDeluxe.indicativePatientExposure === 80546) {
    console.log('\n✅ VERIFICATION PASSED: Exact match with recording script (₹11,000 ➔ ₹80,546)!');
  } else {
    console.error('\n❌ MISMATCH: Check calculation.');
  }
}

testAnanyaDemoNumbers();
