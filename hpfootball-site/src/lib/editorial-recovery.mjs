/** Fail-closed repair routing. Never auto-approves claims, rights or publication. */
const ACTIONS={source_verification:['PENDING_CROSSREF_OR_PRIMARY','MISSING'],method_review:['PENDING','REJECTED'],rights_status:['UNREVIEWED','REJECTED'],visual_status:['NO_VERIFIED_DATA','REJECTED']};
export function recoveryPlan(item={}) {
 const tasks=[];
 if(!item.source_id) tasks.push({gate:'SOURCE',action:'FIND_PRIMARY_SOURCE',owner:'Researcher'});
 if(!item.source_verification || item.source_verification!=='VERIFIED') tasks.push({gate:'SOURCE',action:'VERIFY_PRIMARY_AND_CROSSREF',owner:'Researcher'});
 if(item.method_review!=='PASS') tasks.push({gate:'METHOD',action:'REVIEW_METHOD_AND_COUNTEREVIDENCE',owner:'Auditor'});
 if(item.football_applicability!=='ASSESSED') tasks.push({gate:'FOOTBALL',action:'ESTABLISH_FOOTBALL_APPLICABILITY_WITH_EVIDENCE',owner:'Researcher'});
 if(!['OWNED','LICENSED','PUBLIC_DOMAIN','ORIGINAL','EDITORIAL_LICENSED'].includes(item.rights_status)) tasks.push({gate:'RIGHTS',action:'VERIFY_LICENSE_OR_CREATE_ORIGINAL_ALTERNATIVE',owner:'Publisher'});
 if(item.visual_status!=='VERIFIED') tasks.push({gate:'VISUAL',action:'PRODUCE_SOURCE_BOUND_VISUAL_OR_EXPLICIT_NO_VISUAL',owner:'Builder'});
 if(!item.hpfa_acceptance_id) tasks.push({gate:'HPFA',action:'REVIEW_CLAIM_CEILING_AND_EVIDENCE',owner:'Auditor'});
 if(item.human_approval!==true) tasks.push({gate:'EDITORIAL',action:'REQUEST_HUMAN_EDITORIAL_APPROVAL',owner:'Publisher'});
 return {job_id:item.job_id??null,status:tasks.length?'REWORK_REQUIRED':'READY_FOR_SEPARATE_PUBLICATION_GATE',autopublish:false,original_preserved:true,tasks};
}
