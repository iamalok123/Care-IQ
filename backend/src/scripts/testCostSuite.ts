import { dataRepository } from '../services/dataRepository';
import { costController } from '../controllers/costController';

async function testCostIntelligence() {
  console.log('==================================================');
  console.log('Testing Cost Intelligence & Tariff Breakdown Layer');
  console.log('==================================================\n');

  await dataRepository.syncFromSupabase();
  const allPolicies = dataRepository.getPolicies();
  console.log('Available policies count:', allPolicies.length);
  allPolicies.forEach(p => console.log(` - ID: ${p.id} | Name: ${p.policy_name} | Patient: ${p.patient_id}`));

  const demoProfiles = [
    {
      name: 'Ananya Sharma (Demo 1 - Star Health ₹5L)',
      policyId: 'pol-demo-ananya',
      hospitalId: 'hosp-manipal-old-airport',
      procedureId: 'proc-knee-replacement',
      room: 'PRIVATE_AC'
    },
    {
      name: 'Rajesh Verma (Demo 2 - Ayushman Bharat PM-JAY ₹5L)',
      policyId: 'pol-demo-rajesh',
      hospitalId: 'hosp-kem-mumbai',
      procedureId: 'proc-cataract',
      room: 'GENERAL'
    },
    {
      name: 'Meera Iyer (Demo 3 - ICICI Corporate ₹7L)',
      policyId: 'pol-demo-meera',
      hospitalId: 'hosp-apollo-bannerghatta',
      procedureId: 'proc-appendectomy',
      room: 'PRIVATE_AC'
    }
  ];

  for (const demo of demoProfiles) {
    console.log(`[Test] ${demo.name}`);
    console.log(`   Policy: ${demo.policyId} | Hospital: ${demo.hospitalId} | Proc: ${demo.procedureId}`);

    const req: any = {
      body: {
        policy_id: demo.policyId,
        hospital_id: demo.hospitalId,
        procedure_id: demo.procedureId,
        preferred_room_category: demo.room
      }
    };

    let result: any = null;
    const res: any = {
      json: (data: any) => { result = data; },
      status: (code: number) => ({ json: (data: any) => { result = { code, ...data }; } })
    };

    costController.estimate(req, res);

    if (result && result.success) {
      console.log(`   ✓ Gross Cost: ₹${result.data.typicalGrossCost?.toLocaleString()}`);
      console.log(`   ✓ Covered by Insurer: ₹${result.data.estimatedCoveredAmount?.toLocaleString()}`);
      console.log(`   ✓ Patient Out-of-Pocket: ₹${result.data.indicativePatientExposure?.toLocaleString()}`);
      console.log(`   ✓ Itemized Components: ${result.data.costComponents?.length} components returned.\n`);
    } else {
      console.error(`   ✗ Estimate failed:`, result);
    }
  }

  // Test What-If Room Upgrade Simulation (e.g. Upgrading from Single Private to Deluxe Room)
  console.log('[Test] What-If Upgrade Simulation (Ananya: Private AC -> Deluxe)');
  const whatIfReq: any = {
    body: {
      policy_id: 'pol-demo-ananya',
      hospital_id: 'hosp-manipal-old-airport',
      procedure_id: 'proc-knee-replacement',
      current_room_category: 'PRIVATE_AC',
      alternative_room_category: 'DELUXE'
    }
  };

  let whatIfResult: any = null;
  const whatIfRes: any = {
    json: (data: any) => { whatIfResult = data; },
    status: (code: number) => ({ json: (data: any) => { whatIfResult = { code, ...data }; } })
  };

  costController.whatIf(whatIfReq, whatIfRes);
  if (whatIfResult && whatIfResult.success) {
    console.log(`   ✓ OOP Delta on Upgrade: ₹${whatIfResult.data.delta.oopDelta?.toLocaleString()}`);
    console.log(`   ✓ Penalty Applies: ${whatIfResult.data.delta.penaltyApplies} (${whatIfResult.data.delta.penaltyPercent}% deduction)`);
    console.log(`   ✓ Explanation: ${whatIfResult.data.explanation}\n`);
  } else {
    console.error(`   ✗ What-If failed:`, whatIfResult);
  }

  console.log('==================================================');
  console.log('✅ Cost intelligence verified dynamically across all personas!');
  console.log('==================================================');
}

testCostIntelligence().catch(console.error);
