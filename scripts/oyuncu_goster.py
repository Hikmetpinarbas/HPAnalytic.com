import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# .player-g CSS'i: animasyonu kaldır, sadece konumda göster
m = re.search(r'\.player-g\{[^}]*\}', s)
if not m:
    print("✗ .player-g CSS bulunamadı"); raise SystemExit
old = m.group()
print(f"ESKİ: {old[:200]}")
yeni = '.player-g{transform:translate(var(--dx),var(--dy));transform-box:fill-box}'
s = s.replace(old, yeni, 1)
print(f"YENİ: {yeni}")

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Kaydedildi: {orig} -> {len(s)}, 1 replace")

# Doğrulama
print("\n=== DOĞRULAMA ===")
print("--dx/--dy toplam:", len(re.findall(r'--dx:', s)))
print("swingPlayer keyframes (artık kullanılmıyor, silinmedi):",
      len(re.findall(r'@keyframes swingPlayer', s)))

print("\nCtrl+Shift+R ile yenile")
print("\nBana söyle: oyuncular SAHADA GÖRÜNÜYOR mu?  var / yok / yarım")
print("BITTI")
