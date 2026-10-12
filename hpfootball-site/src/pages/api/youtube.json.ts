import type {APIRoute} from 'astro';
// Astro v6+ removed `locals.runtime.env`; Worker bindings and secrets come from `cloudflare:workers`.
import {env as workerEnv} from 'cloudflare:workers';
const json=(body:unknown,status:number,extra:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json',...extra}});
export const GET:APIRoute=async()=>{
  const env=(workerEnv ?? {}) as Record<string,string|undefined>;
  const key=env.YOUTUBE_API_KEY; const channel=env.YOUTUBE_CHANNEL_ID || 'UCCTW85AzLAgwIDV_lPHXyYg';
  if(!key) return json({status:'not_configured',message:'YOUTUBE_API_KEY secret is not configured'},503);
  const url=new URL('https://www.googleapis.com/youtube/v3/search'); url.searchParams.set('key',key);url.searchParams.set('channelId',channel);url.searchParams.set('part','snippet');url.searchParams.set('order','date');url.searchParams.set('maxResults','6');url.searchParams.set('type','video');
  try{
    const r=await fetch(url); const data=await r.json();
    return json(data,r.status,{'cache-control':'public,max-age=600'});
  }catch{
    return json({status:'upstream_unavailable',message:'YouTube API could not be reached'},502);
  }
};
