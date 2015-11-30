UX Rocket Select
===============
UX Rocket Select plugin is designed for styling and enhancing the user experience capabilities of native html select. You can search, select multiple options, limit max selection in multiple selects etc. It is also easily themable. By default, its styles only defined for properly working. You need minimum amount of overwrite for defining your own theme for the select.

## Install
Select can directly install your project by copying the contents of `dist` folder to your assets, and [npm](https://www.npmjs.org/) or [bower](http://bower.io/) packages. All dependent libraries will also installed with the packages. Just run, with npm;

```
npm install uxrocket.select
```

or with Bower

```
bower install uxrocket.select
```

Then, import files to your HTML

```HTML
<link rel="stylesheet" href="<path-to-bower_components>/uxrocket.select/dist/uxrocket.select.min.css" />

<script src="<path-to-jquery"></script>
<script src="<path-to-bower_components>/uxrocket.factory/dist/uxrocket.factory.min.js"></script>
<script src="<path-to-bower_components>/uxrocket.select/dist/uxrocket.select.min.js"></script>
<script>
    $(function(){
        $('.select').select(); // for default settings
    });
</script>
```
_if you want to use plugin in development mode, you can `import` `_uxrocket-select.scss` file under `<path-to-bower_components>/uxrocket.select/lib/` to your Sass_

Select plugin is designed to enhance native select, so in your HTML, you only need to have a normal select to bind the plugin.

```HTML
<select class="select">
    <option value="">Please select one</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
</select>
```


## Options
Property 			 | Default			| Description
-------------------- | ---------------- | --------
wrapper              | null             | Wrapper class for your theme. Wrapper is the parent element which wraps both original select and uxrSelect's selection item. Plugin also adds `uxr-select-wrap` for internal usage.
opened               | null             | Open indicator class for your theme. Added to wrapper. Plugin also adds `uxr-select-opened` for internal usage.
current              | null             | Selection class for your theme. It is the element where the selected option is showed. Plugin also adds `uxr-select-selection` for internal usage.
arrow                | null             | Arrow class for your theme. It is the part where select triangle shown. Plugin also adds `uxr-select-arrow` for internal usage.
list                 | null             | Unordered option list class for your theme. Plugin also adds `uxr-select-list` for internal usage.
option               | null             | Class for each option in the list. It is the anchor element in each `li` Plugin also adds `uxr-select-option` for internal usage.
selected             | null             | Selected option class for your theme. It is applied to `li` items in the list. Plugin also adds `uxr-select-selected` for internal usage.
search               | true             | Indicates whether list is searchable or not.
searchItemLimit      | 10               | Defines the search box is visible or not. Usefull for small list. Search list will be visible even if its set to true when options are more than `searchItemLimit`
searchType           | starts (starts or contains) | Defines the search lookup. If set to `starts` then it looks up if option's text or value starts with search term, otherwise, looks up if it contains the term.
minLetters           | 2                | Minimum letter required for search to start.
maxSelection         | 0                | For _multiple_ mode, restrict maximum selectable option count. If 0 or lower, no restriction applied.
maxSelectionWarn     | Text             | Shows a user friendly alert when reached maximum selection. Default text is "You have reached allowed maximum selection". 
placeholder          | null             | Adds a placeholder text on multiple selects
onReady              | false            | Calls the function when plugin is ready.
onSelect             | false            | Calls the function when option is selected.
onChange             | false            | Calls the function when list is closed.
onUpdate             | false            | Calls the function when plugin options are updated.
onDestroy            | false            | Calls the function when select is removed.



Data Attribute		 | &nbsp;
-------------------- | -----
wrapper              | Wrapper class for your theme. Wrapper is the parent element which wraps both original select and uxrSelect's selection item.
opened               | Open indicator class for your theme. Added to wrapper. Plugin also adds `uxr-select-opened` for internal usage.
current              | Selection class for your theme. It is the element where the selected option is showed. 
arrow                | Arrow class for your theme. It is the part where select triangle shown.
list                 | Unordered option list class for your theme.
option               | Class for each option in the list. It is the anchor element in each `li`.
selected             | Selected option class for your theme. It is applied to `li` items in the list.
search               | Indicates whether list is searchable or not.
search-item-limit    | Defines the search box is visible or not. Usefull for small list. Search list will be visible even if its set to true when options are more than `searchItemLimit`
search-type          | Defines the search lookup. If set to `starts` then it looks up if option's text or value starts with search term, otherwise, looks up if it contains the term.
min-letters          | Minimum letter required for search to start.
max-selection        | For _multiple_ mode, restrict maximum selectable option count. If 0 or 
lower, no restriction applied.
max-selection-warn   | Shows a user friendly alert when reached maximum selection. Default text is "You have reached allowed maximum selection". 
placeholder          | Adds a placeholder text on multiple selects
on-ready             | Calls the function when plugin is ready.
on-select            | Calls the function when option is selected.
on-change            | Calls the function when list is closed.
on-update            | Calls the function when plugin options are updated.
on-destroy           | Calls the function when select is removed.


Callbacks			 | &nbsp;
-------------------- | -----
onReady              | Calls the function when plugin is ready.
onSelect             | Calls the function when option is selected.
onChange             | Calls the function when list is closed.
onUpdate             | Calls the function when plugin options are updated.
onDestroy            | Calls the function when select is removed.


## Event Hooks
Plugin uses both generic events and custom events. All events triggered in *uxrSelect* namespace. Rather than firing a function/method via callback you can attach your own method to plugin events.

```js
$('.select').on('uxrselect.uxrSelect', function(){
    form.submit(); // any method, function you want to define
});
```
 
Event Name			 | &nbsp;
-------------------- | -----
uxrready             | triggers when uxrSelect binds to element for the first time
uxrselect            | triggers when an option selected
uxrupdate            | triggers when plugin settings updated
uxrdestroy           | triggers when uxrSelect unbinds from the element.

All these custom events also hooked the element itself when plugin is binded, and fires the callback options when triggered.
 

## Public Methods
Method  				         | Description
-------------------------------- | -------------------------------------------------------
$(selector).select(options)      | Binds the plugin 
$.uxrselect.update(el, opt)      | Updates the settings on the element
$.uxrselect.destroy(el)          | Removes plugin from element. If `el` is undefined, removes from all elements
$.uxrselect.close                | Closes the select list
$.uxrselect.getFocusedInstance() | Shows the active and previous instance
$.uxrselect.version              | Shows the plugin version
$.uxrselect.settings             | Shows the default settings
