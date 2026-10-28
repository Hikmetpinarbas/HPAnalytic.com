/**
 * Descriptive, not causal. All fields are team totals from one SportsBase
 * record family; rates do NOT imply shared event sequences or probabilities.
 */
export function createDerbyMetrics(teams){
  const ratio=(n,d)=>Number.isFinite(n)&&Number.isFinite(d)&&d>0&&n>=0&&n<=d?n/d:null;
  return Object.fromEntries(Object.entries(teams).map(([team,v])=>{
    const halfToFinalThird=ratio(v['Final third entries'],v["Entries to the opponent's half"]);
    const highRecoveryShare=ratio(v["Ball recoveries in opponent's half"],v['Ball recoveries']);
    const boxActionShare=ratio(v["Actions in opponent's box"],v['Actions']);
    const metrics=[halfToFinalThird,highRecoveryShare,boxActionShare];
    const composite=metrics.every(x=>x!==null)?Math.cbrt(metrics.reduce((a,b)=>a*b,1)):null;
    return [team,{halfToFinalThird,highRecoveryShare,boxActionShare,composite,
      annotation:composite===null?'Yetersiz kaynak':'Tanımlayıcı profil endeksi — sekans dönüşüm olasılığı değildir'}];
  }));
}
