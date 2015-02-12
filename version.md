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
