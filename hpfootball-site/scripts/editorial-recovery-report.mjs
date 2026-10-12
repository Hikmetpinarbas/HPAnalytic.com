import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {recoveryPlan} from '../src/lib/editorial-recovery.mjs';
const queue=process.argv[2];const output=process.argv[3];
if(!queue||!output) {console.error('Usage: node scripts/editorial-recovery-report.mjs QUEUE_DIR OUTPUT_FILE');process.exit(2)}
const names=(await readdir(queue)).filter(n=>n.endsWith('.json')).sort();const reports=[];
for(const name of names){try{const item=JSON.parse(await readFile(path.join(queue,name),'utf8'));reports.push({...recoveryPlan(item),title:item.title??'',source_id:item.source_id??''})}catch(e){reports.push({filename:name,status:'QUARANTINED_PARSE_ERROR',autopublish:false,error:String(e.message)})}}
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify({generated_at:new Date().toISOString(),publication_authorized:false,total:reports.length,reports},null,2)+'\n');console.log('Recovery plans:',reports.length,'Output:',output,'Publication authorized: NO');
