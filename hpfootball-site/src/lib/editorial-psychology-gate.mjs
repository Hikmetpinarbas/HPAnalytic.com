const REQUIRED_DIMENSIONS=[
  ['observation_intention_boundary','OBSERVATION_INTENTION_BOUNDARY_NOT_PASSED'],
  ['evidence_perception_boundary','EVIDENCE_PERCEPTION_BOUNDARY_NOT_PASSED'],
  ['autonomy_safety','AUTONOMY_SAFETY_NOT_PASSED'],
  ['cognitive_integrity','COGNITIVE_INTEGRITY_NOT_PASSED'],
  ['visual_truth_boundary','VISUAL_TRUTH_BOUNDARY_NOT_PASSED'],
];

export function evaluatePsychologyGate(review){
  if(!review||typeof review!=='object'){
    return {allowed:false,status:'HOLD',reasons:['PSYCHOLOGY_REVIEW_REQUIRED']};
  }
  const dimensions=review.dimensions;
  if(review.status!=='PASS'||review.reviewer_scope!=='EDITORIAL_PSYCHOLOGY_COGNITIVE_SAFETY'||!dimensions||typeof dimensions!=='object'){
    return {allowed:false,status:'HOLD',reasons:['PSYCHOLOGY_REVIEW_INCOMPLETE']};
  }
  const reasons=[];
  for(const [key,reason] of REQUIRED_DIMENSIONS){
    if(dimensions[key]!=='PASS')reasons.push(reason);
  }
  if(!Array.isArray(review.rationale)||review.rationale.length===0)reasons.push('PSYCHOLOGY_RATIONALE_REQUIRED');
  return {allowed:reasons.length===0,status:reasons.length===0?'PASS':'HOLD',reasons};
}

export function applyPsychologyReview(item,review){
  const gate=evaluatePsychologyGate(review);
  return {
    ...item,
    article_meta:{
      ...(item?.article_meta||{}),
      psychology_status:gate.status,
      psychology_reasons:gate.reasons,
      psychology_review_scope:review?.reviewer_scope||'UNKNOWN',
    },
  };
}
