"""
HPAnalytic · Otomatik Maç Analiz Sistemi
Herhangi bir maçın JSON verisini alır, LLM'e gönderir, analiz döner.
"""
import json, os, sys, urllib.request

def get_key(name):
    p = os.path.expanduser('~/.config/hp-intelligence/api_keys.env')
    for line in open(p):
        if '=' in line:
            k, v = line.split('=', 1)
            if k.strip() == name:
                return v.strip().strip('"').strip("'")
    return None

PROMPT = """Sen Hikmet Pınarbaş'sın. HPAnalytic'in kurucusu, futbol analisti.

Sana bir maçın yapılandırılmış verisi geldi. Analiz yaz.

DNA KURALLARI:
1. Cümleler ortalama 12 kelime. Vurucu.
2. Her paragrafta "X değil, Y" karşıtlığı.
3. "Bence" yerine "Biz". "Gözlem" ve "tahmin" kelimeleri YASAK.
4. Her iddiaya sınır cümlesi: "Yanlışsam ne görmeliyim?"
5. Spor dışı metaforlar: kapı, çöl, laboratuvar, makine.
6. Kaynak künyesi: "Veri: SportsBase"

MAÇ VERİSİ:
{data}

GÖREV: 500-700 kelimelik analiz yaz. Markdown formatında. Başlık + 3-4 alt bölüm. Skoru değil, skoru üreten mekanizmayı anlat.

Verinin öne çıkardığı sayılara sadık kal. Uydurma sayı yok."""

def analyze(match_json_path):
    with open(match_json_path) as f:
        data = json.load(f)
    
    # Sadeleştir: sadece özet + sayılar
    summary = {
        'match': data.get('metadata', {}).get('match'),
        'derived': data.get('derived', {}),
        'editorial': data.get('editorial', {})
    }
    
    prompt = PROMPT.replace('{data}', json.dumps(summary, indent=2, ensure_ascii=False))
    
    # Groq'a gönder
    key = get_key('GROQ_API_KEY')
    if not key:
        print('HATA: GROQ_API_KEY yok')
        return
    
    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        data=json.dumps({
            'model': 'llama-3.3-70b-versatile',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7,
            'max_tokens': 2000
        }).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {key}'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.load(r)
            content = resp['choices'][0]['message']['content']
            print('=== ANALİZ ===')
            print(content)
            
            # .md olarak kaydet
            slug = sys.argv[2] if len(sys.argv) > 2 else 'match'
            out = f'content/yazilar/mac-{slug}-analiz.md'
            with open(out, 'w', encoding='utf-8') as f:
                f.write(f'---\ntitle: "Otomatik Analiz"\nsource: "SportsBase"\n---\n\n{content}')
            print(f'\n✓ {out}')
    except Exception as e:
        print(f'HATA: {e}')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Kullanım: python3 match-analyzer.py <json> [slug]')
        sys.exit(1)
    analyze(sys.argv[1])
