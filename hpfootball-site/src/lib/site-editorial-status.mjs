export function isPublicEditorialItem(data={}){
  return data?.editorial_status==='PUBLISHED';
}
