# Versiyon 3.2.0
- YENİ: Orijinal jQuery metodunu ezen `select` bindingi nedeniyle, $.uxrselect.noConflict tanımı eklendi.
- DEĞİŞİKLİK: `$.uxrselect.noConflict = true` durumunda `$.fn.select` tanımı iptal ediliyor. `$.fn.Select` ya da `$
.fn.uxrselect` metodları ile plugin bindingi yapılabilir.
- DEĞİŞİKLİK: Componentin iç metodlarının daha sağlık kullanılması amacıyla, $.uxrselect.update() metodu, ilgili 
instance içerisinde `update` metodunu çağıracak şekilde revize edildi.

# Versiyon 3.1.2
- FIX: Plugin update olunca eventleri bozulan `selection UI` düzeltildi
- FIX: Scroll ihtiyacı olmayan durumlarda da gözüken Drop scrollbar düzeltildi
- FIX: Multiple modda bir seçim kaldırıldığın çalışmayan `change` eventi düzeltildi.

## Versiyon 3.1.1
- FIX: Plugin destroy olunca ekranda kalan drop kaldırıldı
- FIX: Plugin options update olunca kendisini güncellemeyen `selection` görünümü düzeltildi.

## Version 3.1.0
- YENİ: _optgroup_ desteği eklendi.
- YENİ: `destroy` metoduna ek olarak aynı işlevsellikte `remove` metodu eklendi.

## Version 3.0.0-rc1
- DEĞİŞİKLİK: Plugin mimarisi değiştirildi
- YENİ: Liste içinde arama eklendi
- YENİ: Çoklu seçim desteği eklendi
- YENİ: Liste içinde aşağı/yukarı okları ile kontrol eklendi
- YENİ: Liste içinde ok ile ilerlendiğinde enter ile seçme eklendi

## Versiyon 2.7.0
- YENİ: $.uxselect.remove() metodu eklendi.
- YENİ: Update metodundan sonra çalışan onUpdate callback eklendi.
- YENİ: Remove metodundan sonra çalışan onRemove callback eklendi.
- DEĞİŞİKLİK: Eventler, uxSelect namespace içerisinde tanımlanmaya başlandı.
- DEĞİŞİKLİK: Tanımlarda kullanılan statik isimlendirmeler, `ns` altında parametrik hale getirildi.

## Versiyon 2.6.1a (non-release)
- YENİ: Yeni tanımlanmaya başlayan, elemana bağlanmış uxRocket plugin listesi kontrolleri eklendi.

## Versiyon 2.6.1
- FIX: Diğer pluginlerden gelen data ile karıştığı için data('opt') tanımları data('uxSelect') olarak değiştirildi.

## Versiyon 2.6.0
- DEĞİŞİKLİK: Select elemanından wrapper üzerine class isimleri aktarılırken, "uxitd-select-ready" ve selector classı kaldırılmaya başlandı. 

## Versiyon 2.5.1
- FIX: Select'teki bütün classların wrapper üzerine eklemesi nedeniyle, $.uxselect.update() metodunun wrapper üzerinde de kontrol yapmaya başlaması nedeniyle alınan hatalar düzeltildi.

## Versiyon 2.5.0
- YENİ: Readonly olacak Select görünümleri için, seçimler çalışmayacak şekilde aksiyonlar düzenlendi.

## Versiyon 2.4.0
- DEĞİŞİKLİK: Select'in bütün CSS classları uxitd-plugin-wrap'a da eklenecek şekilde değiştirildi.
