# chapter: 00
# purpose: Mevcut donanım/yazılım envanteri — pipeline'ın temel taşı
# applies_to: [termux, userland]
# generated: 2026-10-30 17:18

## Termux (Android host)

### Sistem
- **Kernel:** Linux 5.15.197-android13 aarch64
- **CPU:** 7 çekirdek
- **RAM:** 14 GiB
- **Disk:** 218 GB (75 GB boş)
- **Python:** 3.14.8
- **Node:** v26.12.1
- **Paket:** 522

### CLI araçları (mevcut)
git, gh, curl, wget, jq, yq, rclone, gcloud, gsutil, bq, gdown, ffmpeg, convert, magick, pandoc, yt-dlp, tmux, mosh, sshd, ssh, node, npm, python, pip, uv, duckdb, sqlite3

**Eksik (kritik değil):** typst, quarto, psql, deno, bun, go, rustc, cargo, ruby, R, Rscript, docker, ngrok, cloudflared, tailscale, chromium

### Termux:API (tam)
- **Donanım:** battery, camera, camera-info, sensor, vibrate, fingerprint, location, wifi-scan, wifi-connection, nfc
- **İletişim:** sms-list, sms-send, toast, notification, share, dialog
- **Yazılım:** clipboard-get, clipboard-set, tts-speak

### API anahtarları (masked)
- `GEMINI_API_KEY` ✓ (set)
- Diğerleri: kontrol edilmedi

### Bulut erişimi
- **gcloud:** `hpnarbas@gmail.com` / `gen-lang-client-0341105734`
- **rclone remotes:** drive, gdrive, hpfa_dropbox, hpfa_gdrive, hpfa_gdrive_kutuphane
- **gh:** `Hikmetpinarbas`, scope `gist, read:org, repo, workflow`

### Aktif Google Cloud servisleri
- `generativelanguage.googleapis.com` (Gemini API)
- `drive.googleapis.com` (Drive API)
- `driveactivity.googleapis.com` (audit)
- `cloudaicompanion.googleapis.com` (Code Assist)
- `geminicloudassist.googleapis.com`

## Userland (Ubuntu 26.04)

### Sistem
- **OS:** Ubuntu 26.04.1 LTS aarch64
- **CPU:** 8 çekirdek
- **RAM:** 14 GiB (paylaşımlı)
- **Disk:** 218 GB (75 GB boş)
- **Python:** 3.14.4
- **Node:** v22.22.1
- **Paket:** 1435 (dpkg)

### CLI araçları (mevcut)
ffmpeg, convert, magick, dot (graphviz), jq, git, gh, curl, wget, rclone, inkscape, gimp, chromium, firefox, pdftotext, pdfinfo, pdftoppm, playwright

### Python paketleri (bilinen)
- **Analiz:** pandas, numpy, scipy
- **Görsel:** matplotlib, pillow, plotly (muhtemelen)
- **Futbol:** mplsoccer ✓ (kanıtlandı), socceraction, soccerdata, statsbombpy (kuruldu)
- **Web:** Jinja2, weasyprint (muhtemelen)

## Kim hangi işi yapar?

| İş | Nerede | Neden |
|---|---|---|
| **Hafif analiz** (JSON dönüşüm, validasyon) | Termux | Hızlı erişim, SSH yok |
| **Ağır analiz** (mplsoccer, ML, xT) | Userland | Daha fazla paket, Ubuntu uyumu |
| **Grafik üretim** (mplsoccer, kaleido) | Userland | 300 DPI PNG |
| **Site build** (Vite) | Termux | Site burada |
| **Deploy** (Netlify/Cloudflare) | Termux | gh + netlify |
| **AI çağrıları** (Gemini) | Termux (gemini CLI) | Anahtar burada |
| **Drive erişimi** | Termux (rclone) | Remote'lar burada |

## Termux ↔ Userland İletişim

**SSH:** `ssh -p 2022 userland@127.0.0.1`
**Paylaşılan dizin:** `~/hpanalytic/` (Termux) ↔ `/home/userland/HP_WORKSPACE/` (Userland)
**Dosya transfer:** `scp -P 2022`
**Not:** Userland'den Termux'a ters SSH de mümkün (her iki yönde)
