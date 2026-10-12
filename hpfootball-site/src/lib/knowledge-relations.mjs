const AXES=[
 ['mechanisms','AYNI MEKANİZMA'],
 ['teams','AYNI TAKIM'],
 ['roles','AYNI ROL'],
 ['researchLines','AYNI ARAŞTIRMA HATTI'],
];
const vals=(a,k)=>new Set(((a?.data?.relations?.[k])||[]).map(x=>String(x).trim().toLocaleLowerCase('tr-TR')).filter(Boolean));
export function resolveKnowledgeRelations(current,candidates=[],limit=4){
 const out=[];
 for(const candidate of candidates){
  if(!candidate || candidate.id===current?.id) continue;
  for(const [axis,reason] of AXES){
   const a=vals(current,axis), b=vals(candidate,axis);
   const shared=[...a].filter(x=>b.has(x));
   if(shared.length){out.push({article:candidate,reason,axis,shared});break;}
  }
 }
 return out.slice(0,limit);
}

export function buildKnowledgePath(current,candidates=[],limit=4){
 const used=new Set(); const path=[];
 for(const [axis,reason] of AXES){
  const a=vals(current,axis); if(!a.size) continue;
  const candidate=candidates.find(item=>{
   if(!item || item.id===current?.id || used.has(item.id)) return false;
   const b=vals(item,axis); return [...a].some(x=>b.has(x));
  });
  if(!candidate) continue;
  const b=vals(candidate,axis); const shared=[...a].filter(x=>b.has(x));
  used.add(candidate.id); path.push({article:candidate,reason,axis,shared});
  if(path.length>=limit) break;
 }
 return path;
}
