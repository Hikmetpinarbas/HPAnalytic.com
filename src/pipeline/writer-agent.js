import fs from 'fs';
import path from 'path';

// Termux'taki API anahtarlarını oku
const envPath = path.resolve(process.env.HOME, '.config/hp-intelligence/api_keys.env');
const apiKeys = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  lines.forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (k && v) apiKeys[k] = v;
    }
  });
}

const openRouterKey = apiKeys['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;
const groqKey = apiKeys['GROQ_API_KEY'] || process.env.GROQ_API_KEY;

if (!openRouterKey && !groqKey) {
  console.error("Hata: OPENROUTER_API_KEY veya GROQ_API_KEY bulunamadı.");
  process.exit(1);
}

// Konuyu terminalden al (Örn: node writer-agent.js "Leicester City'nin 2016 şampiyonluğu")
const topic = process.argv.slice(2).join(' ');
if (!topic) {
  console.log("Kullanım: node src/pipeline/writer-agent.js \"Yazı Konusu\"");
  process.exit(1);
}

// Hikmet DNA'sı (Sistem Promptu)
const systemPrompt = `Sen Hikmet Pınarbaş'sın. Futbol analisti, TV yorumcusu ve HPAnalytic'in kurucususun. 
Yazdığın metinlerde şu DNA'ya sahipsin:
1. Epistemik sıralama: DOĞRULUK → KANIT → BAĞLAM → MEKANİZMA → KARŞI KANIT → KARAR DEĞERİ.
2. Cümlelerin ortalama 12 kelime. %40'ı 10 kelimenin altında. Vurucu ve kısa yaz.
3. Her paragrafta "X değil, Y" karşıtlığını kullan. (Örn: "Skor değil, mekanizma").
4. "Bence" deme, "Biz" de. (Örn: "Biz burada veriyi okuyoruz").
5. Her iddiaya bir sınır cümlesi ekle. (Örn: "Yanlışsam ne görmeliyim?" veya "Bu verinin sınırı şudur").
6. Metaforların spor dışından olsun. (Kapı, pencere, çöl, laboratuvar, çizme, makine).
7. "Gözlem" ve "tahmin" kelimelerini KULLANMA. Onun yerine "Olasılık", "model çıktısı", "işaret" kullan.
8. Kaynak künyesi ekle: "Veri: SportsBase".
9. Asla "yeniden tasarım" kelimesini kullanma.

Görevin: Sana verilen konu hakkında, yukarıdaki DNA'ya tam uyumlu, 400-600 kelimelik, derinlikli bir futbol analizi yazısı yaz. Yazıyı Markdown formatında (başlıklar, vurgular) hazırla.`;

async function generateArticle() {
  console.log(`[Yazar Ajanı] "${topic}" konusu üzerinde çalışılıyor...`);
  
  // Tercih OpenRouter, yoksa Groq (Fallback)
  const isOpenRouter = !!openRouterKey;
  const apiUrl = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';
  const apiKey = isOpenRouter ? openRouterKey : groqKey;
  const model = isOpenRouter ? '~anthropic/claude-sonnet-latest' : 'openai/gpt-oss-120b';

  const body = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Konu: ${topic}` }
    ],
    temperature: 0.7,
    max_tokens: 1500
  };

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://hpanalytic.com',
        'X-Title': 'HPAnalytic Writer Agent'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    
    if (data.error) {
      console.error("API Hatası:", data.error.message);
      return;
    }

    const articleContent = data.choices[0].message.content;
    
    // Dosyayı kaydet
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `content/yazilar/${slug}.md`;
    
    // Yayınlanma tarihi ve meta bilgileri
    const frontmatter = `---\ntitle: "${topic}"\ndate: "${new Date().toISOString().split('T')[0]}"\nauthor: "Hikmet Pınarbaş"\nsource: "HPAnalytic Writer Agent"\n---\n\n`;
    
    if (!fs.existsSync('content/yazilar')) fs.mkdirSync('content/yazilar', { recursive: true });
    fs.writeFileSync(filename, frontmatter + articleContent);
    
    console.log(`\n✓ Yazı başarıyla oluşturuldu ve kaydedildi: ${filename}`);
    console.log(`\n--- İLK 500 KARAKTER ---\n${articleContent.slice(0, 500)}...\n------------------------`);
    
    // Görsel Ajanı için sinyal
    console.log(`\n[Sıradaki Adım] Yazı hazır. Şimdi "Görsel Ajanı" bu metni alıp kapak ve mekanizma grafiği üretebilir.`);

  } catch (err) {
    console.error("Beklenmeyen Hata:", err);
  }
}

generateArticle();
