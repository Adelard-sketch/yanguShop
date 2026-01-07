const axios = require('axios');
(async ()=>{
  try{
    const res = await axios.get('http://localhost:4000/api/products');
    console.log('status', res.status);
    console.log(JSON.stringify(res.data).slice(0,1000));
  }catch(e){
    if(e.response){
      console.error('Response error status', e.response.status);
      try{ console.error(JSON.stringify(e.response.data)); }catch(err){ console.error(e.response.data); }
    } else {
      console.error('Error', e.message);
    }
    process.exit(1);
  }
})();
