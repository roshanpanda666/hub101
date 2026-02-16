const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  console.log(`Attempting to register user: ${email}`);
  
  // 1. Register
  try {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    console.log(`Register Status: ${registerRes.status}`);
    const registerData = await registerRes.json();
    console.log('Register Body:', registerData);

    if (!registerRes.ok) {
        console.error('Registration failed, aborting login test.');
        return;
    }
  } catch (e) {
      console.error('Registration network/server error:', e);
      return;
  }

  // 2. Login
  console.log(`\nAttempting to login user: ${email}`);
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log(`Login Status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    console.log('Login Body:', loginData);
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie Header:', cookies);
  } catch (e) {
      console.error('Login network/server error:', e);
  }
}

testAuth();
