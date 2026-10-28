// Playback moves through source records; it does not model a ball trajectory.
export function nextPlayback(state,event,count) {
 if(!Number.isInteger(count)||count<1)return {index:0,playing:false};
 const index=Math.min(count-1,Math.max(0,Number.isInteger(state.index)?state.index:0));
 switch(event.type) {
  case 'play':return {index:index===count-1?0:index,playing:!event.reduced};
  case 'pause':case 'hidden':case 'reduced':return {index,playing:false};
  case 'select':return {index:Math.min(count-1,Math.max(0,Number.isInteger(event.index)?event.index:0)),playing:false};
  case 'tick':return state.playing?{index:Math.min(count-1,index+1),playing:index+1<count-1}:{index,playing:false};
  default:return {index,playing:Boolean(state.playing)};
 }
}
