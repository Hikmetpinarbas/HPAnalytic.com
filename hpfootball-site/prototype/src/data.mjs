// All article metadata and numerical examples in this isolated prototype are demonstrations.
export const articles = [
 {id:'pas',title:'Bir pasın değeri, vardığı yerden fazlası.',description:'Bir aksiyonu sonucundan ayırıp bağlamıyla birlikte okumak. Alan, zaman ve karar üzerine bir görsel deneme.',type:'Araştırma',topic:'Alan değeri',league:'Demo Lig',teams:['Takım A'],season:'2026–27',author:'Demo editör',date:'2026-10-26',minutes:8,cover:'space',label:'ALAN / ZAMAN',number:'01'},
 {id:'baski',title:'Baskının bıraktığı boşluk.',description:'Topa yaklaşan oyuncuyu değil, arkasında açılan koridoru izlemek.',type:'Maç analizi',topic:'Baskı',league:'Demo Lig',teams:['Takım A','Takım B'],season:'2026–27',author:'Demo editör',date:'2026-10-25',minutes:6,cover:'press',label:'BASKI / BOŞLUK',number:'02'},
 {id:'bakis',title:'Görmek, kararın başlangıcı.',description:'Sahadaki bilgiye erişimi ölçmenin sınırları ve araştırma soruları.',type:'Araştırma',topic:'Algı',league:'Araştırma',teams:['Takım B'],season:'2026–27',author:'Demo araştırmacı',date:'2026-10-21',minutes:11,cover:'gaze',label:'İNSAN / OYUN',number:'03'},
 {id:'gecis',title:'Oyunun iki saniyesi.',description:'Topun el değiştirdiği anı bir sonuç değil, yeni bir soru olarak ele almak.',type:'Görsel deneme',topic:'Geçiş',league:'Demo Kupa',teams:['Takım B'],season:'2025–26',author:'Demo editör',date:'2026-09-18',minutes:5,cover:'transition',label:'GEÇİŞ / KARAR',number:'04'},
 {id:'rol',title:'Bir rol, bir pozisyondan büyüktür.',description:'Oyuncuyu bir koordinata sabitlemeden rol ve bağlam ilişkisini kurmak.',type:'Scouting',topic:'Oyuncu rolü',league:'Demo Kupa',teams:['Takım A'],season:'2025–26',author:'Demo araştırmacı',date:'2026-09-10',minutes:7,cover:'space',label:'ROL / BAĞLAM',number:'05'},
 {id:'orneklem',title:'Küçük örneklem, büyük cümleler.',description:'Bir sayının ne söylediği kadar, söylemeye yetmediği şeyi de göstermek.',type:'Yöntem',topic:'Belirsizlik',league:'Araştırma',teams:[],season:'2026–27',author:'Demo araştırmacı',date:'2026-10-12',minutes:9,cover:'gaze',label:'KANIT / SINIR',number:'06'}
];
export const facets = [
 {key:'league',label:'Lig',values:['Demo Lig','Demo Kupa','Araştırma']},
 {key:'team',label:'Takım',values:['Takım A','Takım B']},
 {key:'season',label:'Sezon',values:['2026–27','2025–26']},
 {key:'topic',label:'Konu',values:['Alan değeri','Baskı','Algı','Geçiş','Oyuncu rolü','Belirsizlik']},
 {key:'author',label:'Yazar',values:['Demo editör','Demo araştırmacı']},
 {key:'type',label:'Makale türü',values:['Araştırma','Maç analizi','Görsel deneme','Scouting','Yöntem']},
 {key:'date',label:'Tarih',values:['2026-10','2026-09']}
];
export const groups = [
 {label:'Analiz',icon:'pitch',description:'Oyunun içindeki ilişkiler.',items:[['Etkileşimli analiz','analysis.html','Saha, veri ve kayıtlar'],['Maç analizleri','archive.html?type=Ma%C3%A7+analizi','Olayın arkasındaki mekanizma'],['Scouting','archive.html?type=Scouting','Rol, uyum ve bağlam']]},
 {label:'Araştırma',icon:'research',description:'Soru sor. Sınırını göster.',items:[['Araştırma arşivi','archive.html?type=Ara%C5%9Ft%C4%B1rma','Yöntem ve araştırma dosyaları'],['Yöntem notları','archive.html?type=Y%C3%B6ntem','Verinin söyleyebildikleri'],['Okuma odası','article.html','Bölüm bölüm bir görsel deneme']]},
 {label:'Keşfet',icon:'compass',description:'Kendi okuma yolunu çiz.',items:[['Bütün dosyalar','archive.html','Konu, sezon ve takımla keşfet'],['Seçkim','archive.html?saved=1','Bu cihazda sakladığın okumalar'],['Görsel denemeler','archive.html?type=G%C3%B6rsel+deneme','Bir fikri görerek düşün']]}
];
export const entities = [
 ...articles.map(a=>({group:a.type==='Araştırma'?'Araştırmalar':'Makaleler',title:a.title,description:a.topic,href:`article.html?id=${a.id}`})),
 ...['Takım A','Takım B'].map(title=>({group:'Takımlar',title,description:'Demonstrasyon takımı',href:`archive.html?team=${encodeURIComponent(title)}`})),
 {group:'Oyuncular',title:'Oyuncu 7',description:'Demonstrasyon kaydı · saha görünümü',href:'analysis.html?player=7'},
 {group:'Teknik direktörler',title:'Teknik ekip A',description:'Demonstrasyon kaydı · baskı dosyaları',href:'archive.html?topic=Bask%C4%B1'},
 ...facets.find(f=>f.key==='topic').values.map(title=>({group:'Konu başlıkları',title,description:'Konuya ait demo dosyalar',href:`archive.html?topic=${encodeURIComponent(title)}`})),
 {group:'Arşiv',title:'Araştırma arşivi',description:'Bütün demo kayıtlarını filtrele',href:'archive.html'}
];
// Synthetic records: discrete observations only, never claimed as match/tracking data.
export const sequences = [
 {id:'a',name:'Sekans A · alan kazanımı',events:[{t:0,x:24,y:40,player:'4',action:'Başlangıç kaydı'},{t:3,x:47,y:24,player:'7',action:'İkinci kayıt'},{t:7,x:77,y:38,player:'9',action:'Son kayıt'}]},
 {id:'b',name:'Sekans B · yön değişimi',events:[{t:0,x:69,y:17,player:'9',action:'Başlangıç kaydı'},{t:4,x:42,y:48,player:'4',action:'İkinci kayıt'},{t:9,x:81,y:50,player:'7',action:'Son kayıt'}]}
];
export const demoCells = Array.from({length:96},(_,i)=>({id:i,x:i%12,y:Math.floor(i/12),value:Math.round(8+((i%12)/11)**2*64+(1-Math.abs(Math.floor(i/12)-3.5)/4)*18)}));
