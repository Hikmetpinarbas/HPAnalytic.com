/**
 * HPAnalytic source-of-truth exchange format v1.
 * Pure, browser-compatible selectors: Python produces records; SVG/JS keeps interactivity.
 * No synthetic minutes, tracking, receiver links or inferred metres.
 */
export const SPATIAL_AXES=Object.freeze({
 length:[0,35,70,105],
 width:[0,13.6,27.2,40.8,54.4,68],
 zone_names:['Bölge 1','Bölge 2','Bölge 3'],
 corridor_names:['Sol dış','Sol iç','Merkez','Sağ iç','Sağ dış']
});
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
export function validateAnalysisEnvelope(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Envelope must be object');
 if(input.schema_version!=='hpa.analytics.v1')throw new TypeError('Unsupported analytics schema');
 if(!Array.isArray(input.events))throw new TypeError('events must be array');
 const ids=new Set();
 for(const e of input.events){
   if(!e||typeof e!=='object'||typeof e.id!=='string'||!e.id.trim()||ids.has(e.id))throw new TypeError('Invalid or duplicated event id');
   ids.add(e.id);
   if(typeof e.source_match_id!=='string'||!e.source_match_id.trim())throw new TypeError('Missing source_match_id');
   if(!['minute','half','unknown'].includes(e.timestamp_precision))throw new TypeError('Missing timestamp_precision');
   if(!Number.isFinite(e.x)||e.x<0||e.x>105||!Number.isFinite(e.y)||e.y<0||e.y>68)throw new RangeError('Invalid normalized position');
   if(e.timestamp_precision==='minute'&&!Number.isFinite(e.minute))throw new TypeError('Minute precision without minute');
   if(e.timestamp_precision!=='minute'&&own(e,'minute')&&e.minute!==null)throw new TypeError('Do not invent minute');
   if(e.half!==null&&e.half!==1&&e.half!==2)throw new TypeError('Invalid half');
 }
 return input;
}
export function selectSpatialEvents(envelope,filters={}){
 validateAnalysisEnvelope(envelope);
 const {zone='all',corridor='all',half='all',type='all',source_match_id='all',minuteBin='all'}=filters;
 if(minuteBin!=='all'&&!Number.isInteger(Number(minuteBin)))throw new TypeError('Invalid minute bin');
 return envelope.events.filter(e=>{
   const z=Math.min(2,Math.floor(Math.min(e.x,104.99999)/35));
   const c=Math.min(4,Math.floor(Math.min(e.y,67.99999)/13.6));
   if(zone!=='all'&&Number(zone)!==z)return false;
   if(corridor!=='all'&&Number(corridor)!==c)return false;
   if(half!=='all'&&Number(half)!==e.half)return false;
   if(type!=='all'&&type!==e.type)return false;
   if(source_match_id!=='all'&&source_match_id!==e.source_match_id)return false;
   if(minuteBin!=='all'&&(e.timestamp_precision!=='minute'||Math.floor(e.minute/15)!==Number(minuteBin)))return false;
   return true;
 });
}
