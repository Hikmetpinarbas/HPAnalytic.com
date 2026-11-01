# HPAnalytic Pipeline v3

## CSV Haritası (Doğrulanmış)

| Dosya | Takım sütunu | İçerik | Rol |
|---|---|---|---|
| GK | ✓ | Kaleci | Ayrı |
| PL | ✓ | Oyuncu bazlı | ANA |
| TM | ✗ (code'da) | Takım bazlı | Fallback |

## Kesin Kurallar

1. **Pas**: TM = PL + GK (doğrulandı, üçlü sayım yok)
2. **Şut**: TM veya PL (eşit). GK'daki "Opponent's shots" = rakip şutu, SAYILMAZ.
3. **Takım ayrımı**: PL/GK'de team sütunu, TM'de code parse
4. **4 faz**: sadece PL eventlerinden
5. **Sanity**: her metrik için aralık kontrolü, reject = deploy durur
