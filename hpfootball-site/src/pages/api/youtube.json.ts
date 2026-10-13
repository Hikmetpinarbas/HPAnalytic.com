import type {APIRoute} from 'astro';
export const GET:APIRoute=async({locals})=>{
  const env=(locals as any).runtime?.env ?? {};
  const key=env.YOUTUBE_API_KEY; const channel=env.YOUTUBE_CHANNEL_ID || 'UCCTW85AzLAgwIDV_lPHXyYg';
  if(!key) return new Response(JSON.stringify({status:'not_configured',message:'YOUTUBE_API_KEY secret is not configured'}),{status:503,headers:{'content-type':'application/json'}});
  const url=new URL('https://www.googleapis.com/youtube/v3/search'); url.searchParams.set('key',key);url.searchParams.set('channelId',channel);url.searchParams.set('part','snippet');url.searchParams.set('order','date');url.searchParams.set('maxResults','6');url.searchParams.set('type','video');
  const r=await fetch(url); const data=await r.json();
  return new Response(JSON.stringify(data),{status:r.status,headers:{'content-type':'application/json','cache-control':'public,max-age=600'}});
};