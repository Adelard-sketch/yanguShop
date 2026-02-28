(async ()=>{
  try {
    const loginRes = await fetch('http://localhost:4000/api/auth/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'adelborauzima@gmail.com', password: 'AdelMirab1$' })
    });
    const login = await loginRes.json();
    if (!login.token) { console.error('login failed', login); process.exit(1); }
    const token = login.token;
    const agentId = '695ce352a7630da626604e78';
    const res = await fetch(`http://localhost:4000/api/agents/${agentId}/approve`,{
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Approved via test script' })
    });
    const data = await res.json();
    console.log('approve response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('error', e);
    process.exit(1);
  }
})();
