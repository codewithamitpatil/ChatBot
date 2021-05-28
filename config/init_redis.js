
const redis    = require('redis');
const url = require("url");

const client = redis.createClient(new url.URL(process.env.REDISTOGO_URL));


client.on('connect',async()=>{
  console.log('redis connected 11');
});

client.on('error',async(err)=>{
  console.log(err.message);
});

client.on('end',async()=>{
  console.log('redis end 111');
});

process.on('SIGINT',()=>{
   client.quit();
   process.exit(0);
});

module.exports = client;



