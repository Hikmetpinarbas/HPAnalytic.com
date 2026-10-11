# HPANALYTIC — GECE ÜRETİM OPERATÖRÜ / 2026-10-12
## GÖREV — BAŞLA
Kullanıcı gece boyunca **GERÇEK ÜRETİM** istiyor: sayfa kodu, eksik ürün yüzeyleri, editoryal taslaklar, SEO, responsive/a11y, görsel kalite; sabah incelemeye hazır PR/diff ve rapor. Sadece test cron'u veya görev planı TESLİMAT DEĞİLDİR. Site dışında hiçbir iş yapılmayacak. HPFA/HPA kaynakları yalnız site için bilgi kaynağı; bağımsız futbol sistemlerini çalıştırma.

## KAYNAK OTORİTESİ / GOOGLE DRIVE OKUMA SIRASI
Bu belgeleri doğrudan oku, en güncel commit/çalışma ağacıyla karşılaştır; tüm Drive'ı taradığını iddia etme, tüm erişilebilir dosyaları metadata ile envanterle ve siteye ilgili olanları içerik düzeyinde oku.
1. HPANALYTIC.COM ANA OPERASYON DEFTERİ: https://docs.google.com/document/d/1TxNHEifKO4qIBDfWl89bpb2GV71hnLeidJXKwTgqnJE/edit
2. HPANALYTIC ANA KOORDİNATÖR: https://docs.google.com/document/d/1Ni4uRQToo4wQMsfgRb3Cjv2CvCWbODQSHmW5PKFQR8E/edit
3. OMBUDSMAN HUB: https://docs.google.com/document/d/1sVd7VXzO7yCj00_LAh7mcLE5bIWE7tbmzDEwYrH2HGA/edit
4. TELEFON + UBUNTU + TERMUX + PYTHON + AI BİRLEŞİK ENVANTER: https://docs.google.com/document/d/1CS9q-lgDcbTMY9_HByKNBwcGERU-hiVoNHKv7Q_IaFU/edit
5. TELEFON OPERASYON MERKEZİ / AUTOMATE: https://docs.google.com/document/d/1e7yULSwDcwN6GgKfZbnMW5BGRITTAnQCZpx62WaeNJ0/edit
6. ZAMAN ÖNCELİKLİ OPERATÖR PROTOKOLÜ: https://docs.google.com/document/d/1Oo9lDrsDfWJUnvGW9H-KENDT0mU7Nu2mK92xt579D7U/edit
7. HP FOOTBALL SITE WEB/EDITORIAL/VISUAL LEDGER: https://docs.google.com/document/d/10Ar-FurSmVUaRVMdItJJ6LjBpewdKHg5i0Nz4hFYQT0/edit
8. HP CONTENT INTELLIGENCE ANA DEFTER: https://docs.google.com/document/d/1B70N5kqjozpZpnnyfGRC5YClDSUxrDRu_M2j9NEYskQ/edit
9. HPAnalytic UX/ürün araştırması: https://docs.google.com/document/d/1Svi7BkphdTZ40y3CgAsqoqp9imVlDbFb9GpDNvSP1Ak/edit
10. Site için haklar/araştırma ve markalama belgeleri, approval_queue, Visual Intelligence defterleri, Drive MACHINE INDEX, HUMAN START HERE.
11. Repo devir: https://github.com/Hikmetpinarbas/HPAnalytic.com/blob/ops/site-ci-isolated-20261012/docs/operations/HANDOFF_20261012_SITE_ONLY.md

