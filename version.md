## Versiyon 3.7.2
- DEĞİŞİKLİK: Dropdown is fitted related container

## Versiyon 3.6.15
- FIX: bugfix

## Versiyon 3.6.14
- FIX: bugfix

## Versiyon 3.6.12
- FIX: callback null kontrolü

## Versiyon 3.6.11
- YENİ: İkontype 'arrow' ve 'search' olarak parametrik hale getirildi.
- FIX: Ajax ile data yüklenme durumunda multiple dropdownun seçimden sonra kapanma soeunu düzeltildi.
- DEĞİŞİKLİK: Refactoring  

## Versiyon 3.6.10
- YENİ: Seçilen elemanları dönen callback eklendi. 

## Versiyon 3.6.9
- DEĞİŞİKLİK: Ajax objesine yeni parametre eklendi. 

## Versiyon 3.6.8
- FIX: arama yapıldıktan sonra listenin kaybolma durumu düzeltildi. 

## Versiyon 3.6.7
- DEĞİŞİKLİK: Ajax objesine yeni parametreler eklendi. 

## Versiyon 3.6.6
- FIX: Touch device dropdown açılmama sorunu çözüldü

## Versiyon 3.6.4
- FIX: Touch device dropdown açılmama sorunu çözüldü..

## Versiyon 3.6.3
- FIX: Mobilde dropdown açılmama sorunu çözüldü.

## Versiyon 3.6.2
- FIX: Seçim kaldırıldığında selected özelliği false olarak set edildi.

## Versiyon 3.6.0
- YENİ: Ajax ile data çekilip dinamik select datası basılması özelliği eklendi. 

## Versiyon 3.5.16
- FIX: Issue #44 fixed.

## Versiyon 3.5.14
- FIX: Arama özelliği olan selectboxlarda, aranın öğenin selected olarak görünmeme sorunu düzeltildi.

## Versiyon 3.5.13
- YENI: Multiple drop üzerinde bulunan seçili elemanlarda yer alan remove butonu opsiyonel hale getirildi.

## Versiyon 3.5.12
- FIX: aktif element blur yapılan blok exeption içerisine alındı.

## Versiyon 3.5.11
- FIX: Select genişliği IE 11 de eksi değerde ve yanlış hesaplanıyordu. Düzelmesi için fazladan bir kontrol eklendi.
- FIX: selectbox tıklandığında aktif element blur yapıldı

## Versiyon 3.5.10
- FIX: Multiple select'lerde search sonrasında seçilen seçeneğin yeniden açılan menüde seçilmiş olarak görünmemesi problemi çözüldü.

## Versiyon 3.5.9
- FIX: Tablet ve telefonlarda, klayve açılınca, drop'un klavyenin altında kalması düzeltildi.

## Versiyon 3.5.8
- FIX: Display-type text durumunda seçim sayısının sıfır olmaması problemi giderildi.
- FIX: Drop pozisyonunun hesaplanmasındaki bir yanlışlık düzeltildi.
- FIX: Component remove edildikten sonra da çalışan bir event düzeltildi.

## Versiyon 3.5.7
- FIX: Display-type text olması durumunda pre-selected verilerin tag şeklinde gözükmesi problemi giderildi.
- FIX: Display-type tag olması durumunda pre-selected verilerin çalışması düzenlendi.

## Versiyon 3.5.6
- DEĞİŞİKLİK: Component'in initialize olmadığı durumda update methodu warning basacak şekilde düzenlendi.

## Versiyon 3.5.5
- DEĞİŞİKLİK: Tablette keyboard açılmaması nedeniyle 3.5.2 deki değişiklikler geri alındı.

## Versiyon 3.5.4
- FIX: Drowdown menülerin boyutları ile ilgili bir bug düzeltildi.

## Versiyon 3.5.3
- DEĞİŞİKLİK: Update methodu yeniden düzenlendi.

## Versiyon 3.5.2
- FIX: İçerisinde arama özelliği olan select'lerin tabindex sorununu gidermek için input yerine arama yapılan değeri gösteren div koyuldu.

## Versiyon 3.5.1
- FIX: açılan listenin pozisyonu window yüksekliğine ve alt veya üst boşluk müsaitliğine göre hizalanacak şekilde düzeltildi.

## Versiyon 3.5.0
- YENI: Multiple drop üzerinde herhangi bir seçim yapıldığında kaç adet seçim yapıldığı gösterilebilecek.

## Versiyon 3.4.1
- FIX: Drop'un kapanmasına engel olan bir bug çözüldü.

## Versiyon 3.4.0
- FIX: Drop'tan bir eleman seçildiğinde trigger olmayan orjinal change eventi düzeltildi.
- FIX: Drop içinde arama yapıldıktan sonra `ok` tuşları ile seçim yapılamaması düzeltildi.
- FIX: Drop içinde arama yapıldıktan sonra `enter` ile seçim yapılamaması düzeltildi.
- FIX: Drop içinde grup tanımı olduğunda çalışmayan `ok` tuşları ile ilerleme düzeltildi.
- DEĞİŞİKLİK: Drop içinde arama kutusu görünür ise, drop açıldığında arama kutusunun focus olması sağlandı.
- DEĞİŞİKLİK: `$.uxrselect.close()` metodu açık olan bütün dropları kapatacak şekilde düzenlendi.
- YENİ: Tablet ve telefonlarda içeriği sadece numeric olan listelerde uygun klavyenin gözükmesi için `data-numeric` ve `numeric` optiyonları eklendi.

# Versiyon 3.2.2
- YENİ: Option lara custom class eklenebilme özelliği getirildi

# Versiyon 3.2.1
- YENİ: DropUI için yeni option eklendi.
- FIX: IE'de çalışmayan multiple select seçimi düzeltildi.

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
