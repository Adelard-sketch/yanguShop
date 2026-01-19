// use global fetch (Node 18+)
(async()=>{
  try{
    const loginRes = await fetch('http://localhost:5001/api/auth/login',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: 'testcustomer@example.com', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    console.log('login', loginRes.status, loginData);
    const token = loginData.token;
      // decode payload for debugging
      try{
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('decoded payload', payload);
      }catch(e){ console.warn('failed decode', e); }
    const res = await fetch('http://localhost:5001/api/chats',{
      method:'POST', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify({ subject: 'chart test', category: 'general', message: '/chart please show sales' })
    });
    const data = await res.json();
    console.log('create chat', res.status, data);
  }catch(err){ console.error(err); process.exit(1);} 
})();
