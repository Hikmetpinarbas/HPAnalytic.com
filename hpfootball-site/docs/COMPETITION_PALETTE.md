# HPAnalytic — çift paletli yayın şablonu

**Karar verici tek alan:** `competitionScope`. Yazı türü (makale, inceleme, seri, maç önü, maç sonu) renk seçimini değiştirmez.

- `competitionScope="league"` (varsayılan): HPAnalytic Floodlight v3 editoryal paleti; kulüp adı verilse bile tarafsız görünüm.
- `competitionScope="europe"`: Avrupa müsabakalarında takımın iki rengi.
- `competitionScope="international"`: milli takımın uluslararası müsabakasında kırmızı/beyaz.
- Yanlış veya bilinmeyen kulüp: güvenli varsayılan editoryal palet.

## Kullanım — herhangi bir sayfa şablonu

`<BaseLayout title="..." club="galatasaray" competitionScope="europe"> ... </BaseLayout>`

Lig örneği:

`<BaseLayout title="..." club="galatasaray" competitionScope="league"> ... </BaseLayout>`

Milli takım örneği:

`<BaseLayout title="..." club="turkiye" competitionScope="international"> ... </BaseLayout>`

## Takım renk değişkenleri

| Takım | Birincil | İkincil |
|---|---|---|
| Galatasaray | `#F2B705` sarı | `#B91C28` kırmızı |
| Fenerbahçe | `#FFD31A` sarı | `#071C53` lacivert |
| Beşiktaş | `#FFFFFF` beyaz | `#080808` siyah |
| Trabzonspor | `#7D1838` bordo | `#7FB3E8` mavi |
| Türkiye | `#D9162A` kırmızı | `#FFFFFF` beyaz |

Renkler mevcut site tasarımının işlevsel başlangıç tokenlarıdır, resmî marka renk kodlarının birebir temsili oldukları iddia edilmez. Grafikler semantik ölçüm ve kanıt renklerini yalnızca takım kimliği için değiştirmemeli; kırmızı kanıt ihlali işaretiyle karışmamalıdır.

Mevcut açık Avrupa maç sayfaları iki renk moduna alınmıştır. Diğer editoryal içerik türleri aynı `BaseLayout` API'sini kullanabilir; dinamik CMS içeriğine yarışma etiketi bağlama işi ayrı kapsamdır.
