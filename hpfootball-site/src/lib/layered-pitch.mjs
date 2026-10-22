/** HPAnalytic shared pitch coordinate and compositing model (meters, not pixels). */
export const PITCH=Object.freeze({length:105,width:68});
const TEAMS=new Set(['home','away']);
function number(n,label){if(typeof n!=='number'||!Number.isFinite(n))throw new TypeError(label+' must be finite');return n}
function coords({x,y}){number(x,'x');number(y,'y');if(x<0||x>105||y<0||y>68)throw new RangeError('Outside pitch');return {x,y}}
export function projectPoint(point,w,h){const {x,y}=coords(point);number(w,'w');number(h,'h');if(w<=0||h<=0)throw new RangeError('Viewport');return {x:x/105*w,y:y/68*h}}
export function normalizeEvent(event){
 if(!event||typeof event!=='object')throw new TypeError('Event required');
 const {id,team,type,minute,x,y}=event;
 if(typeof id!=='string'||!id||!TEAMS.has(team)||typeof type!=='string'||!type)throw new TypeError('Invalid event identity');
 number(minute,'minute');if(minute<0||minute>150)throw new RangeError('Minute');
 coords({x,y});
 if(event.endX!==undefined||event.endY!==undefined){if(event.endX===undefined||event.endY===undefined)throw new TypeError('End pair required');coords({x:event.endX,y:event.endY})}
 return Object.freeze({...event});
}
export function focusOpacity({family,selected,team,side='both',contextOpacity=.2}){
 number(contextOpacity,'contextOpacity');if(contextOpacity<0||contextOpacity>1)throw new RangeError('Opacity');
 return (side==='both'||side===team)?(family===selected?1:contextOpacity):(family===selected?.3:contextOpacity/3);
}
export function selectEvents(events,{side='both',type='all',startMinute=0,endMinute=150}={}){
 number(startMinute,'startMinute');number(endMinute,'endMinute');if(endMinute<startMinute)throw new RangeError('Interval');
 return events.filter(e=>(side==='both'||side===e.team)&&(type==='all'||type===e.type)&&e.minute>=startMinute&&e.minute<=endMinute);
}
