process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';
import http from 'http';
import app from '../index';
import { dbManager } from '../db/dbManager';

function makeRequest(
  server: http.Server,
  options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
  }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const address = server.address() as any;
    const port = address.port;

    const payload = options.body ? JSON.stringify(options.body) : null;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : null;
            resolve({
              statusCode: res.statusCode || 200,
              headers: res.headers,
              body: parsed
            });
          } catch {
            resolve({
              statusCode: res.statusCode || 200,
              headers: res.headers,
              body: rawData
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runPhase3Tests() {
  console.log('======================================================');
  console.log('CareIQ Phase 3: Schema & Controller Verification Test');
  console.log('======================================================\n');

  await dbManager.initializeOnStartup();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // 1. Test Onboarding: Demo Profiles
    console.log('[Test 1] GET /api/onboarding/demo-profiles');
    const res1 = await makeRequest(server, {
      method: 'GET',
      path: '/api/onboarding/demo-profiles'
    });
    console.log(`Status: ${res1.statusCode}`);
    if (res1.statusCode !== 200 || !res1.body?.success) {
      throw new Error(`Test 1 Failed: ${JSON.stringify(res1.body)}`);
    }
    const profiles = res1.body.data;
    console.log(`✓ Retrieved ${profiles.length} demo profiles.`);
    for (const p of profiles) {
      console.log(`   - ${p.patient.display_name} (${p.patient.city}) | Policy: ${p.policy?.policy_name || 'N/A'}`);
    }
    if (profiles.length < 3) throw new Error('Expected at least 3 curated demo profiles');

    // 2. Test Onboarding: Insurers
    console.log('\n[Test 2] GET /api/onboarding/insurers');
    const res2 = await makeRequest(server, {
      method: 'GET',
      path: '/api/onboarding/insurers'
    });
    console.log(`Status: ${res2.statusCode}`);
    if (res2.statusCode !== 200 || !res2.body?.success) {
      throw new Error(`Test 2 Failed: ${JSON.stringify(res2.body)}`);
    }
    const insurers = res2.body.data;
    console.log(`✓ Retrieved ${insurers.length} insurers and government schemes.`);
    console.log(`   - Examples: ${insurers.slice(0, 4).map((i: any) => i.name).join(', ')}`);

    // 3. Test Hospitals default scoping to Mumbai & Bengaluru
    console.log('\n[Test 3] GET /api/hospitals (Default Scoping)');
    const res3 = await makeRequest(server, {
      method: 'GET',
      path: '/api/hospitals'
    });
    console.log(`Status: ${res3.statusCode}`);
    if (res3.statusCode !== 200 || !res3.body?.success) {
      throw new Error(`Test 3 Failed: ${JSON.stringify(res3.body)}`);
    }
    const defaultHospitals = res3.body.data;
    const citiesFound = new Set(defaultHospitals.map((h: any) => h.city));
    console.log(`✓ Default hospitals count: ${defaultHospitals.length} across cities: [${Array.from(citiesFound).join(', ')}]`);

    // 3b. Test Hospitals filter by city
    console.log('\n[Test 3b] GET /api/hospitals?city=Mumbai');
    const res3b = await makeRequest(server, {
      method: 'GET',
      path: '/api/hospitals?city=Mumbai'
    });
    const mumbaiHospitals = res3b.body.data;
    console.log(`✓ Mumbai hospitals count: ${mumbaiHospitals.length}`);
    const kem = mumbaiHospitals.find((h: any) => h.id === 'hosp-kem-mumbai');
    if (!kem) throw new Error('KEM Hospital Mumbai missing in city filter');
    console.log(`✓ Confirmed KEM Hospital present: ${kem.name}`);

    // 4. Test Demo Profile Protection (Cannot Delete Demo Profile)
    console.log('\n[Test 4] DELETE /api/patients/pat-demo-ananya (Attempting to delete DEMO profile)');
    const res4 = await makeRequest(server, {
      method: 'DELETE',
      path: '/api/patients/pat-demo-ananya',
      headers: {
        Authorization: 'Bearer demo-token-pat-demo-ananya'
      }
    });
    console.log(`Status: ${res4.statusCode}`);
    if (res4.statusCode !== 400 || res4.body?.error?.code !== 'CANNOT_DELETE_DEMO') {
      throw new Error(`Test 4 Failed: Expected 400 CANNOT_DELETE_DEMO but got ${res4.statusCode}: ${JSON.stringify(res4.body)}`);
    }
    console.log(`✓ Demo profile deletion blocked correctly: ${res4.body.error.message}`);

    // 5. Create a NEW_USER Patient, Update Patient Profile, and Delete Patient Profile
    console.log('\n[Test 5] POST /api/auth/register (Create temporary NEW_USER patient for CRUD testing)');
    const uniqueEmail = `test.crud.${Date.now()}@gmail.com`;
    const regRes = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: uniqueEmail,
        password: 'Password123!',
        patient: {
          display_name: 'Aditi Deshmukh',
          age: 29,
          gender: 'Female',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          blood_group: 'AB+',
          medical_conditions: ['Migraine'],
          allergies: ['Shellfish']
        },
        policy: {
          insurer_id: 'ins-icici-lombard',
          policy_name: 'ICICI Lombard Complete Health',
          sum_insured: 750000,
          room_eligibility: 'PRIVATE_AC'
        }
      }
    });

    if (regRes.statusCode !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const newPatientId = regRes.body.data.patient.id;
    const newPolicyId = regRes.body.data.policy.id;
    const userToken = regRes.body.data.session?.access_token || `mock-token-${newPatientId}`;
    console.log(`✓ Created test patient: ${newPatientId} and policy: ${newPolicyId}`);

    // 6. Test PUT /api/patients/:id (Update Patient Profile)
    console.log('\n[Test 6] PUT /api/patients/:id (Update medical conditions and emergency contact)');
    const res6 = await makeRequest(server, {
      method: 'PUT',
      path: `/api/patients/${newPatientId}`,
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        age: 30,
        medical_conditions: ['Migraine', 'Mild Vitamin D Deficiency'],
        emergency_contact_name: 'Rohan Deshmukh',
        emergency_contact_phone: '+91 91234 56789'
      }
    });
    console.log(`Status: ${res6.statusCode}`);
    if (res6.statusCode !== 200 || !res6.body?.success) {
      throw new Error(`Test 6 Failed: ${JSON.stringify(res6.body)}`);
    }
    console.log(`✓ Updated Age: ${res6.body.data.age}`);
    console.log(`✓ Updated Conditions:`, res6.body.data.medical_conditions);
    console.log(`✓ Updated Contact: ${res6.body.data.emergency_contact_name}`);

    // 7. Test PUT /api/policies/:id (Update Policy details)
    console.log('\n[Test 7] PUT /api/policies/:id (Update Sum Insured and Copay)');
    const res7 = await makeRequest(server, {
      method: 'PUT',
      path: `/api/policies/${newPolicyId}`,
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        sum_insured: 900000,
        copay_percentage: 5
      }
    });
    console.log(`Status: ${res7.statusCode}`);
    if (res7.statusCode !== 200 || !res7.body?.success) {
      throw new Error(`Test 7 Failed: ${JSON.stringify(res7.body)}`);
    }
    console.log(`✓ Updated Sum Insured: ₹${res7.body.data.sum_insured.toLocaleString()}`);
    console.log(`✓ Updated Copay: ${res7.body.data.copay_percentage}%`);

    // 8. Test DELETE /api/policies/:id
    console.log('\n[Test 8] DELETE /api/policies/:id');
    const res8 = await makeRequest(server, {
      method: 'DELETE',
      path: `/api/policies/${newPolicyId}`,
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    console.log(`Status: ${res8.statusCode}`);
    if (res8.statusCode !== 200 || !res8.body?.success) {
      throw new Error(`Test 8 Failed: ${JSON.stringify(res8.body)}`);
    }
    console.log(`✓ ${res8.body.message}`);

    // 9. Test DELETE /api/patients/:id (Delete NEW_USER profile)
    console.log('\n[Test 9] DELETE /api/patients/:id (Delete NEW_USER profile)');
    const res9 = await makeRequest(server, {
      method: 'DELETE',
      path: `/api/patients/${newPatientId}`,
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    console.log(`Status: ${res9.statusCode}`);
    if (res9.statusCode !== 200 || !res9.body?.success) {
      throw new Error(`Test 9 Failed: ${JSON.stringify(res9.body)}`);
    }
    console.log(`✓ ${res9.body.message}`);

    console.log('\n======================================================');
    console.log('✅ ALL PHASE 3 BACKEND & CONTROLLER TESTS PASSED!');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

runPhase3Tests().catch((err) => {
  console.error('\n❌ Phase 3 Test Suite Failed:', err);
  process.exit(1);
});
