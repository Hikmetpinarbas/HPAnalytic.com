const labels={
 'Passes accurate':'İsabetli pas','Passes forward accurate':'İsabetli ileri pas',
 'Assists':'Asist kaydı','Chances created':'Yaratılan fırsat','Key passes accurate':'İsabetli kilit pas',
 'Progressive passes accurate':'İsabetli progresif pas','Chances':'Fırsat','Goals':'Gol',
 'Shots on target':'İsabetli şut','Shots off target':'İsabetsiz şut',
 'Aerial challenges lost':'Kaybedilen hava mücadelesi','Challenges unsuccessful':'Başarısız mücadele',
 'Involvement in set-piece attacks':'Duran top hücumuna katılım',
 'Involvement in set-piece attacks with shots':'Şutla biten duran top hücumuna katılım',
 'Ball recoveries':'Top kazanımı','Carry':'Top sürme','Passes into the penalty box accurate':'Ceza sahasına isabetli pas',
 'Involvement in counterattacks':'Kontra katılımı',
 'Involvement in counterattacks with shots':'Şutla biten kontraya katılım',
};
export const actionLabel=label=>labels[label]||label;
export function actorName(value){return String(value).replace(/^\d+\.\s*/,'').replace(/\s*\(\d+\)$/,'');}
