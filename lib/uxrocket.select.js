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
        i                = 1,
        rocketName       = 'uxrSelect',
        focusedInstances = {
            lastFocused: null,
            current:     null
        },
        touchmove        = false,

        templates        = {
            selection: '<a href="#" id="{{selectionClass}}-{{id}}" class="{{selectionClass}}{{#if multiple}} {{multipleClass}}{{/if}}{{#if disabled}} {{disabledClass}}{{/if}}{{#if readonly}} {{readonlyClass}}{{/if}} {{themeCurrent}}" style="{{width}}">' +
                       '    <span class="{{selectionTextClass}}">{{selectionText}}</span>' +
                       '    <span class="{{arrowClass}} {{themeArrow}}"></span>' +
                       '</a>',
            tags:      '{{#each selected}}' +
                       '<span class="{{selectionTagClass}} {{selectionTagClass}}-{{selected.index}}" data-index="{{selected.index}}" data-value="{{selected.value}}">' +
                       '    {{selected.text}}' +
                       '    <span class="{{removeSelectionClass}}">X</span>' +
                       '</span>' +
                       '{{/each}}',
            multi:     '<span class="{{selectionTagClass}} {{selectionTagClass}}-{{index}}" data-index="{{index}}" data-value="{{value}}">' +
                       '    {{selectionText}}' +
                       '    <span class="{{removeSelectionClass}}">X</span>' +
                       '</span>',
            search:    '<span class="{{searchClass}}">' +
                       '   <input type="text" name="{{searchInput}}" />' +
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

        defaults         = {
            wrapper:          '',
            opened:           '',
            current:          '',
            arrow:            '',
            drop:             '',
            list:             '',
            option:           '',
            selected:         '',
            disabled:         '',
            search:           true,
            searchItemLimit:  10, // search box will visible if more than 10 item present in select,
            searchType:       'starts', // starts or contain. search if term starts with the key or contain the key
            minLetters:       2,
            maxSelection:     0, // no limit
            maxSelectionWarn: 'You have reached allowed maximum selection',

            // callbacks
            onReady:   false,
            onOpen:    false,
            onClose:   false,
            onSelect:  false,
            onChange:  false,
            onUpdate:  false,
            onDestroy: false
        },
        events           = {
            focus:     'focus.' + rocketName,
            blur:      'blur.' + rocketName,
            change:    'change.' + rocketName,
            click:     'click.' + rocketName + ' touchend.' + rocketName + ' pointerup.' + rocketName + ' MSPointerUp.' + rocketName,
            mousedown: 'mousedown.' + rocketName + ' touchend.' + rocketName + ' pointerdown.' + rocketName + ' MSPointerDown.' + rocketName,
            keyup:     'keyup.' + rocketName,
            localkeyup:'keyup.' + rocketName + '.local',
            keydown:   'keydown.' + rocketName,
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
            destroy:   'uxrdestroy.' + rocketName
        },
        keys             = {
            codes:  {
                9:  'tab',
                13: 'return',
                27: 'esc',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            },
            tab:    9,
            return: 13,
            esc:    27,
            left:   37,
            up:     38,
            right:  39,
            down:   40
        },
        ns               = {
            prefix:  'uxr-',
            rocket:  'uxRocket',
            data:    rocketName,
            name:    'select',
            classes: {
                wrap:            'wrap',
                ready:           'ready',
                disabled:        'disabled',
                readonly:        'readonly',
                selection:       'selection',
                selectionText:   'selection-text',
                selectionTag:    'selected-tag',
                removeSelection: 'remove-selected-tag',
                arrow:           'arrow',
                multiple:        'multiple',
                opened:          'opened',
                drop:            'drop',
                reverseDrop:     'reverse-drop',
                list:            'list',
                option:          'option',
                optionName:      'option-name',
                group:           'group',
                groupName:       'group-name',
                highlight:       'highlight',
                selected:        'selected',
                search:          'search',
                hidden:          'aria-hidden',
                hide:            'hide'
            }
        },
        utils            = new window.uxrPluginUtils({ns: ns});

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

        this.options = $.extend(true, {}, defaults, options, this.$el.data());

        i++;

        this.init();
    };

    Select.prototype.init = function() {
        if(this.el.id === '') {
            this.el.id = ns.data + '-' + this._instance;
        }

        // add options to UX Rocket registry
        this.registry();

        this.getOptionData();

        this.decorateUI();

        this.bindUI();
        this.bindSelectionUI();

        this.$el.addClass(utils.getClassname('ready'));

        this.emitEvent('ready');
    };

    Select.prototype.getSelected = function() {
        var selected = [];

        if(this.multiple) {
            this.$el.find('option:selected').each(function() {
                selected.push({
                    index: $(this).index(),
                    value: $(this).attr('value'),
                    text:  $(this).text()
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
            .on(events.localkeyup, function(e) {
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

                _this.onClick(e);
            })
            .on(events.click, function(e) {
                e.stopPropagation();
                e.preventDefault();
            })
            .on(events.mousedown, '.' + utils.getClassname('removeSelection'), function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(_this.disabled) {
                    return false;
                }

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
        this.$el.off('.' + rocketName);
    };

    Select.prototype.unbindKeyupListener = function() {
        $(document).off(events.localkeyup);
    };

    Select.prototype.bindKeyupListener = function() {
        var _this = this;

        $(document).on(events.localkeyup, function(e) {
            e.preventDefault();

            if(e.keyCode === keys.up || e.keyCode === keys.down) {
                _this.navigateWithArrow(keys.codes[e.keyCode]);
            }
            else if(e.keyCode === keys.return) {
                _this.navigateWithEnter();
            }
            else if(_this.$search.val().length >= _this.options.minLetters) {
                _this.search(_this.$search.val());
            }
            else {
                _this.setOriginalList();
            }

            return true;
        });
    };


    Select.prototype.select = function($selected) {
        var selected        = utils.getClassname('selected'),
            highlight       = utils.getClassname('highlight'),
            selectionText   = utils.getClassname('selectionText'),
            selectionTag    = utils.getClassname('selectionTag'),
            removeSelection = utils.getClassname('removeSelection'),
            $option         = $selected.parent(),
            optionID        = $option.attr('id'),
            index           = $selected.data('index'),
            value           = $selected.data('value'),
            text            = $selected.text(),
            $val            = this.$el.val();

        if($option.hasClass(utils.getClassname('disabled'))) {
            return;
        }

        if(!this.multiple) {
            this.$list.find('.' + highlight).removeClass(highlight);
            this.$list.find('.' + selected).removeClass(selected);
            this.$selection.find('.' + selectionText).text(text);
            this.$el.find('option:eq(' + index + ')').prop('selected', true);
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
                this.deSelect(index);
            }

            else {
                if(this.options.maxSelection > 0 && $val !== null && $val.length >= this.options.maxSelection) {
                    alert(this.options.maxSelectionWarn);
                    return;
                }

                var tag = utils.render(templates.multi, {
                    selectionText:        text,
                    selectionTagClass:    selectionTag,
                    removeSelectionClass: removeSelection,
                    index:                index,
                    value:                value
                });

                $option.addClass(selected);

                if(this.$el.val() === null) {
                    this.$selection.find('.' + selectionText).html(tag);
                }
                else {
                    this.$selection.find('.' + selectionText).append(tag);
                }

                this.$el.find('option:eq(' + index + ')').prop('selected', true);
            }

            // multiple selection could change the selection height
            this.setDropPosition();
        }

        this.emitEvent('change');
    };

    Select.prototype.deSelect = function(index) {
        var selected      = utils.getClassname('selected'),
            selectionText = utils.getClassname('selectionText'),
            selectionTag  = utils.getClassname('selectionTag');

        if(!this.$drop) {
            this.prepareDrop();
        }

        this.$el.find('option:eq(' + index + ')').prop('selected', false);
        this.$drop.find('#' + utils.getClassname('option') + '-' + index).removeClass(selected);
        this.$selection.find('.' + selectionTag + '-' + index).remove();

        if(this.$el.val() === null) {
            this.$selection.find('.' + selectionText).text(this.multiplePlaceholder);
        }

        this.emitEvent('change');
    };

    Select.prototype.removeTag = function($tag) {
        this.deSelect($tag.data('index'));
        this.setDropPosition();
    };

    Select.prototype.search = function(term) {
        var _this = this,
            $list = this.$drop.find('.' + utils.getClassname('list')),
            results,
            list;

        results = $.map(this.optionData, function(item) {
            if(_this._search(item, term)) {
                return item;
            }
        });

        list = this.renderList(results);
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
            var $visibleList = $('#uxr-select-options-' + this._instance).find(".uxr-select-list"),
                highlight   = utils.getClassname('highlight'),
                highlighted = $visibleList.find('.' + highlight);

            if(highlighted.length > 0) {
                highlighted.removeClass(highlight);

                this.select(highlighted.find('a'));
                this.emitEvent('select');
            }
        }
    };

    Select.prototype.navigateWithArrow = function(updown) {
        var $highlighted,
            highlight   = utils.getClassname('highlight'),
            $visibleContent = $('#uxr-select-options-' + this._instance).find(".uxr-select-list"),
            $selectableItemsList = $visibleContent.find('[id^="uxr-select-option"]'),
            highlighted = ($visibleContent.find('.' + highlight).length > 0) ? $visibleContent.find('.' + highlight) : $visibleContent.find('.' + utils.getClassname('selected')),
            highlightedIndex = $selectableItemsList.index(highlighted),
            listPos     = $visibleContent.offset().top,
            scrollTop   = $visibleContent.scrollTop(),
            height      = $visibleContent.height();

        if(!highlighted.length) {
            var firstLast = updown === 'up' ? 'last' : 'first';

            $selectableItemsList[firstLast]().addClass(highlight);
        }

        else {
            highlighted.removeClass(highlight);

            if(updown === 'up') {
                // TODO: Discuss; Should I use this short hand here?
                // highlightedIndex = --highlightedIndex < 0 ? $selectableItemsList.length - 1: highlightedIndex;
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
                data.selectionText = this.renderSelectionTags();
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
            selected:             this.getSelected()
        };

        return utils.render(templates.tags, data);
    };

    Select.prototype.renderSearchField = function() {
        var data = {
            searchClass: utils.getClassname('search'),
            searchInput: utils.getClassname('search') + '-' + this._instance,
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

    Select.prototype.setDropPosition = function(keyboard) {
        this.$drop.css({
            top:      this.getPosition().top + this.$selection.height(),
            left:     this.getPosition().left,
            minWidth: this.$selection.outerWidth()
        }).removeClass(utils.getClassname('reverseDrop'));

        if(!this.inViewport(keyboard)) {
            this.$drop.css({
                top: this.getPosition().top - this.$drop.height()
            }).addClass(utils.getClassname('reverseDrop'));
        }
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
        if(this.$drop) {
            this.$drop.remove();
            this.$search.val('');
            this.setOriginalList();
        }
    };

    Select.prototype.open = function() {
        if(this.disabled || this.readonly) {
            return;
        }

        ux.close();

        if(!this.$drop) {
            this.prepareDrop();
        }

        this.showDrop();
        this.$selection.parent().addClass(utils.getClassname('opened') + ' ' + this.options.opened);
        this.opened = true;
        this.$search.focus();
        this.emitEvent('open');
    };

    Select.prototype.close = function() {
        touchmove    = false;
        this.clicked = false;
        this.tabbed  = false;
        this.opened  = false;
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

    Select.prototype.inViewport = function(keyboard) {
        var drop   = this.$drop.get(0),
            top    = drop.offsetTop,
            left   = drop.offsetLeft,
            width  = drop.offsetWidth,
            height = drop.offsetHeight;

        while(drop.offsetParent) {
            drop = drop.offsetParent;
            top += drop.offsetTop;
            left += drop.offsetLeft;
        }

        top = top + 20; // add a little gap to bottom for usability

        if(keyboard && this.isTouchDevice()) {
            top = top + 250;
        }

        return (
            top >= window.pageYOffset &&
            left >= window.pageXOffset &&
            (top + height) <= (window.pageYOffset + window.innerHeight) &&
            (left + width) <= (window.pageXOffset + window.innerWidth)
        );
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

        if(w === '0px') {
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
        var $el, opts;

        // all elements will update according to new options
        if(typeof options === 'undefined' && typeof el === 'object') {
            $el  = $('.' + utils.getClassname('ready'));
            opts = el;
        }
        else {
            $el  = $(el);
            opts = options;
        }

        $el.filter('select').each(function() {
            $(this).data(ns.data).update(opts);
        });
    };

    ux.close = function() {
        var $drops = $('.' + utils.getClassname('drop'));

        if($drops.length > 0) {
            $drops.each(function() {
                var instance = $(utils.escapeSelector('#' + $(this).data('select'))).data(ns.data);

                if(instance !== focusedInstances.current) {
                    instance.close();
                }
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
        })
        .on(events.keyup, function(e) {
            if(e.keyCode === keys.esc && focusedInstances.current !== null) {
                focusedInstances.current.close();
            }
        });

    $(window).on(events.resize + ' ' + events.touchend, function() {
        var $drops = $('.' + utils.getClassname('drop'));

        if($drops.length === 1) {
            $(utils.escapeSelector('#' + $drops.data('select'))).data(ns.data).setDropPosition();
        }
    });

// version
    ux.version = '3.3.0';

// default settings
    ux.settings  = defaults;
    ux.namespace = ns;
}));