## DOĞRULANMIŞ REPO/CI
Repo Hikmetpinarbas/HPAnalytic.com, private (son doğrulama); default site-hp-standard-v2. **Site proje kökü hpfootball-site/**, repo kökü değil. GitHub overnight QA .github/workflows/hpanalytic-overnight-qa.yml her gece UTC 00:17, workflow_dispatch, ubuntu-latest, Node 24, npm ci/test/build, deploy yok. İlk manuel run 38183794129 tüm job steps SUCCESS (bağımsız Linux derlemesi). GitHub Actions otomatik QA'dır, otomatik üretim ajanı DEĞİLDİR. Yeni ajan gerçek kod yazıp ayrı dalda commit/PR üretmeli. 2026-10-12 özel dal ops/site-ci-isolated-20261012 üzerindeki önceki hatalı test workflow'u manual-only oldu.
Telefon local repo ~/HPA_SITE_DEV/HP-PROJELERI/hpfootball-site; dirty worktree, untracked testler/visual/editorial/recovery dosyaları var. RDC son çağrılarda timeout; telefondaki dosyaların GitHub'a senkronize edildiğini VARSAYMA. Asla git reset --hard/clean veya dirty worktree overwrite.
GitHub public yapma izni VAR; **önce tüm izlenen dosyalar ve tüm commit geçmişi secret/PII taraması**; .gitignore env/key dosyalarını dışlamıyor. Tarama ve token rotation gerektiğinde public kapısı. Sırf izin verildi diye denetimsiz açma.

## GOOGLE ABONELİK VE KOTA ENVANTERİ (HAK EDİŞ ≠ ETKİNLEŞTİRİLMİŞ KOTA)
Kullanıcı Google One + Google AI Pro abonesi olduğunu beyan etti. Resmî Google AI Pro özellikleri (bölge/plan/kota doğrulaması gerekir): 5 TB/10 TB Drive-Gmail-Photos depolama plan varyantı, Gemini ve Deep Research, NotebookLM genişletilmiş kullanım, Google Flow ve Flow kredileri, Gemini in Gmail/Docs, Google AI Studio genişletilmiş sınırlar, Google Antigravity ajan geliştirme kotası, Jules artırılmış görev/eşzamanlılık sınırları, Android Studio yapay zekâ araçları, Google Developer Program kaynaklı aylık **10 USD Cloud kredisi** (hak sahipliği ve kredi bağlantısı ayrı doğrulanır). Google Developer Program Premium bağımsız abonelik yapısı değişmiştir. 2026 itibarıyla Gemini CLI bireysel Pro hattı Antigravity/Antigravity CLI'ye taşındı; eski Gemini CLI'nin Android'de çalıştığını varsayma. Antigravity Pro aboneliği API anahtarının ücretsiz/sınırsız çalıştığı anlamına GELMEZ. Kota aşımı otomatik kredi harcaması KAPALI.
Resmî: https://support.google.com/googleone/answer/14534406 ; https://one.google.com/about/google-ai-plans/ ; https://www.antigravity.google/pricing ; https://developers.google.com/profile/help/faq
Önceki gcloud envanteri: 7 active projects: alpine-xyston-0cb1c, arboreal-edition-8wh4c, gen-lang-client-0340362693, gen-lang-client-0341105734 (HpAnalytic; billing FALSE), hpa-project-510713 (FALSE), hpa-video-discovery, project-0f8a8edb-72cd-4738-86e (HPFA Football System; billing TRUE). Son ikisi dışındaki belirsiz projeler için billing tahmini yapma. HPFA faturalandırmasını değiştirme; kaynak maliyetini ayrıca incele. Google AI Pro Cloud Run faturalarını otomatik karşılamaz.

## TELEFON ENVANTERİ / GÜVENLİK
Android 16 OnePlus CPH2449 (önceki belge); Termux, Ubuntu proot, Shizuku, RDC, Automate, tmux, Python, Node, git, ffmpeg, sqlite, rclone, ImageMagick, Chromium/Firefox, Claude Code, OpenCode; paket sürümleri/durumları belgeye göre ve kısmen eski. ai_dispatcher registry ChatGPT/Claude/Gemini/Grok/Qwen/Manus rol kartları, çalışan otomatik ajan kanıtı değil. Automate -> Termux uçtan uca güvenilir değil. Phone guardian thermal 38C / RAM avail <25% / battery <40% / telemetry missing => heavy work STOP. Android Doze uyku sınırları var. RDC şart değil; telefonu gece sunucu yapma. GitHub-hosted Linux üzerinde çalış.
Telefon `hpfa-download-watch` durduruldu, `hpfa-rdc` RDC bağlantısı için korundu, `hpanalytic-light-ops` hafif tmux izleyici vardı. Cloud worker kurulduğunu varsayma.
Diğer abonelikler kullanıcı beyanı: Claude, Dropbox, Google One, Google AI Pro. Bağlı Drive/Dropbox/GitHub; her birinin kotası/hesap erişimi ayrı doğrulanır.

## SİTE ÜRÜN KURALLARI
Marka: HİKMET PINARBAŞ, HP monogram, premium editorial black/off-white, kontrollü kırmızı; kadın/erkek futbolunda eşit ciddiyet. Evidence before confidence, mechanism before metric, context before verdict. Kaynak, görsel lisans, doğruluk, editoryal onay. Otomatik yayın YOK. Domain GoDaddy registrar; DNS Cloudflare Free; eski domain SSL cutover defterde. Routes /analysis /scouting /research /culture /visual /archive /about; home, search, taxonomy, article evidence, responsive, accessibility 200% zoom, keyboard, 320px.
Kaynak Drive kayıtlarında farklı tarihlerde 231,247,262,272 PASS var; bunlar AYRI snapshot'lar, yeni kod için tek PASS iddiası kurma. GitHub overnight run 38183794129 SUCCESS mevcut remote snapshot için.
Bekleyen içerikler approval_queue, research candidates, görsel/rights gates; yayın onayı yok.

## GERÇEK GECE ÜRETİM PLANI — HEMEN
1. Drive belgelerini oku, repo mevcut default HEAD ve branch'i çek; site TODO ve güvenlik/rights blokajlarını listele.
2. Yeni **izole feature branch** aç; erişilebilen remote kaynak üzerinde 1-3 yüksek değerli ürün değişikliğini TDD ile gerçekleştir (ör. eksik sayfa, mobil/a11y, navigation/search, gerçek editorial layout). Telefon WIP'e dokunma.
3. GitHub hosted Linux testini çalıştır; sonucu PASS/FAIL doğrula. Site deploy, domain DNS, Cloudflare mutation yok.
4. Bir sonraki küçük iş paketini üret; idempotent task queue (job ID, lock, attempt, SHA, result) tasarla. Ücretsiz/abonelik içi gerçek ajan çalıştırma yolunu test et; GitHub cron QA'yı ajan sanma. Sınırsız ücretli API kullanma.
5. Sabah raporu: değişen dosyalar, commit/PR, test sonuçları, ekran görüntüleri varsa, onay bekleyenler, sonraki öncelikler. Gerçek PR yoksa PR var deme.
6. Kullanıcı sabah siteyi ilerlemiş bulmak istiyor; plan yazmak yerine kod/ürün teslim et. Çalışmanın arka planda devam etmesi yalnız bağımsız runner/agent tetiklenmiş ve doğrulanmışsa iddia edilir.

## YETKİ SINIRI
Kullanıcı siteyi geliştirmeyi, test etmeyi, güvenlik taraması sonrası repoyu public yapmayı onayladı. Production yayın, ücretli servis/kredi, veri silme, gizli bilgiyi paylaşma yok. Kullanıcıya gereksiz komut verme; VERIFIED/BLOCKED ayrımını koru.
