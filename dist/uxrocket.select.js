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
        rocketName = 'uxrSelect',
        focusedInstances = {
            lastFocused: null,
            current:     null
        },
        touchmove        = false,

        templates        = {
            selection: '<a href="#" id="{{selectionClass}}-{{id}}" class="{{selectionClass}}{{#if multiple}} {{multipleClass}}{{/if}}{{#if disabled}} {{disabledClass}}{{/if}} {{themeCurrent}}" style="{{width}}">' +
                       '    <span class="{{selectionTextClass}}">{{selectionText}}</span>' +
                       '    <span class="{{arrowClass}} {{themeArrow}}"></span>' +
                       '</a>',
            multi:     '<span class="{{selectionTagClass}} {{selectionTagClass}}-{{index}}" data-index="{{index}}" data-value="{{value}}">' +
                       '    {{selectionText}}' +
                       '    <span class="{{removeSelectionClass}}">X</span>' +
                       '</span>',
            search:    '<span class="{{searchClass}}">' +
                       '   <input type="text" name="{{searchInput}}" />' +
                       '</span>',
            list:      '<ul class="{{listClass}} {{themeList}}">' +
                       '   {{#each options}}' +
                       '   <li id="{{optionClass}}-{{options.index}}"{{#if options.selected}} class="{{selectedClass}} {{themeSelected}}"{{/if}}>' +
                       '        <a class="{{optionClass}} {{themeOption}}" data-index="{{options.index}}" data-value="{{options.value}}">{{options.text}}</a>' +
                       '   </li>' +
                       '   {{/each}}' +
                       '</ul>',
            drop:      '<div id="{{dropID}}" data-select="{{id}}" class="{{dropClass}}{{#if multiple}} {{multipleClass}}{{/if}}">' +
                       '    {{search}}' +
                       '    {{list}}' +
                       '</div>'
        },

        defaults         = {
            wrapper:         '',
            opened:          '',
            current:         '',
            arrow:           '',
            list:            '',
            option:          '',
            selected:        '',
            search:          true,
            searchItemLimit: 10, // search box will visible if more than 10 item present in select,
            searchType:      'starts', // starts or contain. search if term starts with the key or contain the key
            minLetters:      2,

            // callbacks
            onReady:   false,
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
            keydown:   'keydown.' + rocketName,
            input:     'input.' + rocketName,
            resize:    'resize.' + rocketName,
            touchend:  'touchend.' + rocketName + ' pointerup.' + rocketName + ' MSPointerUp.' + rocketName,
            touchmove: 'touchmove.' + rocketName,
            // custom events
            ready:     'uxrready.' + rocketName,
            select:    'uxrselect.' + rocketName,
            update:    'uxrupdate.' + rocketName,
            destroy:   'uxrdestroy.' + rocketName
        },
        keys             = {
            codes: {
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

        //utils = new window.uxrPluginUtils({ns: ns});

        this.el       = el;
        this.$el      = $(el);
        this.id       = 'uxr-select-options-' + i;
        this.multiple = this.el.hasAttribute('multiple');
        this.disabled = this.el.hasAttribute('disabled');
        this.width    = this.getWidth();
        this.selector = selector;
        this.opened   = false;
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

        this.$el.addClass(utils.getClassname('ready'));

        this.emitEvent('ready');
    };

    Select.prototype.getSelected = function() {
        return {
            value: this.$el.val(),
            text:  this.$el.find('option:selected').text()
        };
    };

    Select.prototype.getOptionData = function() {
        var _this = this,
            index = 0;

        _this.optionData = [];

        this.$el.find('option').each(function() {
            _this.optionData.push({
                index:    index,
                text:     $(this).text(),
                value:    $(this).val(),
                selected: $(this).is(':selected')
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

                _this.onClick(e);
            })
            .on(events.click, function(e) {
                e.stopPropagation();
            })
            .on(events.mousedown, '.' + utils.getClassname('removeSelection'), function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(_this.disabled) {
                    return false;
                }

                _this.removeTag($(this).parent());
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
            .on(events.click, '.' + utils.getClassname('option'), function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(!touchmove) {
                    _this.emitEvent('select');
                    _this.select($(e.currentTarget));
                }

                touchmove = false;
            })
            .on(events.keyup + ' ' + events.input, '.' + utils.getClassname('search') + ' input', function(e) {
                e.stopPropagation();
                e.preventDefault();

                if(e.keyCode === keys.up || e.keyCode === keys.down) {
                    _this.navigateWithArrow(keys.codes[e.keyCode]);
                }

                if(e.keyCode === keys.return) {
                    _this.navigateWithEnter();
                }

                if(this.value.length >= _this.options.minLetters) {
                    _this.search(this.value);
                }
                else {
                    _this.setOriginalList();
                }
            });
    };

    Select.prototype.unbindUI = function() {
        this.emitEvent('destroy');
        this.$el.off('.' + rocketName);
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
            text            = $selected.text();

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

        this.$el.find('option:eq(' + index + ')').prop('selected', false);
        this.$drop.find('.' + utils.getClassname('list') + ' li:eq(' + index + ')').removeClass(selected);
        this.$selection.find('.' + selectionTag + '-' + index).remove();

        if(this.$el.val() === null) {
            this.$selection.find('.' + selectionText).text(this.multiplePlaceholder);
        }
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
            var highlight   = utils.getClassname('highlight'),
                highlighted = this.$list.find('.' + highlight);

            if(highlighted.length > 0) {
                highlighted.removeClass(highlight);

                this.select(highlighted.find('a'));
                this.emitEvent('select');
            }
        }
    };

    Select.prototype.navigateWithArrow = function(updown) {
        var $highlighted,
            direction   = updown === 'up' ? 'prev' : 'next',
            highlight = utils.getClassname('highlight'),
            highlighted = (this.$list.find('.' + highlight).length > 0) ? this.$list.find('.' + highlight) : this.$list.find('.' + utils.getClassname('selected')),
            listPos     = this.$list.offset().top,
            scrollTop   = this.$list.scrollTop(),
            height      = this.$list.height();

        if(!highlighted.length) {
            var firstLast = updown === 'up' ? 'last' : 'first';

            $highlighted = this.$list.find('li')[firstLast]().addClass(highlight);
        }

        else {
            $highlighted = highlighted.removeClass(highlight)[direction]().addClass(highlight);

            if(!$highlighted.length) {
                if(direction === 'prev') { // move to last
                    $highlighted = this.$list.find('li').last().addClass(highlight);
                }
                else { // move to first
                    $highlighted = this.$list.find('li').first().addClass(highlight);
                }
            }

            if($highlighted.length) {
                if(updown === 'down') {
                    if($highlighted.offset().top > (listPos + height - $highlighted.height())) {
                        this.$list.scrollTop(scrollTop + $highlighted.height());
                    }
                    else if(($highlighted.offset().top < listPos)) {
                        this.$list.scrollTop(0); // move to top
                    }
                }

                else {
                    if(($highlighted.offset().top < listPos)) {
                        this.$list.scrollTop(scrollTop - $highlighted.height());
                    }
                    else if($highlighted.offset().top > (listPos + height)) {
                        this.$list.scrollTop(scrollTop + $highlighted.offset().top); // move to last
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
            width:              'width:' + this.width,
            selectionTextClass: utils.getClassname('selectionText'),
            selectionText:      this.getSelected().text,
            arrowClass:         utils.getClassname('arrow'),
            themeCurrent:       this.options.current,
            themeArrow:         this.options.arrow
        };

        if(this.multiple) {
            this.multiplePlaceholder = this.$el.attr('placeholder') || this.options.placeholder || '';

            data.selectionText = this.multiplePlaceholder;
        }

        return utils.render(templates.selection, data);
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
            listClass:     utils.getClassname('list'),
            selectedClass: utils.getClassname('selected'),
            optionClass:   utils.getClassname('option'),
            options:       list || this.optionData,
            themeList:     this.options.list,
            themeSelected: this.options.selected,
            themeOption:   this.options.option
        };

        return utils.render(templates.list, data);
    };

    Select.prototype.renderDrop = function() {
        var data = {
            dropID:        this.id,
            id:            this.el.id,
            dropClass:     utils.getClassname('drop'),
            multiple:      this.multiple,
            multipleClass: utils.getClassname('drop') + '-multiple',
            search:        this.renderSearchField(),
            list:          this.renderList()
        };

        return utils.render(templates.drop, data);
    };

    Select.prototype.prepareDrop = function() {
        if(!this.$drop) {
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
        }
    };

    Select.prototype.setDropPosition = function() {
        this.$drop.css({
            top:      this.getPosition().top + this.$selection.height(),
            left:     this.getPosition().left,
            minWidth: this.$selection.outerWidth()
        }).removeClass(utils.getClassname('reverseDrop'));

        if(!this.inViewport()) {
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
        if(this.disabled) {
            return;
        }

        ux.close();

        this.prepareDrop();
        this.showDrop();
        this.$selection.parent().addClass(utils.getClassname('opened') + ' ' + this.options.opened);
        this.opened = true;
    };

    Select.prototype.close = function() {
        touchmove    = false;
        this.clicked = false;
        this.tabbed  = false;
        this.opened  = false;
        this.hideDrop();
        this.$selection.parent().removeClass(utils.getClassname('opened') + ' ' + this.options.opened);
    };

    Select.prototype.onKeyup = function(e) {
        switch(e.keyCode) {
            case keys.tab:
                this.tabbed = true;
                //this.onFocus();
                break;
            case keys.return:
                this.navigateWithEnter();
                break;
            case keys.up:
            case keys.down:
                this.navigateWithArrow(keys.codes[e.keyCode]);
                break;
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

    Select.prototype.onSelect = function() {
        utils.callback(this.options.onSelect);
    };

    Select.prototype.onUpdate = function() {
        utils.callback(this.options.onUpdate);
    };

    Select.prototype.onDestroy = function() {
        utils.callback(this.options.onDestroy);
    };

    Select.prototype.update = function() {
        this.emitEvent('update');
    };

    Select.prototype.destroy = function() {
        this.emitEvent('destroy');
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

    Select.prototype.inViewport = function() {
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

    ux = $.fn.select = $.fn.uxrselect = $.fn.uxitdselect = $.uxrselect = function(options) {
        var selector = this.selector;

        return this.each(function() {
            if($.data(this, ns.data)) {
                return;
            }

            // Bind the plugin and attach the instance to data
            $.data(this, ns.data, new Select(this, options, selector));
        });
    };

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
            var _this     = $(this),
                _instance = _this.data(ns.data),
                _opts     = _instance.options;

            // update new options
            _instance.options = $.extend(true, {}, _opts, opts);

            // use onUpdate callback from original options
            utils.callback(_opts.onUpdate);
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

    ux.destroy = function(el) {
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
        .on(events.click, function(e) {
            if(focusedInstances.current !== null) {
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
    ux.version = '3.0.0-rc4';

// default settings
    ux.settings  = defaults;
    ux.namespace = ns;
}));