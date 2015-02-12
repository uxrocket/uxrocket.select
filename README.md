UX Rocket Select
===============

Select plugini, CSS ile görünüm stillendirilmesi mümkün olmayan `select` elemanı için hazırlanmıştır. Select elemanı içerisinde arama, otomatik tamamlama gibi özellikler olmadığı için, bu tarz kullanım ihtiyaçlarında, <em>autocomplete</em> plugini kullanılmalıdır.

```HTML
<select class="select">
    <option value="">Lütfen seçiniz</option>
    <option value="1">Seçenek 1</option>
    <option value="2">Seçenek 2</option>
    <option value="3">Seçenek 3</option>
    <option value="4">Seçenek 4</option>
</select>
```


### Notlar
Select elemanının görünümünü değiştirmek için görsel amaçlı kullanılmaktadır. Plugin ayarlarındaki tanımları da tema hazırlama durumuna göre özelleşmiştir.



### Tanımlar
Property 			 | Default			| Açıklama
-------------------- | ---------------- | --------
wrapper              | null             | Pluginin eklendiği elemanı çevreleyen `label` için kullanılan css classı. Pluginin kontrolleri için `uxitd-select-wrap` otomatik eklenmektedir.
current              | null             | Seçilen değerin isminin yazıldığı alan. Pluginin kontrolleri için `uxitd-select-current` otomatik eklenmektedir.
arrow                | null             | Select okunun stillendirilmesi için kullanılan css classı. Pluginin kontrolleri için `uxitd-select-arrow` otomatik eklenmektedir.
list                 | null             | Select listesi. Plugin kontrolleri için `uxitd-select-list` otomatik eklenmektedir.
option               | null             | Select listesi elemanları. Plugin kontrolleri için `uxitd-select-option` otomatik eklenmektedir.
selected             | null             | Select listesindeki seçilmiş eleman. Plugin kontrolleri için `uxitd-select-option-selected` otomatik eklenmektedir.


Data Attribute			   | &nbsp;
-------------------------- | -----
on-ready                   | Select, form elemanına bağlandığında çalışacak fonksiyonu çağırır.
on-select                  | Listeden seçim yapıldığında, çalışacak fonksiyonu çağırır.
on-update                  | Update metodundan sonra çalışacak fonksiyonu çağırır.
on-remove                  | Remove metodundan, çalışacak fonksiyonu çağırır.


Callback			 | &nbsp;
-------------------- | -----
onReady              | Select, form elemanına bağlandığında çalışacak fonksiyonu çağırır.
onSelect             | Listeden seçim yapıldığında, çalışacak fonksiyonu çağırır.
onUpdate             | Update metodundan sonra çalışacak fonksiyonu çağırır.
onRemove             | Remove metodundan, çalışacak fonksiyonu çağırır.


### Public Metodlar
Metod					    | Açıklama
--------------------------- | -------------------------------------------------------
$(selector).select(options) | Bu method plugini manuel olarak bir elemana bağlamanızı sağlar.
$.uxselect                  | Bu method pluginin detayını görmenizi sağlar.
$.uxselect.version          | Sayfaya eklenmiş pluginin versiyon numarasını gösterir.
$.uxselect.settings         | Aktif pluginin ayarlarını gösterir.
$.uxselect.update(el)       | DOM üzerinde değişiklik yapıldıktan sonra, Select eklenmiş elemanların güncellenmesini sağlar. `$.uxselect.update()` şeklinde çağrılırsa sayfadaki bütün select elemanlarını günceller. `$.uxselect.update("#myselect")` şeklinde çağrılırsa, sadece seçilen elemanı günceller.
$.uxselect.remove(el)       | Select eklenmiş elemanlardan plugini ve ilgili eklenmiş liste/arayüz elemanlarını kaldırır. `$.uxselect.remove()` şeklinde çağrılırsa sayfadaki bütün select elemanlarına bağlı plugini kaldırır. `$.uxselect.remove("#myselect")` şeklinde çağrılırsa, sadece seçilen elemandan kaldırır.