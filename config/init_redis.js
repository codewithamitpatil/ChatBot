
const redis    = require('redis');
const url = require("url");

let client;

if (process.env.REDISTOGO_URL) {
 console.log('///////////');
var rtg   = new url.URL(process.env.REDISTOGO_URL);
client = require("redis").createClient(rtg.port, rtg.hostname);

client.auth(rtg.auth.split(":")[1]);

} else {
   client = require("redis").createClient();
}


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



