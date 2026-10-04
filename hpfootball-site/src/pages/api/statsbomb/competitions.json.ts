import type {APIRoute} from 'astro';
export const GET:APIRoute=async()=>{
  const source='https://raw.githubusercontent.com/statsbomb/open-data/master/data/competitions.json';
  const r=await fetch(source,{headers:{'user-agent':'HP-Football/1.0'}});
  const data=await r.json();
  return new Response(JSON.stringify({source:'StatsBomb Open Data',source_url:source,claim_ceiling:'PROVIDER_OPEN_DATA',data}),{
    status:r.status,
    headers:{'content-type':'application/json','cache-control':'public,max-age=3600'}
  });
};