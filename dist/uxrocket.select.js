/**
 * UX Rocket
 * jQuery based Select replacement
 * @author Bilal Cinarli
 */

(function(factory) {
    'use strict';
    if(typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if(typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {
    'use strict';

    if(typeof window.UXRocket === 'undefined') {
        console.warn('UXRocket Select is required UXRocket Factory to run properly. You can clone/download factory at https://github.com/uxrocket/uxrocket.factory');
    }

    var ux, // local shorthand
        i                      = 1,
        rocketName             = 'uxrSelect',
        focusedInstances       = {
            lastFocused: null,
            current:     null
        },
        touchmove              = false,
        virtualKeyboardVisible = false,

        templates              = {
            selection: '<a href="#" id="{{selectionClass}}-{{id}}" class="{{selectionClass}}{{#if multiple}} {{multipleClass}}{{/if}}{{#if disabled}} {{disabledClass}}{{/if}}{{#if readonly}} {{readonlyClass}}{{/if}} {{themeCurrent}}" style="{{width}}">' +
                       '    <span class="{{selectionTextClass}}">{{selectionText}}</span>' +
                       '    <span class="{{arrowClass}} {{themeArrow}}"></span>' +
                       '</a>',
            tags:      '{{#each selected}}' +
                       '<span class="{{selectionTagClass}} {{selectionTagClass}}-{{selected.index}} {{#if selected.isRemovable}} {{hasRemoveSelected}} {{/if}}" data-index="{{selected.index}}" data-value="{{selected.value}}">' +
                       '    {{selected.text}}' +
                       '    {{#if selected.isRemovable}}' +
                       '    <span class="{{removeSelectionClass}}">X</span>' +
                       '    {{/if}}' +
                       '</span>' +
                       '{{/each}}',
            multi:     '<span class="{{selectionTagClass}} {{selectionTagClass}}-{{index}} {{#if isRemovable}} {{hasRemoveSelected}} {{/if}}" data-index="{{index}}" data-value="{{value}}">' +
                       '    {{selectionText}}' +
                       '    {{#if isRemovable}}' +
                       '    <span class="{{removeSelectionClass}}">X</span>' +
                       '    {{/if}}' +
                       '</span>',
            search:    '<span class="{{searchClass}}">' +
                       '   <input type="{{inputType}}" name="{{searchInput}}" />' +
                       '</span>',
            list:      '<ul class="{{listClass}} {{themeList}}">' +
                       '    {{#each options}}' +
                       '    {{#if options.groupStart}}' +
                       '    <li class="{{groupClass}}">' +
                       '        <span class="{{groupNameClass}}">{{options.groupName}}</span>' +
                       '        <ul>' +
                       '    {{/if}}' +
                       '    <li id="{{optionClass}}-{{options.index}}" class="{{#if options.selected}}{{selectedClass}} {{themeSelected}}{{/if}} {{#if options.disabled}}{{disabledClass}} {{themeDisabled}}{{/if}}">' +
                       '        <a class="{{optionClass}} {{themeOption}} {{options.class}}" data-index="{{options.index}}" data-value="{{options.value}}">{{options.text}}</a>' +
                       '    </li>' +
                       '    {{#if options.groupEnd}}' +
                       '        </li>' +
                       '    </ul>' +
                       '    {{/if}}' +
                       '    {{/each}}' +
                       '</ul>',
            drop:      '<div id="{{dropID}}" data-select="{{id}}" class="{{dropClass}} {{themeDrop}}{{#if multiple}} {{multipleClass}}{{/if}}">' +
                       '    {{search}}' +
                       '    {{list}}' +
                       '</div>'
        },

        defaults               = {
            wrapper:             '',
            opened:              '',
            current:             '',
            arrow:               '',
            drop:                '',
            list:                '',
            option:              '',
            selected:            '',
            disabled:            '',
            search:              true,
            searchItemLimit:     10, // search box will visible if more than 10 item present in select,
            searchType:          'starts', // starts or contain. search if term starts with the key or contain the key
            displayType:         'tags', // tags or selected number
            multipleInfoMessage: 'Seçilen Kayıt:',
            minLetters:          2,
            maxSelection:        0, // no limit
            maxSelectionWarn:    'You have reached allowed maximum selection',
            numeric:             false, // on handheld devices, controls to numeric or classic keyboard view when
            isRemovable:         false,
            // search field focuses

            // callbacks
            onReady:   false,
            onOpen:    false,
            onClose:   false,
            onSelect:  false,
            onChange:  false,
            onUpdate:  false,
            onDestroy: false
        },
        events                 = {
            focus:     'focus.' + rocketName,
            blur:      'blur.' + rocketName,
            change:    'change.' + rocketName,
            click:     'click.' + rocketName + ' touchend.' + rocketName + ' pointerup.' + rocketName + ' MSPointerUp.' + rocketName,
            mousedown: 'mousedown.' + rocketName + ' pointerdown.' + rocketName + ' MSPointerDown.' + rocketName,
            keyup:     'keyup.' + rocketName,
            keydown:   'keydown.' + rocketName,
            keypress:  'keypress.' + rocketName,
            input:     'input.' + rocketName,
            resize:    'resize.' + rocketName,
            touchend:  'touchend.' + rocketName + ' pointerup.' + rocketName + ' MSPointerUp.' + rocketName,
            touchmove: 'touchmove.' + rocketName,
            // custom events
            ready:     'uxrready.' + rocketName,
            open:      'uxropen.' + rocketName,
            close:     'uxrclose.' + rocketName,
            select:    'uxrselect.' + rocketName,
            update:    'uxrupdate.' + rocketName,
            destroy:   'uxrdestroy.' + rocketName,
            scroll:    'scroll',
            iconClick: 'iconclick.' + rocketName
        },
        keys                   = {
            codes:     {
                8:  'backspace',
                9:  'tab',
                13: 'return',
                27: 'esc',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            },
            backspace: 8,
            tab:       9,
            return:    13,
            esc:       27,
            left:      37,
            up:        38,
            right:     39,
            down:      40
        },
        ns                     = {
            prefix:  'uxr-',
            rocket:  'uxRocket',
            data:    rocketName,
            name:    'select',
            classes: {
                wrap:               'wrap',
                ready:              'ready',
                disabled:           'disabled',
                readonly:           'readonly',
                selection:          'selection',
                selectionText:      'selection-text',
                selectionTag:       'selected-tag',
                removeSelection:    'remove-selected-tag',
                hasRemoveSelected:  'has-remove-selected-tag',
                arrow:              'arrow',
                multiple:           'multiple',
                numeric:            'numeric',
                opened:             'opened',
                drop:               'drop',
                reverseDrop:        'reverse-drop',
                list:               'list',
                option:             'option',
                optionName:         'option-name',
                group:              'group',
                groupName:          'group-name',
                highlight:          'highlight',
                selected:           'selected',
                search:             'search',
                hidden:             'aria-hidden',
                hide:               'hide',
                iconHolder   :      'icon-holder'
            }
        },
        searchIcon = 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI1MC4zMTMgMjUwLjMxMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjUwLjMxMyAyNTAuMzEzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCI+CjxnIGlkPSJTZWFyY2giPgoJPHBhdGggc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkOyIgZD0iTTI0NC4xODYsMjE0LjYwNGwtNTQuMzc5LTU0LjM3OGMtMC4yODktMC4yODktMC42MjgtMC40OTEtMC45My0wLjc2ICAgYzEwLjctMTYuMjMxLDE2Ljk0NS0zNS42NiwxNi45NDUtNTYuNTU0QzIwNS44MjIsNDYuMDc1LDE1OS43NDcsMCwxMDIuOTExLDBTMCw0Ni4wNzUsMCwxMDIuOTExICAgYzAsNTYuODM1LDQ2LjA3NCwxMDIuOTExLDEwMi45MSwxMDIuOTExYzIwLjg5NSwwLDQwLjMyMy02LjI0NSw1Ni41NTQtMTYuOTQ1YzAuMjY5LDAuMzAxLDAuNDcsMC42NCwwLjc1OSwwLjkyOWw1NC4zOCw1NC4zOCAgIGM4LjE2OSw4LjE2OCwyMS40MTMsOC4xNjgsMjkuNTgzLDBDMjUyLjM1NCwyMzYuMDE3LDI1Mi4zNTQsMjIyLjc3MywyNDQuMTg2LDIxNC42MDR6IE0xMDIuOTExLDE3MC4xNDYgICBjLTM3LjEzNCwwLTY3LjIzNi0zMC4xMDItNjcuMjM2LTY3LjIzNWMwLTM3LjEzNCwzMC4xMDMtNjcuMjM2LDY3LjIzNi02Ny4yMzZjMzcuMTMyLDAsNjcuMjM1LDMwLjEwMyw2Ny4yMzUsNjcuMjM2ICAgQzE3MC4xNDYsMTQwLjA0NCwxNDAuMDQzLDE3MC4xNDYsMTAyLjkxMSwxNzAuMTQ2eiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=',
        utils                  = new window.uxrPluginUtils({ns: ns});

        console.log(utils);
    // Constructor Method
    var Select = function(el, options, selector) {
        this._instance = i;
        this._name     = rocketName;
        this._defaults = defaults;
        this.wrapped   = false;

        this.el       = el;
        this.$el      = $(el);
        this.id       = 'uxr-select-options-' + i;
        this.multiple = this.el.hasAttribute('multiple');
        this.disabled = this.el.hasAttribute('disabled');
        this.readonly = this.el.hasAttribute('readonly');
        this.width    = this.getWidth();
        this.selector = selector;
        this.opened   = false;
        this.hasGroup = false;
        this.tabbed   = false;
        this.clicked  = false;

        this.searchQueryHolder = [];
        this.nonLetters        = [8, 9, 13, 27, 38, 40, 46];

        this.options = $.extend(true, {}, defaults, options, this.$el.data());

        i++;

        this.init();
    };

    Select.prototype.init = function() {
        if(this.el.id === '') {
            this.el.id = ns.data + '-' + this._instance;
        }

        this.loadAjaxData(function(){
            // add options to UX Rocket registry
            this.registry();

            this.getOptionData();

            this.decorateUI();

            this.bindUI();
            this.bindSelectionUI();

            this.$el.addClass(utils.getClassname('ready'));
            this.appendIcon();
            this.emitEvent('ready');
        }.bind(this));

    };



    Select.prototype.appendIcon = function(){
        if(this.options.withIcon){
            var icon = this.options.iconTemplate ||  '<img src="'+searchIcon+'" />';
            this.$el.next().append( '<span class="'+utils.getClassname('iconHolder')+'">'+ icon +'</span>' );
            this.bindIcon();
        }
    };

    Select.prototype.bindIcon = function(){
        $('body').find('.' + utils.getClassname('iconHolder')).off(events.click);
        $('body').find('.' + utils.getClassname('iconHolder'))
            .on(events.click, function(e){
                this.emitEvent('iconClick');
                if( this.options.iconClicked ){
                    this.options.iconClicked();
                }
            }.bind(this));
    };

    Select.prototype.prepareRequest = function(){
        this.requestModel = {};
        if( this.options.transformRequest ){
            this.requestModel = $.extend(true, this.requestModel, this.options.transformRequest());
        }
        var search = null;
        try {
            search = this.$search.val();
        }catch(e){}
        if(search && search.length < 3){
            return;
        }
        this.requestModel[this.options.searchTerm || 'searchTerm'] = search;
    };

    Select.prototype.sendRequest = function(){
        var dfd = jQuery.Deferred();
        this.prepareRequest();
        if( this.options.changeEndpoint ){
            this.options.ajaxUrl = this.options.changeEndpoint();
        }
        $.ajax({
            url: this.options.ajaxUrl,
            method: this.options.httpMethod || 'GET',
            data: this.requestModel,
            success: function(response){
                var options = '';
                for(var i = 0, l = response.length; i < l; i++){
                    options += '<option value="' + response[i][this.options.value] + '">'+ response[i][this.options.key] +'</option>';
                }
                this.$el.empty().append(options);
                dfd.resolve( response );
            }.bind(this),
            error: function( response ){
                console.log('An error occurred fetching ajax data');
                dfd.reject( response );
            },
            dataFilter: this.options.transformResponse ? eval(this.options.transformResponse) : function(data){return data;}
        });
        return dfd.promise();
    };

    Select.prototype.loadAjaxData = function(cb){
        if(this.options.ajax && this.options.ajaxUrl){
            this.sendRequest()
                .done(function(){
                    cb();
                });
        }else {
            cb();
        }
    };

    Select.prototype.getSelected = function() {
        var selected = [],
            _this = this;

        if(this.multiple) {
            this.$el.find('option:selected').each(function() {
                selected.push({
                    index: $(this).index(),
                    value: $(this).attr('value'),
                    text:  $(this).text(),
                    isRemovable: _this.options.isRemovable
                });
            });
        }
        else {
            selected.value = this.$el.val();
            selected.text  = this.$el.find('option:selected').text();
        }

        return selected;
    };

    Select.prototype.getOptionData = function() {
        var _this = this,
            index = 0;

        _this.optionData = [];

        this.$el.find('option').each(function() {
            var groupStart = false,
                groupName  = false,
                groupEnd   = false;

            if(this.parentElement.tagName === 'OPTGROUP') {
                if(this === this.parentElement.firstElementChild) {
                    groupName  = this.parentElement.label;
                    groupStart = true;
                }

                if(this === this.parentElement.lastElementChild) {
                    groupEnd = true;
                }
            }

            _this.optionData.push({
                groupName:  groupName,
                groupStart: groupStart,
                groupEnd:   groupEnd,
                index:      index,
                text:       $(this).text(),
                value:      $(this).val(),
                selected:   $(this).is(':selected'),
                disabled:   $(this).is(':disabled'),
                class:      $(this).attr('class') || ''
            });

            index++;
        });
    };

    Select.prototype.decorateUI = function() {
        this.addAttributes();
        this.wrap();
        this.addSelection();
    };

    Select.prototype.undecorateUI = function() {
        this.unwrap();
        this.removeSelection();
        this.removeAttributes();
    };

    Select.prototype.wrap = function() {
        if(this.$el.parent().is('label')) {
            this.$el.parent().addClass(utils.getClassname('wrap'));
        }

        else {
            this.wrapped = true;
            this.$el.wrap('<label class="' + utils.getClassname('wrap') + '"></label>');
        }

        this.$el.parent().addClass(this.options.wrapper);
    };

    Select.prototype.unwrap = function() {
        if(this.wrapped) {
            this.$el.unwrap();
        }
        else {
            this.$el.parent().removeClass(utils.getClassname('wrap') + ' ' + this.options.wrapper);
        }
    };

    Select.prototype.addSelection = function() {
        var selection = this.renderSelection();

        this.$selection = $(selection);
        this.$el.after(this.$selection);
    };

    Select.prototype.removeSelection = function() {
        this.$el.next('.' + utils.getClassname('selection')).remove();
        delete this.$selection;
    };

    Select.prototype.addAttributes = function() {
        this.$el
            .addClass(utils.getClassname('hidden'))
            .attr('aria-hidden', true);
    };

    Select.prototype.removeAttributes = function() {
        this.$el
            .removeAttr('aria-hidden')
            .removeClass(
                utils.getClassname('hidden') + ' ' +
                utils.getClassname('ready')
            );
    };

    Select.prototype.bindUI = function() {
        var _this = this;

        _this.$el
            .on(events.focus, function(e) {
                e.preventDefault();
                _this.onFocus();
            })
            .on(events.open, function(e) {
                _this.onOpen(e);
            })
            .on(events.close, function(e) {
                _this.onClose(e);
            })
            .on(events.change, function(e) {
                _this.onChange(e);
            })
            .on(events.ready, function(e) {
                _this.onReady(e);
            })
            .on(events.select, function(e) {
                _this.onSelect(e);
            })
            .on(events.update, function() {
                _this.onUpdate();
            })
            .on(events.destroy, function() {
                _this.onDestroy();
            });

    };

    Select.prototype.bindSelectionUI = function() {
        var _this = this;

        _this.$selection
            .on(events.keyup, function(e) {
                e.preventDefault();

                _this.onKeyup(e);
            })
            .on(events.focus, function(e) {
                e.preventDefault();

                _this.onFocus();
            })
            .on(events.blur, function() {
                _this.onBlur();
            })
            .on(events.mousedown, function(e) {
                e.stopPropagation();
                e.preventDefault();
            })
            .on(events.click, function(e) {
                e.stopPropagation();
                e.preventDefault();
                _this.onClick(e);
            })
            .on(events.mousedown, '.' + utils.getClassname('removeSelection'), function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(_this.disabled) {
                    return false;
                }

                // Removes selected from a pre-loaded option
                $(_this.optionData).each(function() {
                    if(this.text === $(e.target).parent().data('value')) {
                        this.selected = false;
                    }
                });

                _this.removeTag($(this).parent());
            })
            .parent()
            .on(events.mousedown, function(e) {
                e.stopPropagation();
                e.preventDefault();

                setTimeout(function() {
                    _this.onFocus();
                }, 100);
            });
            
    };

    Select.prototype.bindDropUI = function() {
        var _this = this;

        _this.$drop
            .on(events.click, function(e) {
                e.stopPropagation();
            })
            .on(events.touchmove, '.' + utils.getClassname('option'), function(e) {
                e.stopPropagation();
                touchmove = true;
            })
            .on(events.mousedown, '.' + utils.getClassname('option'), function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(!touchmove) {
                    _this.emitEvent('select');
                    _this.select($(e.currentTarget));
                }

                touchmove = false;
            })
            .on(events.focus, '.' + utils.getClassname('search') + ' input', function() {
                _this.setDropPosition(true); // keyboard visible
            });

        _this.bindKeyupListener();
    };

    Select.prototype.unbindUI = function() {
        this.emitEvent('destroy');
        this.$selection.off('.' + rocketName);
        this.$selection.parent().off('.' + rocketName);
        this.$el.off('.' + rocketName);
    };

    Select.prototype.unbindKeyupListener = function() {
        $(document).off(events.keyup);
    };

    Select.prototype.bindKeyupListener = function() {
        var _this = this;

        $(document).on(events.keyup, function(e) {
            e.preventDefault();

            if(e.keyCode === keys.up || e.keyCode === keys.down) {
                _this.navigateWithArrow(keys.codes[e.keyCode]);
            }
            else if(e.keyCode === keys.return) {
                _this.navigateWithEnter();
            }
            else if(e.keyCode === keys.esc) {
                _this.close();
            }
            else if(_this.$search.val().length >= _this.options.minLetters) {
                if(_this.options.ajax && _this.options.ajaxUrl){
                    _this.sendRequest();
                }else{
                    _this.search(_this.$search.val());
                }
            }
            else {
                _this.setOriginalList();
            }

            return true;
        });
    };

    Select.prototype.select = function($selected) {
        var selected            = utils.getClassname('selected'),
            highlight           = utils.getClassname('highlight'),
            selectionText       = utils.getClassname('selectionText'),
            selectionTag        = utils.getClassname('selectionTag'),
            removeSelection     = utils.getClassname('removeSelection'),
            hasRemoveSelected   = utils.getClassname('hasRemoveSelected'),
            $option             = $selected.parent(),
            optionID            = $option.attr('id'),
            index               = $selected.data('index'),
            value               = $selected.data('value'),
            text                = $selected.text(),
            $val                = this.$el.val(),
            isRemovable         = this.options.isRemovable;

        if($option.hasClass(utils.getClassname('disabled'))) {
            return;
        }

        if(!this.multiple) {
            this.$list.find('.' + highlight).removeClass(highlight);
            this.$list.find('.' + selected).removeClass(selected);
            this.$selection.find('.' + selectionText).text(text);
            this.$el.find('[value="' + value + '"]').prop('selected', true);
            this.onBlur();
            this.$list.find('#' + optionID).addClass(selected);

            if(this.$el.val() !== '') {
                this.$selection.parent().addClass(selected + ' ' + this.options.selected);
            }
            else {
                this.$selection.parent().removeClass(selected + ' ' + this.options.selected);
            }
        }

        else {
            // double click deselects
            if($option.hasClass(selected)) {
                this.deSelect(value);
            }

            else {
                if(this.options.maxSelection > 0 && $val !== null && $val.length >= this.options.maxSelection) {
                    alert(this.options.maxSelectionWarn);
                    return;
                }

                this.$el.find('[value="' + value + '"]').prop('selected', true);
                this.$list.find('#' + optionID).addClass(selected);
                $option.addClass(selected);

                if(this.options.displayType === 'tags') {

                    var tag = utils.render(templates.multi, {
                        selectionText:        text,
                        selectionTagClass:    selectionTag,
                        removeSelectionClass: removeSelection,
                        index:                index,
                        value:                value,
                        isRemovable:          isRemovable,
                        hasRemoveSelected:    hasRemoveSelected
                    });

                    if(this.$el.val() === null) {
                        this.$selection.find('.' + selectionText).html(tag);
                    }
                    else {
                        this.$selection.find('.' + selectionText).append(tag);
                    }

                }

                else {
                    this.$selection.find('.' + selectionText).html(this.options.multipleInfoMessage + ' ' + this.$el.val().length + '/' + this.optionData.length);
                }

                // selected for search items
                if (this.options.search) {
                    this.updateOptionData('selected', {prop: 'index', val: index}, true);
                }

            }

            // multiple selection could change the selection height
            this.setDropPosition();

        }

        this.emitEvent('change');
    };

    Select.prototype.deSelect = function(value) {
        var selected      = utils.getClassname('selected'),
            selectionText = utils.getClassname('selectionText'),
            selectionTag  = utils.getClassname('selectionTag'),
            option        = $('[data-value="' + value + '"]').parent(),
            index         = this.$drop.find('[data-value="' + value + '"]').data('index');

        if(value){
            this.$el.find('[value="' + value + '"]').prop('selected', false);
        }

        if(!this.$drop) {
            this.prepareDrop();
        } else {
            this.$drop.find('[data-value="' + value + '"]').parent().removeClass(selected);
        }

        this.$el.find('[value="' + value + '"]').removeAttr('selected');
        option.removeClass(selected);
        this.$selection.find('[data-value="' + value + '"]').remove();
        if(this.$el.val()) {
            this.$el.val($.grep(this.$el.val(), function(val) {
                return val !== value;
            }));
        }

        if(this.multiple && this.options.displayType !== 'tags') {
            var $selection = this.$selection.find('.' + selectionText);
            if(this.$el.val()) {
                $selection.html(this.options.multipleInfoMessage + ' ' + this.$el.val().length + '/' + this.optionData.length);
            }
            else {
                $selection.html(this.options.multipleInfoMessage + ' ' + 0 + '/' + this.optionData.length);
            }
        }

        if(this.multiple && this.options.displayType === 'tags' && (this.$el.val() === null || this.$el.val().length < 1)) {
            this.$selection.find('.' + selectionText).text(this.multiplePlaceholder);
        }

        this.emitEvent('change');
        this.$el.trigger('change'); // also trigger original event.

        this.updateOptionData('selected',  { prop: 'index', val: index} , false);
    };

    Select.prototype.removeTag = function($tag) {
        this.deSelect($tag.data('value'));
        this.setDropPosition();
    };

    Select.prototype.search = function(term) {
        var _this = this,
            $list = this.$drop.find('.' + utils.getClassname('list')),
            results,
            list;

        results = $.map(this.optionData, function(item) {
            if(_this._search(item, term.trim())) {
                return item;
            }
        });
        list    = this.renderList(results);
        $list.replaceWith(list);
        this.setDropPosition();
    };

    Select.prototype._search = function(item, term) {
        var _text  = item.text.replace('İ', 'i').toLowerCase(),
            _value = item.value.replace('İ', 'i').toLowerCase(),
            _term  = term.replace('İ', 'i').toLowerCase();

        switch(this.options.searchType) {
            default:
            case 'starts':
                return (_text.indexOf(_term) === 0 || _value.toLowerCase().indexOf(_term) === 0);
            case 'contains':
                return (_text.indexOf(_term) > -1 || _value.toLowerCase().indexOf(_term) > -1);
        }
    };

    Select.prototype.navigateWithEnter = function() {
        if(!this.multiple) {
            var $visibleList = this.$drop.find("." + utils.getClassname('list')),
                highlight    = utils.getClassname('highlight'),
                highlighted  = $visibleList.find('.' + highlight);

            if(highlighted.length > 0) {
                highlighted.removeClass(highlight);

                this.select(highlighted.find('a'));
                this.emitEvent('select');
            }
        }
    };

    Select.prototype.navigateWithArrow = function(updown) {
        var $highlighted,
            highlight            = utils.getClassname('highlight'),
            $visibleContent      = this.$drop.find("." + utils.getClassname('list')),
            $selectableItemsList = $visibleContent.find('li:not(.' + utils.getClassname('group') + ')'),
            highlighted          = ($visibleContent.find('.' + highlight).length > 0) ? $visibleContent.find('.' + highlight) : $visibleContent.find('.' + utils.getClassname('selected')),
            highlightedIndex     = $selectableItemsList.index(highlighted),
            listPos              = $visibleContent.offset().top,
            scrollTop            = $visibleContent.scrollTop(),
            height               = $visibleContent.height();

        if(!highlighted.length) {
            var firstLast = updown === 'up' ? 'last' : 'first';

            $selectableItemsList[firstLast]().addClass(highlight);
        }

        else {
            highlighted.removeClass(highlight);

            if(updown === 'up') {
                if(--highlightedIndex < 0) {
                    highlightedIndex = $selectableItemsList.length - 1;
                }
            }
            else {
                if($selectableItemsList.length === ++highlightedIndex) {
                    highlightedIndex = 0;
                }
            }

            $highlighted = $($selectableItemsList[highlightedIndex]).addClass(highlight);

            if($highlighted.length) {
                if(updown === 'down') {
                    if($highlighted.offset().top > (listPos + height - $highlighted.height())) {
                        $visibleContent.scrollTop(scrollTop + $highlighted.height());
                    }
                    else if(($highlighted.offset().top < listPos)) {
                        $visibleContent.scrollTop(0); // move to top
                    }
                }

                else {
                    if(($highlighted.offset().top < listPos)) {
                        $visibleContent.scrollTop(scrollTop - $highlighted.height());
                    }
                    else if($highlighted.offset().top > (listPos + height)) {
                        $visibleContent.scrollTop(scrollTop + $highlighted.offset().top); // move to last
                    }
                }
            }
        }
    };

    Select.prototype.renderSelection = function() {
        var data = {
            id:                 this.el.id,
            selectionClass:     utils.getClassname('selection'),
            multiple:           this.multiple,
            multipleClass:      utils.getClassname('multiple'),
            disabled:           this.disabled,
            disabledClass:      utils.getClassname('disabled'),
            readonly:           this.readonly,
            readonlyClass:      utils.getClassname('readonly'),
            width:              'width:' + this.width,
            selectionTextClass: utils.getClassname('selectionText'),
            selectionText:      this.getSelected().text,
            arrowClass:         utils.getClassname('arrow'),
            themeCurrent:       this.options.current,
            themeArrow:         this.options.arrow
        };

        if(this.multiple) {
            this.multiplePlaceholder = this.$el.attr('placeholder') || this.options.placeholder || '';

            if(this.getSelected().length > 0) {
                if(this.options.displayType === 'text') {
                    data.selectionText = this.options.multipleInfoMessage + ' ' + this.getSelected().length + '/' + this.optionData.length;
                } else {
                    data.selectionText = this.renderSelectionTags();
                }
            }
            else {
                data.selectionText = this.multiplePlaceholder;
            }
        }

        return utils.render(templates.selection, data);
    };

    Select.prototype.renderSelectionTags = function() {

        var data = {
            selectionTagClass:    utils.getClassname('selectionTag'),
            removeSelectionClass: utils.getClassname('removeSelection'),
            hasRemoveSelected:    utils.getClassname('hasRemoveSelected'),
            selected:             this.getSelected(),
        };

        return utils.render(templates.tags, data);
    };

    Select.prototype.renderSearchField = function() {
        var data = {
            searchClass: utils.getClassname('search'),
            searchInput: utils.getClassname('search') + '-' + this._instance,
            inputType:   this.options.numeric ? 'tel' : 'text',
            list:        this.id
        };

        return utils.render(templates.search, data);
    };

    Select.prototype.renderList = function(list) {
        var data = {
            listClass:      utils.getClassname('list'),
            groupClass:     utils.getClassname('group'),
            groupNameClass: utils.getClassname('groupName'),
            selectedClass:  utils.getClassname('selected'),
            disabledClass:  utils.getClassname('disabled'),
            optionClass:    utils.getClassname('option'),
            options:        list || this.optionData,
            themeList:      this.options.list,
            themeSelected:  this.options.selected,
            themeDisabled:  this.options.disabled,
            themeOption:    this.options.option
        };

        return utils.render(templates.list, data);
    };

    Select.prototype.renderDrop = function() {
        var data = {
            dropID:        this.id,
            id:            this.el.id,
            dropClass:     utils.getClassname('drop'),
            themeDrop:     this.options.drop,
            multiple:      this.multiple,
            multipleClass: utils.getClassname('drop') + '-multiple',
            search:        this.renderSearchField(),
            list:          this.renderList()
        };

        return utils.render(templates.drop, data);
    };

    Select.prototype.prepareDrop = function() {
        this.$drop   = $(this.renderDrop());
        this.$list   = this.$drop.find('.' + utils.getClassname('list'));
        this.$search = this.$drop.find('.' + utils.getClassname('search') + ' input');
        this.setDropPosition();
        this.setListPosition();

        if(!this.options.search || this.options.searchItemLimit >= this.optionData.length) {
            this.$search.parent().addClass(utils.getClassname('hide'));
        }
        else {
            this.$search.parent().removeClass(utils.getClassname('hide'));
        }
    };

    Select.prototype.setDropPosition = function() {
        var dropStyle          = {
                top:      this.getPosition().top + this.$selection.height(),
                left:     this.getPosition().left,
                minWidth: this.$selection.outerWidth()
            },
            optionList         = $('.uxr-select-list'),
            dropHeight         = this.$drop.height() > 280 ? 280 : this.$drop.height(), // Max-height with search field
            keyboardHeight     = virtualKeyboardVisible ? 280 : 0,
            totalVisibleHeight = document.documentElement.clientHeight - keyboardHeight,
            topSpace           = this.$el.offset().top - $(window).scrollTop(),
            bottomSpace        = (totalVisibleHeight - topSpace) - this.$selection.height(),
            setPosition        = {
                top:    function() {
                    optionList.css({maxHeight: topSpace > 250 ? 250 : topSpace}); // Max-height for options
                },
                bottom: function() {
                    optionList.css({maxHeight: bottomSpace > 250 ? 250 : bottomSpace});
                }
            };

        if(bottomSpace >= dropHeight) {
            setPosition.bottom();
        } else {
            var position = (dropHeight - bottomSpace) < (dropHeight - topSpace) ? 'bottom' : 'top';
            if(position === 'bottom') {
                setPosition.bottom();
            } else {
                setPosition.top();
                dropStyle.top = this.getPosition().top - this.$drop.height();
            }
        }

        this.$drop.css(dropStyle).removeClass(utils.getClassname('reverseDrop'));

    };

    Select.prototype.setListPosition = function() {
        var selected = this.$list.find('.' + utils.getClassname('selected') + ':eq(0)');

        if(selected.length === 1) {
            this.$list.scrollTop(selected.offset().top - this.$list.offset().top - (this.$list.height() / 2));
        }
    };

    Select.prototype.setOriginalList = function() {
        this.$drop.find('.' + utils.getClassname('list')).replaceWith(this.$list);
    };

    Select.prototype.showDrop = function() {
        this.$drop.appendTo('body');
        this.setDropPosition();
        this.setListPosition();
        this.$list.find('.' + utils.getClassname('highlight')).removeClass(utils.getClassname('highlight'));
        this.bindDropUI();
    };

    Select.prototype.hideDrop = function() {
        var drop = $("#" + this.id);
        if(drop.length > 0) {
            $("#" + this.id).remove();
            this.$search.val('');
            this.setOriginalList();
        }
    };

    Select.prototype.open = function() {
        if(this.disabled || this.readonly) {
            return;
        }
        try{
            document.activeElement.blur();
        }catch(e){console.log(e);}
        ux.close();

        if(!this.$drop) {
            this.prepareDrop();
        }

        this.isVirtualKeyboardVisible();
        this.showDrop();
        this.$selection.parent().addClass(utils.getClassname('opened') + ' ' + this.options.opened);
        this.opened = true;
        this.$search.focus();
        this.emitEvent('open');
    };

    Select.prototype.close = function() {
        touchmove              = false;
        virtualKeyboardVisible = false;
        this.clicked           = false;
        this.tabbed            = false;
        this.opened            = false;
        this.unbindKeyupListener();
        this.hideDrop();
        this.$selection.parent().removeClass(utils.getClassname('opened') + ' ' + this.options.opened);
        this.emitEvent('close');
    };

    Select.prototype.onKeyup = function(e) {
        if(e.keyCode === keys.tab) {
            this.tabbed = true;
            //this.onFocus();
        }
    };

    Select.prototype.onClick = function(e) {
        try {
            if ( this.options.displayType === 'tags' ) {
                if( $(e.target).parent().hasClass( utils.getClassname('iconHolder') ) ){
                    return;
                }
            }
        }catch(e){
            console.log(e);
        }
        this.clicked = true;

        if(!this.opened) {
            this.onFocus();
        }
        else {
            this.onBlur();
        }
    };

    Select.prototype.onFocus = function() {
        focusedInstances.lastFocused = focusedInstances.current;
        focusedInstances.current     = this;
        this.open();
    };

    Select.prototype.onBlur = function() {
        this.close();
    };

    Select.prototype.onChange = function(e) {
        utils.callback(this.options.onChange);
    };

    Select.prototype.onReady = function() {
        utils.callback(this.options.onReady);
    };

    Select.prototype.onOpen = function() {
        utils.callback(this.options.onOpen);
    };

    Select.prototype.onClose = function() {
        utils.callback(this.options.onClose);
    };

    Select.prototype.onSelect = function() {
        utils.callback(this.options.onSelect);
    };

    Select.prototype.onUpdate = function() {
        utils.callback(this.options.onUpdate);
    };

    Select.prototype.onDestroy = function() {
        utils.callback(this.options.onDestroy);
    };

    Select.prototype.resetSelection = function() {
        this.removeSelection();
        this.addSelection();
        this.bindSelectionUI();
    };

    Select.prototype.update = function(opts) {
        var _opts = this.options;

        this.multiple = this.el.hasAttribute('multiple');
        this.disabled = this.el.hasAttribute('disabled');
        this.readonly = this.el.hasAttribute('readonly');

        // update new options
        this.options = $.extend(true, {}, _opts, opts);

        this.getOptionData();

        this.resetSelection();

        this.prepareDrop();

        this.emitEvent('update');
    };

    Select.prototype.destroy = function() {
        this.emitEvent('destroy');

        if(this.opened) {
            this.close();
            focusedInstances.current = null;
        }

        if(focusedInstances.current && focusedInstances.current.el === this.$el[0]) {
            focusedInstances.current = null;
        }

        this.unbindUI();
        this.undecorateUI();

        this.$el.removeData(rocketName);
    };

    Select.prototype.registry = function() {
        var uxrocket = this.$el.data(ns.rocket) || {};

        // register plugin data to rocket
        uxrocket[ns.data] = {
            hasWrapper: true,
            wrapper:    ns.wrap,
            ready:      utils.getClassname('ready'),
            selector:   this.selector,
            options:    this.options
        };

        this.$el.data(ns.rocket, uxrocket);
    };

    Select.prototype.getPosition = function() {
        return {
            top:  this.$selection.offset().top,
            left: this.$selection.offset().left
        };
    };

    Select.prototype.getWidth = function() {
        var classes = this.$el.attr('class'),
            styles  = this.$el.attr('style'),
            $shadow = $(document.createElement('div')).css('display', 'none'),
            attr    = '',
            w;

        if(classes) {
            attr += ' class="' + classes.replace(utils.getClassname('ready'), '').replace(utils.getClassname('hidden'), '') + '"';
        }

        if(styles) {
            attr += ' style="' + styles + '"';
        }

        $shadow.html('<div ' + attr + '></div>').appendTo('body');

        w = $shadow.find('div').css('width');
        // w is sometimes wrong because IE 11 does not return correct with value
        if(w === '0px' || w.indexOf('-') > -1) {
            w = this.$el.width() + 'px';
        }

        $shadow.remove();

        return w;
    };

    Select.prototype.emitEvent = function(which) {
        this.$el.trigger(events[which]);
    };

    Select.prototype.isTouchDevice = function() {
        return 'ontouchstart' in window || navigator.msMaxTouchPoints;
    };

    Select.prototype.isVirtualKeyboardVisible = function() {
        virtualKeyboardVisible = this.isTouchDevice();
    };

    /**
     * @param prop           property to be updated
     * @param comparison    property updated to be comparison case
     * @param val          new property value
     */
    Select.prototype.updateOptionData = function (prop, comparison, val) {

        var item = $.grep(this.optionData, function (item) {
            return item[comparison.prop] === comparison.val;
        });

        if (prop in item[0]) {
            item[0][prop] = val;
        }

    };

    // jQuery original select fallback
    var _select = $.fn.select;
    ux = $.fn.uxitdselect = $.fn.select = $.fn.Select = $.fn.uxrselect = $.uxrselect = function(options) {
        var selector = this.selector;

        return this.each(function() {
            if($.data(this, ns.data)) {
                return;
            }

            // Bind the plugin and attach the instance to data
            $.data(this, ns.data, new Select(this, options, selector));
        });
    };

    $.uxrselect.noConflict = true;

    ux.update = function(el, options) {
        var opts = options || el,
            $el;

        // all elements will update according to new options
        if(!el) {
            $el = $('.' + utils.getClassname('ready'));
        }
        // This is a selector that we should query
        else if(typeof el === 'string') {
            $el = $(el);
        }
        // Directly use given object
        else if(typeof el === 'object') {
            $el = el;
        }
        // Do nothing since this is an unexpected value like a number
        else {
            return;
        }

        $el.filter('select').each(function() {
            if($(this).hasClass(utils.getClassname('ready'))) {
                $(this).data(ns.data).update(opts);
            } else {
                console.warn('Component not initialized yet, update after initialization');
            }
        });
    };

    ux.close = function() {
        var $drops = $('.' + utils.getClassname('drop'));

        if($drops.length > 0) {
            $drops.each(function() {
                var instance = $(utils.escapeSelector('#' + $(this).data('select'))).data(ns.data);
                instance.close();
            });
        }
    };

    ux.destroy = ux.remove = function(el) {
        var $el = typeof el === 'undefined' ? $('.' + utils.getClassname('ready')) : $(el);

        $el.each(function() {
            $(this).data(ns.data).destroy();
        });
    };

    ux.getFocusedInstances = function() {
        return focusedInstances;
    };

    // shared events
    $(document)
        .on('ready', function() {
            if($.uxrselect.noConflict) {
                $.fn.select = _select;
            }
        })
        .on(events.click, function(e) {
            if(focusedInstances.current !== null) {
                focusedInstances.current.close();
            }
        });

    $(window).on(events.resize + ' ' + events.touchend + ' ' + events.scroll, function() {
        var $drops = $('.' + utils.getClassname('drop'));

        if($drops.length === 1) {
            $(utils.escapeSelector('#' + $drops.data('select'))).data(ns.data).setDropPosition();
        }
    });

// version
    ux.version = '3.6.3';

// default settings
    ux.settings  = defaults;
    ux.namespace = ns;
}));
