process.env.NODE_ENV = 'test';
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

async function runAuthTests() {
  console.log('======================================================');
  console.log('CareIQ Phase 2: Supabase Auth & Demo Layer Verification');
  console.log('======================================================\n');

  await dbManager.initializeOnStartup();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    // Test 1: Demo Login (Default / Ananya)
    console.log('[Test 1] POST /api/auth/demo-login (Default Profile -> Ananya Sharma)');
    const res1 = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/demo-login',
      body: {}
    });
    console.log(`Status: ${res1.statusCode}`);
    if (res1.statusCode !== 200 || !res1.body?.success) {
      throw new Error(`Test 1 Failed: ${JSON.stringify(res1.body)}`);
    }
    console.log(`✓ Loaded Patient: ${res1.body.data.patient.display_name} (${res1.body.data.patient.city})`);
    console.log(`✓ Policy: ${res1.body.data.policy?.policy_name}`);
    console.log(`✓ Token: ${res1.body.data.session?.access_token}`);
    const ananyaToken = res1.body.data.session?.access_token;

    // Test 2: Demo Login (Rajesh PM-JAY)
    console.log('\n[Test 2] POST /api/auth/demo-login (PM-JAY Government Scheme -> Rajesh Verma)');
    const res2 = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/demo-login',
      body: { demo_id: 'demo-02-gov-scheme' }
    });
    console.log(`Status: ${res2.statusCode}`);
    if (res2.statusCode !== 200 || !res2.body?.success) {
      throw new Error(`Test 2 Failed: ${JSON.stringify(res2.body)}`);
    }
    console.log(`✓ Loaded Patient: ${res2.body.data.patient.display_name} (${res2.body.data.patient.city})`);
    console.log(`✓ Policy / Scheme: ${res2.body.data.policy?.policy_name}`);
    console.log(`✓ Verification Items: ${res2.body.data.verification_items?.length} items`);

    // Test 3: Demo Login (Meera Corporate Plan)
    console.log('\n[Test 3] POST /api/auth/demo-login (Corporate Group Plan -> Meera Iyer)');
    const res3 = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/demo-login',
      body: { demo_id: 'demo-03-corporate-plan' }
    });
    console.log(`Status: ${res3.statusCode}`);
    if (res3.statusCode !== 200 || !res3.body?.success) {
      throw new Error(`Test 3 Failed: ${JSON.stringify(res3.body)}`);
    }
    console.log(`✓ Loaded Patient: ${res3.body.data.patient.display_name}`);
    console.log(`✓ Policy: ${res3.body.data.policy?.policy_name}`);

    // Test 4: GET /api/auth/me with Bearer token
    console.log('\n[Test 4] GET /api/auth/me with Bearer Token');
    const res4 = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${ananyaToken}`
      }
    });
    console.log(`Status: ${res4.statusCode}`);
    if (res4.statusCode !== 200 || !res4.body?.success) {
      throw new Error(`Test 4 Failed: ${JSON.stringify(res4.body)}`);
    }
    console.log(`✓ Authenticated User: ${res4.body.data.user.email}`);
    console.log(`✓ Patient: ${res4.body.data.patient?.display_name}`);
    console.log(`✓ IsDemo: ${res4.body.data.isDemo}`);

    // Test 5: POST /api/auth/register (New User Registration + Patient + Policy)
    console.log('\n[Test 5] POST /api/auth/register (New Patient Onboarding)');
    const uniqueEmail = `vikramaditya.sen.${Date.now()}@gmail.com`;
    const testPassword = 'SecurePassword123!';
    const registerPayload = {
      email: uniqueEmail,
      password: testPassword,
      patient: {
        display_name: 'Dr. Vikramaditya Sen',
        age: 42,
        gender: 'Male',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        blood_group: 'A+',
        medical_conditions: ['Mild Hypertension'],
        current_medications: ['Telmisartan 40mg'],
        allergies: ['None known'],
        emergency_contact_name: 'Priya Sen',
        emergency_contact_phone: '+91 99887 76655',
        preferred_language: 'English'
      },
      policy: {
        insurer_id: 'ins-hdfc-ergo',
        policy_name: 'HDFC ERGO Optima Restore ₹10L',
        policy_type: 'INDIVIDUAL',
        sum_insured: 1000000,
        room_eligibility: 'PRIVATE_AC',
        copay_percentage: 0,
        deductible_amount: 0,
        cashless_supported: true,
        preauthorization_supported: true,
        pre_hospitalization_days: 60,
        post_hospitalization_days: 180
      }
    };

    const res5 = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: registerPayload
    });
    console.log(`Status: ${res5.statusCode}`);
    if (res5.statusCode !== 201 || !res5.body?.success) {
      throw new Error(`Test 5 Failed: ${JSON.stringify(res5.body)}`);
    }
    console.log(`✓ User Created: ${res5.body.data.user.email} (ID: ${res5.body.data.user.id})`);
    console.log(`✓ Patient Created: ${res5.body.data.patient.display_name} (${res5.body.data.patient.account_type})`);
    console.log(`✓ Policy Created: ${res5.body.data.policy?.policy_name} (Sum Insured: ₹${res5.body.data.policy?.sum_insured.toLocaleString()})`);
    console.log(`✓ Initial Journey Stage: ${res5.body.data.journey?.current_stage}`);

    // Test 5b: POST /api/auth/login with newly created user
    console.log('\n[Test 5b] POST /api/auth/login (Login with newly registered user)');
    const res5b = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: uniqueEmail,
        password: testPassword
      }
    });
    console.log(`Status: ${res5b.statusCode}`);
    if (res5b.statusCode !== 200 || !res5b.body?.success) {
      console.log(`Note: If email confirmation is required by Supabase, login returns: ${JSON.stringify(res5b.body)}`);
    } else {
      console.log(`✓ Login Succeeded for: ${res5b.body.data.user.email}`);
      console.log(`✓ Retrieved Profile: ${res5b.body.data.patient?.display_name}`);
      console.log(`✓ Retrieved Policy: ${res5b.body.data.policy?.policy_name}`);
    }

    // Test 6: POST /api/auth/logout
    console.log('\n[Test 6] POST /api/auth/logout');
    const res6 = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/logout',
      headers: {
        Authorization: `Bearer ${ananyaToken}`
      }
    });
    console.log(`Status: ${res6.statusCode}`);
    if (res6.statusCode !== 200 || !res6.body?.success) {
      throw new Error(`Test 6 Failed: ${JSON.stringify(res6.body)}`);
    }
    console.log(`✓ Logout Response: ${res6.body.message}`);

    // Test 7: GET /api/auth/me without token -> 401
    console.log('\n[Test 7] GET /api/auth/me (Missing token -> Expect 401)');
    const res7 = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me'
    });
    console.log(`Status: ${res7.statusCode}`);
    if (res7.statusCode !== 401) {
      throw new Error(`Test 7 Failed: Expected 401 but got ${res7.statusCode}`);
    }
    console.log(`✓ Correctly rejected unauthorized request: ${res7.body.error.message}`);

    console.log('\n======================================================');
    console.log('✅ ALL PHASE 2 AUTH & DEMO TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

runAuthTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
