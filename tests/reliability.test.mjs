import {test} from "node:test";
import assert from "node:assert/strict";
import {StealthBridgeClient,ApiError} from "../dist/index.js";
const HASH="a".repeat(64);
const client=(handler,opts={})=>new StealthBridgeClient({apiBaseUrl:"https://api.example",
 network:"testnet",fetchImpl:handler,...opts});
test("rejects incorrect network returned by a compromised service",async()=>{
 const api=client(async()=>new Response(JSON.stringify({network:"public",passphrase:"Public Global Stellar Network ; September 2015",
 source:"stellar-rpc",protocol_version:27,ledger_sequence:1,ledger_hash:HASH,ledger_closed_at_unix:"1"})));
 await assert.rejects(api.network(),e=>e instanceof ApiError&&e.status===502);
});
test("surfaces malformed, excessive, or unexpected JSON",async()=>{
 for(const body of ["broken json",JSON.stringify({payments_enabled:true}),"x".repeat(65537)]){
  const api=client(async()=>new Response(body));
  await assert.rejects(api.capabilities(),e=>e instanceof ApiError&&e.status===502);
 }
});
test("explicit abort is propagated without any fabricated response",async()=>{
 const controller=new AbortController();
 const api=client((_url,options)=>new Promise((_resolve,reject)=>{
  options.signal.addEventListener("abort",()=>reject(options.signal.reason),{once:true});
 }));
 const pending=api.corridors({signal:controller.signal});
 controller.abort();
 await assert.rejects(pending);
});
test("rejects credentials in API endpoint and unreasonable timeouts",()=>{
 assert.throws(()=>client(fetch,{timeoutMs:99}),/timeoutMs/);
 assert.throws(()=>new StealthBridgeClient({apiBaseUrl:"https://user:password@api.example",
  network:"testnet"}),/credentials/);
});
