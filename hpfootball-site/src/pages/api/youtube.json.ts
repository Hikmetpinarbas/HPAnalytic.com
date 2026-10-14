import type {APIRoute} from 'astro';
import { env } from 'cloudflare:workers';
import { FEATURES } from '../../lib/feature-flags.mjs';
export const GET:APIRoute=async()=>{
  if (!FEATURES.youtubeFeed) {
    return new Response(JSON.stringify({status:'disabled',message:'YouTube feed is temporarily disabled'}), {status:404,headers:{'content-type':'application/json','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
  }
  const key=env.YOUTUBE_API_KEY; const channel=env.YOUTUBE_CHANNEL_ID || 'UCCTW85AzLAgwIDV_lPHXyYg';
  if(!key) return new Response(JSON.stringify({status:'not_configured',message:'YOUTUBE_API_KEY secret is not configured'}),{status:503,headers:{'content-type':'application/json'}});
  const url=new URL('https://www.googleapis.com/youtube/v3/search'); url.searchParams.set('key',key);url.searchParams.set('channelId',channel);url.searchParams.set('part','snippet');url.searchParams.set('order','date');url.searchParams.set('maxResults','6');url.searchParams.set('type','video');
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return new Response(JSON.stringify({status:'error',message:'YouTube upstream request failed'}), {status:502,headers:{'content-type':'application/json','cache-control':'no-store'}});
    }
    const data = await r.json();
    return new Response(JSON.stringify(data), {status:200,headers:{'content-type':'application/json','cache-control':'public,max-age=600'}});
  } catch (error) {
    return new Response(JSON.stringify({status:'error',message:'YouTube request could not be completed'}), {status:500,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }
};
