/**
 * Phase 1 verification — proves the backend truth layer against live Supabase
 * data without a browser.
 *
 * Run: npx tsx src/scripts/verifyPhase1.ts
 *
 * Checks, in order:
 *   1. enrichPolicy() resolves a real insurer name for every policy.
 *   2. Room tariffs come from each hospital's own tariff card.
 *   3. costController refuses a missing/unknown policy instead of quoting a
 *      stranger's cover, and refuses to assume a hospital or procedure.
 *   4. A real estimate matches costEngine's math, and the dashboard's old
 *      "co-pay on the whole sum insured" shortcut is shown for contrast.
 *   5. Coverage confidence for an empty request is low, not 100.
 */
import type { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { enrichPolicies, enrichPolicy, getHospitalCoverage } from '../services/enrichmentService';
import { getEligibleRoomTariff, getPublishedRoomTariffs } from '../services/tariffService';
import { aiExplanationEngine } from '../services/aiExplanationEngine';
import { costController } from '../controllers/costController';
import { RoomCategoryCode } from '../types/domain';

let failures = 0;

function check(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(title: string): void {
  console.log(`\n${'='.repeat(72)}\n${title}\n${'='.repeat(72)}`);
}

/** Minimal Express double: captures status + body from a controller call. */
function callController(
  handler: (req: Request, res: Response) => void,
  body: Record<string, unknown>,
  user?: Record<string, unknown>
): { status: number; body: any } {
  let status = 200;
  let payload: any;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json(data: any) {
      payload = data;
      return this;
    }
  } as unknown as Response;
  handler({ body, user, query: {}, params: {}, headers: {} } as unknown as Request, res);
  return { status, body: payload };
}

async function main(): Promise<void> {
  const synced = await dataRepository.syncFromSupabase();
  console.log(synced ? 'Synced from Supabase.' : 'WARNING: Supabase sync failed; using local JSON.');

  // ------------------------------------------------------------------
  section('1. Policy enrichment — insurer_name / scheme_type from the FK');
  // ------------------------------------------------------------------
  const policies = dataRepository.getPolicies();
  const enriched = enrichPolicies(policies);
  const unresolved = enriched.filter((p) => p.insurer_name === 'Insurer not on record');

  check(`all ${policies.length} policies resolve an insurer`, unresolved.length === 0,
    unresolved.map((p) => `${p.id} -> ${p.insurer_id}`).join(', '));

  const schemePolicies = enriched.filter((p) => p.is_government_scheme);
  check('PM-JAY / public policies flagged as government schemes', schemePolicies.length > 0);

  for (const id of ['pol-demo-ananya', 'pol-demo-meera', 'pol-demo-rajesh']) {
    const p = enriched.find((x) => x.id === id);
    if (!p) {
      check(`demo policy ${id} present`, false);
      continue;
    }
    console.log(
      `        ${id.padEnd(18)} ${p.insurer_name} | ${p.scheme_type} | govt=${p.is_government_scheme}`
    );
    check(`${id} has a non-empty insurer_name`, !!p.insurer_name && p.insurer_name.length > 3);
  }

  // ------------------------------------------------------------------
  section('2. Room tariffs come from each hospital, not one hardcoded table');
  // ------------------------------------------------------------------
  const OLD_HARDCODED: Record<string, number> = {
    GENERAL: 1800,
    SEMI_PRIVATE: 3500,
    PRIVATE_AC: 6500,
    DELUXE: 11000,
    SUITE: 22000
  };
  let differsFromHardcoded = 0;
  for (const hospital of dataRepository.getHospitals()) {
    const published = getPublishedRoomTariffs(hospital.id);
    const general = published.find((r) => r.code === RoomCategoryCode.GENERAL);
    if (general && general.tariff_per_day !== OLD_HARDCODED.GENERAL) differsFromHardcoded += 1;
    console.log(
      `        ${hospital.name.slice(0, 34).padEnd(36)} ${published
        .map((r) => `${r.code}:${r.tariff_per_day}`)
        .join('  ')}`
    );
  }
  check(
    'more than one hospital publishes a general-ward rate other than 1800',
    differsFromHardcoded >= 2,
    `only ${differsFromHardcoded} differ`
  );

  // ------------------------------------------------------------------
  section('3. costController refuses to substitute data it was not given');
  // ------------------------------------------------------------------
  const noPolicy = callController((q, s) => costController.estimate(q, s), {});
  check('missing policy_id -> 400 POLICY_ID_REQUIRED',
    noPolicy.status === 400 && noPolicy.body?.error?.code === 'POLICY_ID_REQUIRED',
    JSON.stringify(noPolicy.body?.error));

  const unknownPolicy = callController((q, s) => costController.estimate(q, s), {
    policy_id: 'pol-does-not-exist',
    hospital_id: 'hosp-manipal-old-airport',
    procedure_id: 'proc-knee-replacement'
  });
  check('unknown policy_id -> 404 POLICY_NOT_FOUND (no fallback to policies[0])',
    unknownPolicy.status === 404 && unknownPolicy.body?.error?.code === 'POLICY_NOT_FOUND',
    JSON.stringify(unknownPolicy.body?.error));

  const noContext = callController((q, s) => costController.estimate(q, s), {
    policy_id: 'pol-demo-ananya'
  });
  check('missing hospital_id/procedure_id -> 400 CONTEXT_REQUIRED',
    noContext.status === 400 && noContext.body?.error?.code === 'CONTEXT_REQUIRED',
    JSON.stringify(noContext.body?.error));

  const otherPatientsPolicy = callController(
    (q, s) => costController.estimate(q, s),
    {
      policy_id: 'pol-demo-meera',
      hospital_id: 'hosp-manipal-old-airport',
      procedure_id: 'proc-knee-replacement'
    },
    { id: 'pat-demo-ananya', account_type: 'NEW_USER', patient: { id: 'pat-demo-ananya' } }
  );
  check("another patient's policy -> 403 FORBIDDEN",
    otherPatientsPolicy.status === 403,
    JSON.stringify(otherPatientsPolicy.body?.error));

  const unavailableRoom = callController((q, s) => costController.estimate(q, s), {
    policy_id: 'pol-demo-rajesh',
    hospital_id: 'hosp-kem-mumbai',
    procedure_id: 'proc-knee-replacement',
    preferred_room_category: 'SUITE'
  });
  check('room the hospital does not publish -> 409 ROOM_TARIFF_NOT_ON_RECORD',
    unavailableRoom.status === 409 &&
      unavailableRoom.body?.error?.code === 'ROOM_TARIFF_NOT_ON_RECORD',
    JSON.stringify(unavailableRoom.body?.error));

  // ------------------------------------------------------------------
  section('4. Real estimates, and the dashboard shortcut they replace');
  // ------------------------------------------------------------------
  const cases = [
    { policy: 'pol-demo-ananya', hospital: 'hosp-manipal-old-airport', procedure: 'proc-knee-replacement' },
    { policy: 'pol-demo-meera', hospital: 'hosp-apollo-bannerghatta', procedure: 'proc-knee-replacement' },
    { policy: 'pol-demo-rajesh', hospital: 'hosp-kem-mumbai', procedure: 'proc-knee-replacement' }
  ];

  for (const c of cases) {
    const policy = dataRepository.getPolicyById(c.policy);
    if (!policy) {
      check(`policy ${c.policy} exists`, false);
      continue;
    }
    const result = callController((q, s) => costController.estimate(q, s), {
      policy_id: c.policy,
      hospital_id: c.hospital,
      procedure_id: c.procedure
    });

    if (result.status !== 200) {
      check(`estimate for ${c.policy} at ${c.hospital}`, false, JSON.stringify(result.body?.error));
      continue;
    }

    const d = result.body.data;
    const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
    // What Dashboard.tsx did: co-pay percentage applied to the whole sum insured.
    const oldDashboardCopay = Number(policy.sum_insured) * (Number(policy.copay_percentage) / 100);

    console.log(`\n        ${enrichPolicy(policy).insurer_name} — ${policy.policy_name}`);
    console.log(`        hospital           ${dataRepository.getHospitalById(c.hospital)?.name}`);
    console.log(`        room               ${d.context.room_category} @ ${inr(d.context.selected_room_tariff)}/day (cap ${inr(d.context.eligible_room_tariff)})`);
    console.log(`        gross cost         ${inr(d.typicalGrossCost)}`);
    console.log(`        covered            ${inr(d.estimatedCoveredAmount)}`);
    console.log(`        patient exposure   ${inr(d.indicativePatientExposure)}`);
    console.log(`        co-pay applied     ${inr(d.estimatedCopayAmount ?? 0)}   [old dashboard maths: ${inr(oldDashboardCopay)}]`);
    console.log(`        provenance         ${d.provenance.procedure_cost_source} / ${d.provenance.components_source} (estimated=${d.provenance.is_estimated})`);
    for (const note of d.provenance.notes) console.log(`        note               ${note}`);

    check(`${c.policy}: covered + exposure reconcile to gross`,
      Math.abs(d.estimatedCoveredAmount + d.indicativePatientExposure - d.typicalGrossCost) <= 1,
      `${d.estimatedCoveredAmount} + ${d.indicativePatientExposure} != ${d.typicalGrossCost}`);
    check(`${c.policy}: covered never exceeds remaining sum insured`,
      d.estimatedCoveredAmount <= Number(policy.remaining_sum_insured ?? policy.sum_insured));
    if (Number(policy.copay_percentage) > 0) {
      check(`${c.policy}: co-pay is charged on the claim, not the sum insured`,
        (d.estimatedCopayAmount ?? 0) < oldDashboardCopay,
        `engine ${d.estimatedCopayAmount} vs dashboard ${oldDashboardCopay}`);
    }
    check(`${c.policy}: room tariff matches this hospital's card`,
      getPublishedRoomTariffs(c.hospital).some(
        (r) => r.tariff_per_day === d.context.selected_room_tariff
      ));
  }

  // ------------------------------------------------------------------
  section('5. Coverage confidence reflects what is actually known');
  // ------------------------------------------------------------------
  const empty = aiExplanationEngine.calculateCoverageConfidence({});
  console.log(`        empty request      ${empty.totalScore}/100 — ${empty.ratingLabel}`);
  for (const [name, f] of Object.entries(empty.factors)) {
    console.log(`          ${name.padEnd(10)} ${String(f.score).padStart(2)}/${f.maxScore}  ${f.status}  ${f.label}`);
  }
  check('an empty request no longer scores 100', empty.totalScore < 100, `scored ${empty.totalScore}`);
  check('an empty request is not labelled high certainty',
    !empty.ratingLabel.toLowerCase().includes('high'), empty.ratingLabel);

  const ananyaJourney = dataRepository.getJourneyByPatientId('pat-demo-ananya');
  const grounded = aiExplanationEngine.calculateCoverageConfidence({
    policyId: 'pol-demo-ananya',
    hospitalId: ananyaJourney?.hospital_id || 'hosp-manipal-old-airport',
    patientId: 'pat-demo-ananya',
    procedureId: 'proc-knee-replacement',
    selectedRoomCategory: RoomCategoryCode.PRIVATE_AC
  });
  console.log(`\n        Ananya, grounded   ${grounded.totalScore}/100 — ${grounded.ratingLabel}`);
  for (const [name, f] of Object.entries(grounded.factors)) {
    console.log(`          ${name.padEnd(10)} ${String(f.score).padStart(2)}/${f.maxScore}  ${f.status}  ${f.label}`);
  }
  check('a grounded request scores above an empty one', grounded.totalScore > empty.totalScore);

  const ananyaPolicy = dataRepository.getPolicyById('pol-demo-ananya');
  const cov = getHospitalCoverage(
    ananyaJourney?.hospital_id || 'hosp-manipal-old-airport',
    ananyaPolicy?.insurer_id
  );
  console.log(
    `\n        network lookup     ${cov.network_status} cashless=${cov.cashless_available} preauth=${cov.preauth_required} missing=${cov.network_data_missing}`
  );
  const eligible = getEligibleRoomTariff('hosp-kem-mumbai', RoomCategoryCode.DELUXE);
  console.log(
    `        KEM cap for a DELUXE entitlement -> ${eligible?.code} @ ₹${eligible?.tariff_per_day}/day (KEM has no deluxe room)`
  );
  check('an entitlement above the hospital\'s top room falls back to its top room',
    eligible?.code === RoomCategoryCode.PRIVATE_AC, `got ${eligible?.code}`);

  console.log(`\n${'='.repeat(72)}`);
  console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification crashed:', err);
  process.exit(1);
});
