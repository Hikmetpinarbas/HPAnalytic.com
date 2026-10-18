export function isPublicEditorialItem(data={}){
  return data?.editorial_status==='PUBLISHED'
    && data?.qualityStatus==='HUMAN_APPROVED'
    && data?.sourceClaimsValidated===true;
}
