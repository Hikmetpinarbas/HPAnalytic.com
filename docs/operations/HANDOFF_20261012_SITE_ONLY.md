# HPANALYTIC — DEVRİ TESLİM / 2026-10-12 (Europe/Istanbul)

## Görev sınırı
**Yalnızca HPAnalytic.com sitesi.** HPFA, maç analizleri, videolar ve diğer araştırmalar şimdilik askıda. AUTOPUBLISH=OFF: Production deploy, kamuya içerik yayımlama, para harcama, veri silme ve beklenmedik dış etkiler için açık onay gerekir. Kullanıcı GitHub deposunun herkese açık yapılmasına **açık onay verdi**, fakat yalnızca geçmişin ve gizli bilgilerin güvenlik denetiminden sonra.

## Bugünkü kesin doğrulamalar
- GitHub: `Hikmetpinarbas/HPAnalytic.com`, özel depo, kullanıcıda admin/yazma yetkisi; varsayılan dal `site-hp-standard-v2`; site kodu kökte DEĞİL, `hpfootball-site/` altında. `hpfootball-site/package.json` ve `hpfootball-site/package-lock.json` mevcut.
- Ayrı çalışma dalı `ops/site-ci-isolated-20261012`; ilk workflow `.github/workflows/hpanalytic-isolated-qa.yml` commit `904138d` ile eklendi. Bu commit'ten otomatik push çalışması başarısız oldu (GitHub run **38182665598**); dosya yanlış biçimde kökte package.json arıyordu ve kodu olmayan izolasyon dalında çalışıyordu.
- **Düzeltme commit `ce3cfcdaeff04d70cdce0c5fe848b1fc8f785678`**: otomatik push tetiklemesi kaldırıldı; yalnız `workflow_dispatch`, hiçbir deploy yok, mevcut kaynak yoksa engel notu. ÖNEMLİ: Kod `hpfootball-site/` altındadır; gerçek site testi için `working-directory: hpfootball-site` ve ilgili lockfile yolu ayarlanmalıdır. Düzeltmenin başarılı QA koşusu olduğu kanıtlanmadı. Değişiklikler ana dala birleştirilmedi.
- Gmail: 2026-10-12 02:01 TRT civarında görülen GitHub hata bildirimi, işte bu run ile ilgili, mesaj kimliği `1a12d331aa2072b1`; kullanıcı postasını silmedik/etiketlemedik.
- Telefon RDC komutları bu oturumda zaman aşımına uğradı. Kendi başına arka planda cloud runner olarak güvenilir DEĞİL. Daha önceki erişimde `~/HPA_SITE_DEV/operator-comms/launch_20261012/HANDOFF.md`, `SITE_ONLY_DIRECTIVE.md`, `low_impact_worker.py`, tmux `hpanalytic-light-ops` doğrulandı. `hpfa-download-watch` oturumu durduruldu; uzaktan erişimi sağlayan `hpfa-rdc` korundu.
- Phone `~/HPA_GUARDIAN/health_check.py` pil/sıcaklığı okuyamıyor, ağır yerel işler kapalı. Cloud: HpAnalytic `gen-lang-client-0341105734` billing disabled; HPA `hpa-project-510713` disabled; HPFA `project-0f8a8edb-72cd-4738-86e` billing enabled ve DEĞİŞTİRİLMEDİ. Ücretli servis açılmadı.
- Android proot Ubuntu Node 24 derleme Cloudflare workerd/tcmalloc 1GiB mmap nedeniyle EPIPE ile başarısız; supported Linux/GitHub-hosted Ubuntu gerektirir. Yerel 262/262 testler daha önce başarılıydı, son site build başarılı olduğu iddia edilmemeli.

## Herkese açma (PUBLIC) güvenlik kapısı
İzin VAR fakat Git geçmişini ve tüm izlenen dosyaları hassas veri açısından denetlemeden depoyu açma. GitHub connector get_repo `visibility=private` olarak doğruladı. `hpfootball-site/.gitignore` yalnız `node_modules/`, `dist/`, `.astro/`, `.wrangler/` içeriyor; kök `.gitignore` bulunamadı. Bu **önemli risk**: `.env*`, `*.pem`, `*.key`, credential dumps, token/billing logs, identity files, generated reports, env vars, full commit history kontrol edilmelidir. `hpfootball-site/.env` mevcut ref'te bulunamadı (bu, geçmiş veya başka dosyalar için güvenlik garantisi değildir). 74 civarı commit çıktı, tüm geçmiş taranmadı. Herhangi bir gizli bilgi tespit edilirse önce rotate/revoke, geçmişi temizleme planı ve bağımsız yeniden tarama. GitHub API bağlantısı kullanıcıda var, **depo hâlâ PRIVATE**; henüz açılmadı.
Public yapmak için connector'da update repository visibility eylemi yok. Telefon erişimi geri geldiğinde `gh repo edit Hikmetpinarbas/HPAnalytic.com --visibility public --accept-visibility-change-consequences` ancak tüm güvenlik kontrollerinden sonra, kullanıcı açık onayını esas alarak yürütülebilir.

## Öncelikli sonraki işler
1. Kökten tüm git index/path listesi + commit tarihi üzerinde secret scan (gitleaks/trufflehog, rg kuralları), yerel commit edilmemiş dosyalarla karıştırma; olası verileri yanıt içinde ASLA açığa çıkarma.
2. Public güvenlik kapısı geçerse depoyu aç; erişimi hemen tekrar kontrol et.
3. İzole CI workflow'unu proje alt dizinine göre düzelt (`working-directory`, cache `cache-dependency-path`), ilk gerçek test. Sıfır bütçeli ve deploy kapalı.
4. Site build ve yazı/erişilebilirlik/SEO/rights kalite kapıları; belge ve ekran görüntüsü. Human approval olmadan canlı yayın yok.
5. Google Drive ve Dropbox üzerinde insan/makine okunur devir kopyaları; aktarım yapılmadan yapılmış sayma.
6. RDC kesilse bile işlerin devamlılığını GitHub hosted runner ile **başarılı run** üzerinden doğrula. GitHub workflow sürmesi için cihaz açık kalmak zorunda değil, ancak scheduled recurring iş henüz yok.

## Yeni operatörün başlangıç komutu
'HPAnalytic SITE-ONLY devrini oku. GitHub/Gmail doğrularından başla, gizli bilgi taramasını tamamlamadan depoyu public yapma. CI kök dizini hatasını çöz, bağımsız Linux testini doğrula. Yan iş yok, harcama yok, deploy yok. Çıktıları kalıcı logla ve TAMAMLANDI/ENGEL/SONRAKI şeklinde bildir.'
