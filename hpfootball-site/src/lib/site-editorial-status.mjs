export function isPublicEditorialItem(data={}){
  const status=data?.editorial_status;
  if(status===undefined||status===null||status==='')return true;
  return status==='PUBLISHED';
}
