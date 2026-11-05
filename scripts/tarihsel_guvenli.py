import os, json, re, pathlib, shutil, datetime, urllib.request, urllib.error, sys, time
ROOT=pathlib.Path.home()/'hpanalytic-repo'
SRC=ROOT/'content/yazilar'
KEY=os.environ.get('GEMINI_API_KEY')
MODEL='gemini-3-flash-preview'
NAMES=['2002-dunya-kupasi-sans-mi-mekanizma-mi.md','articles-matematik-yalan-soylemeyi-bilmez.md','articles-valeriy-lobanovskyi-takimin-zekasini-tasarlamak.md','avrupa-sampiyonlar-liginde-taktiksel-evrim.md','filenin-sultanlari-anatomi-ve-mekanizma.md','kadinlar-futbolun-anatomik-ve-taktiksel-evrimi.md','leicester-city-verinin-isyani.md','portraits-vosse-de-boode.md','super-lig-turk-futbolunun-veri-devrimi.md']
GUIDES={'mac':'Maç analizi: kanıt, mekanizma, bağlam.','portre':'Biyografi, kronoloji ve anlatı; istatistik zorlama.','articles':'Editoryal anlatı, tarihsel bağlam, özgün argüman.','metrik':'Kavram, yöntem, sınırlar, somut örnek.','scouting':'Oyuncu profili, güçlü/zayıf yönler, kanıt.'}
if not KEY or not SRC.is_dir(): sys.exit('Eksik GEMINI_API_KEY veya kaynak dizin')
system=(ROOT/'PROMPTS/analiz_prompt.md').read_text(encoding='utf8')
stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
base=ROOT/'content/_yeni_yazilar'/stamp
backup=base/'_orijinaller'
backup.mkdir(parents=True,exist_ok=False)
for name in NAMES:
    p=SRC/name
    if p.is_file(): shutil.copy2(p,backup/name)
print('YEDEK:',backup,flush=True)
results=[]
for name in NAMES:
    src=SRC/name
    if not src.is_file():
        results.append((name,'FAIL','dosya yok')); continue
    full=src.read_text(encoding='utf8')
    if len(full)<400:
        results.append((name,'FAIL','çok kısa')); continue
    original_fm=re.match(r'\A---\s*\n(.*?)\n---\s*\n',full,re.S)
    type_match=re.search(r'(?m)^type:\s*["\']?([\w-]+)',original_fm.group(1)) if original_fm else None
    typ=type_match.group(1) if type_match else ('portre' if name.startswith('portraits-') else 'articles')
    slug=name[:-3]
    task=f'''{system}
Tür: {typ}. Tür rehberi: {GUIDES.get(typ,GUIDES["articles"])}.
Metnin başlıca argümanlarını, özel adlarını, kronolojisini, ana bölümlerini ve anlatı bütünlüğünü koru. Kaynağı olmayan rakam ekleme, doğrulanmamış özgül iddialara DOĞRULANMIŞ etiketi koyma. Harici kaynak taramadığın için tarihsel verileri bağımsız doğruladığını iddia etme. Gerektiğinde doğrulama notu bırak. Alıntı uydurma.
YAML alanları title, slug, type, date, read, author, excerpt, match_type zorunlu. match_result yalnızca gerçek maç sonu yazılarında, dashboard yalnızca bilinen yol varsa. slug: {slug}; type: {typ}; author: Hikmet Pınarbaş. Mevcut yayın tarihi varsa koru, yeni tarih icat etme.
Yalnızca tam YAML frontmatter ve Markdown gövde yaz. Farklı spor dalını futbol metnine dönüştürme.
ORİJİNAL TAM METİN:
<source>
{full}
</source>'''
    req_data=json.dumps({'contents':[{'parts':[{'text':task}]}],'generationConfig':{'maxOutputTokens':12000,'temperature':0.45}},ensure_ascii=False).encode()
    req=urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent',data=req_data,headers={'Content-Type':'application/json','x-goog-api-key':KEY})
    print('İŞLENİYOR',name,len(full),flush=True)
    try:
        with urllib.request.urlopen(req,timeout=120) as response: obj=json.load(response)
        c=obj['candidates'][0]
        if c.get('finishReason') not in ('STOP',None): raise ValueError('finishReason='+str(c.get('finishReason')))
        out=''.join(p.get('text','') for p in c['content']['parts'])
        out=re.sub(r'^\s*```(?:markdown|md|yaml)?\s*\n','',out)
        out=re.sub(r'\n```\s*$','',out).strip()+'\n'
        fm=re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z',out,re.S)
        if not fm: raise ValueError('frontmatter yapısı geçersiz')
        fields={}
        for line in fm.group(1).splitlines():
            m=re.match(r'^([a-z_]+):\s*(.*)$',line)
            if m: fields[m.group(1)]=m.group(2).strip().strip('"\'')
        required=['title','slug','type','date','read','author','excerpt','match_type']
        if any(not fields.get(k) for k in required): raise ValueError('eksik alan: '+str([k for k in required if not fields.get(k)]))
        if fields['slug']!=slug or fields['type']!=typ: raise ValueError('slug/type uyuşmazlığı')
        if len(fm.group(2).strip()) < len(full)*0.4: raise ValueError('gövde çok kısa')
        path=base/name
        path.write_text(out,encoding='utf8')
        results.append((name,'OK',len(out)))
    except urllib.error.HTTPError as e:
        err=e.read(700).decode(errors='replace')
        results.append((name,'FAIL','HTTP '+str(e.code)+' '+err))
    except Exception as e:
        results.append((name,'FAIL',str(e)))
    print('SONUÇ',results[-1],flush=True)
    (base/'rapor.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print('TAMAMLANDI:',sum(r[1]=='OK' for r in results),'/',len(NAMES), 'ÇIKTI:',base,flush=True)
