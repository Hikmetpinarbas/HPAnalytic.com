import {focusOpacity,selectEvents} from './layered-pitch.mjs';

export function mountLayeredPitch(root){
  const focus=root.querySelector('[data-layer-focus]');
  const team=root.querySelector('[data-team-filter]');
  const action=root.querySelector('[data-event-filter]');
  const time=root.querySelector('[data-time-filter]');
  const dim=root.querySelector('[data-context-opacity]');
  const items=[...root.querySelectorAll('[data-family][data-team][data-minute]')];
  const catalog=items.map(el=>({id:el.dataset.id,team:el.dataset.team,type:el.dataset.type,minute:Number(el.dataset.minute),x:0,y:0}));
  function render(){
    const selected=focus.value,side=team.value,type=action.value;
    const [startMinute,endMinute]=time.value.split(':').map(Number);
    const visible=new Set(selectEvents(catalog,{side,type,startMinute,endMinute}).map(e=>e.id));
    for(const el of items){
      const shown=el.dataset.family==='players'
        ? (side==='both'||side===el.dataset.team) && Number(el.dataset.minute)>=startMinute && Number(el.dataset.minute)<=endMinute
        : visible.has(el.dataset.id);
      el.hidden=!shown;
      el.style.display=shown?'':'none';
      el.style.opacity=String(focusOpacity({family:el.dataset.family,selected,team:el.dataset.team,side,contextOpacity:Number(dim.value)/100}));
    }
    root.querySelector('[data-visible-count]').textContent=String(items.filter(e=>e.style.display!=='none').length);
  }
  for(const control of [focus,team,action,time,dim]) control.addEventListener('input',render);
  render();
  return {render};
}
