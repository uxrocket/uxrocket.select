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

    var ux, // local shorthand
        i          = 1,
        rocketName = 'uxrSelect',

        templates  = {
            selection: '<span data-id="{{id}}" class="{{selectionClass}} {{#if multiple}}{{multipleClass}}{{/if}}" style="{{width}}">' +
                       '    <span class="{{selectionTextClass}}">{{selectionText}}</span>' +
                       '    <span class="{{arrowClass}}"></span>' +
                       '</span>',
            search:    '<span class="{{searchClass}}">' +
                       '   <input type="text" ' +
                       '          name="{{searchInput}}"' +
                       '          data-list="{{list}}" />' +
                       '</span>',
            list:      '<ul class="{{listClass}}">' +
                       '   {{#each options}}' +
                       '   <li{{#if options.selected}} class="{{selectedClass}}"{{/if}}>' +
                       '        <a class="{{optionClass}}" data-value="{{options.value}}">{{options.text}}</a>' +
                       '   </li>' +
                       '   {{/each}}' +
                       '</ul>',
            drop:      '<div id="{{dropID}}" class="{{dropClass}}">' +
                       '    {{search}}' +
                       '    {{list}}' +
                       '</div>'
        },

        defaults   = {
            wrapper:     '',
            current:     '',
            arrow:       '',
            list:        '',
            option:      '',
            selected:    '',
            search:      true,
            searchLimit: 10, // search box will visible if more than 10 item present in select

            // callbacks
            onReady:   false,
            onSelect:  false,
            onUpdate:  false,
            onDestroy: false
        },
        events     = {
            focus:   'focus.' + rocketName,
            blur:    'blur.' + rocketName,
            change:  'change.' + rocketName,
            click:   'click.' + rocketName,
            keyup:   'keyup.' + rocketName,
            // custom events
            ready:   'uxrready.' + rocketName,
            select:  'uxrselect.' + rocketName,
            update:  'uxrupdate.' + rocketName,
            destroy: 'uxrdestroy.' + rocketName
        },
        ns         = {
            prefix:  'uxr-',
            rocket:  'uxRocket',
            data:    rocketName,
            name:    'select',
            classes: {
                wrap:          'wrap',
                ready:         'ready',
                selection:     'selection',
                selectionText: 'selection-text',
                arrow:         'arrow',
                multiple:      'multiple',
                opened:        'opened',
                drop:          'drop',
                list:          'list',
                option:        'option',
                optionName:    'option-name',
                selected:      'selected',
                search:        'search',
                hidden:        'aria-hidden'
            }
        };

    // Constructor Method
    var Select = function(el, options, selector) {
        var $el = $(el);

        this._instance = i;
        this._name     = rocketName;
        this._defaults = defaults;
        this.wrapped   = false;

        this.utils = new window.uxrPluginUtils({ns: ns});

        this.el       = el;
        this.$el      = $el;
        this.id       = 'uxr-select-options-' + i;
        this.multiple = this.el.hasAttribute('multiple');
        this.width    = this.getWidth();
        this.selector = selector;
        this.options  = $.extend(true, {}, defaults, options, $el.data());

        i++;

        this.init();
    };

    Select.prototype.init = function() {
        if(this.el.id === '') {
            this.el.id = ns.data + '-' + this._instance;
        }

        // add options to UX Rocket registry
        this.registry();

        this.getPosition();
        this.getOptionData();

        this.decorateUI();

        this.prepareDrop();

        this.bindUI();

        this.$el.addClass(this.utils.getClassname('ready'));

        this.emitEvent('ready');
    };

    Select.prototype.getPosition = function() {
        this.position = {
            top:  this.el.offsetTop,
            left: this.el.offsetLeft
        };
    };

    Select.prototype.getWidth = function() {
        var clone = this.$el.clone(),
            w;

        clone
            .removeClass(this.utils.getClassname('ready') + ' ' + this.utils.getClassname('hidden'))
            .appendTo('body')
            .wrap('<div style="display:none"></div>');

        w = clone.css('width');

        clone.parent().remove();

        return w;
    };

    Select.prototype.getSelected = function() {
        return {
            value: this.$el.val(),
            text:  this.$el.find('option:selected').text()
        };
    };

    Select.prototype.getOptionData = function() {
        var _this = this;

        _this.optionData = [];

        this.$el.find('option').each(function() {
            _this.optionData.push({
                text:     $(this).text(),
                value:    $(this).val(),
                selected: $(this).is(':selected')
            });
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
            this.$el.parent().addClass(this.utils.getClassname('wrap'));
        }

        else {
            this.wrapped = true;
            this.$el.wrap('<label class="' + this.utils.getClassname('wrap') + '"></label>');
        }
    };

    Select.prototype.unwrap = function() {
        if(this.wrapped) {
            this.$el.unwrap();
        }
        else {
            this.$el.parent().removeClass(this.utils.getClassname('wrap'));
        }
    };

    Select.prototype.addSelection = function() {
        var selection = this.renderSelection();

        this.$selection = $(selection);
        this.$el.after(this.$selection);
    };

    Select.prototype.removeSelection = function() {
        this.$el.next('.' + this.utils.getClassname('selection')).remove();
        delete this.$selection;
    };

    Select.prototype.addAttributes = function() {
        this.$el
            .addClass(this.utils.getClassname('hidden'))
            .attr('aria-hidden', true);
    };

    Select.prototype.removeAttributes = function() {
        this.$el
            .removeAttr('aria-hidden')
            .removeClass(
                this.utils.getClassname('hidden') + ' ' +
                this.utils.getClassname('ready')
            );
    };

    Select.prototype.bindUI = function() {
        var _this = this;

        _this.$el
            .on(events.focus, function(e) {
                e.preventDefault();
                _this.onFocus();
            })
            .on(events.blur, function() {
                _this.onBlur();
            })
            .on(events.change, function() {
                _this.onChange();
            })
            .on(events.ready, function() {
                _this.onReady();
            })
            .on(events.select, function() {
                _this.onSelect();
            })
            .on(events.update, function() {
                _this.onUpdate();
            })
            .on(events.destroy, function() {
                _this.onDestroy();
            });

        _this.$selection
            .on(events.click, function(e) {
                e.preventDefault();
                _this.onFocus();
            });

        _this.$drop
            .on(events.click, '.' + _this.utils.getClassname('option'), function(e) {
                e.preventDefault();
            })
            .on(events.keyup, '.' + _this.utils.getClassname('search') + ' input', function(e) {
                e.preventDefault();
            });
    };

    Select.prototype.unbindUI = function() {
        this.emitEvent('destroy');
        this.$el.off('.' + rocketName);
    };

    Select.prototype.showDrop = function() {
        this.$drop.appendTo('body');
    };

    Select.prototype.hideDrop = function() {
        //this.$drop.remove();
    };

    Select.prototype.renderSelection = function() {
        var data = {
            id:                 this.el.id,
            selectionClass:     this.utils.getClassname('selection'),
            multiple:           this.multiple,
            multipleClass:      this.utils.getClassname('multiple'),
            width:              'width:' + this.width,
            selectionTextClass: this.utils.getClassname('selectionText'),
            selectionText:      this.getSelected().text,
            arrowClass:         this.utils.getClassname('arrow')
        };

        return this.utils.render(templates.selection, data);
    };

    Select.prototype.renderSearchField = function() {
        var data = {
            searchClass: this.utils.getClassname('search'),
            searchInput: this.utils.getClassname('search') + '-' + this._instance,
            list:        this.id
        };

        return this.utils.render(templates.search, data);
    };

    Select.prototype.renderList = function() {
        var data = {
            listClass:     this.utils.getClassname('list'),
            selectedClass: this.utils.getClassname('selected'),
            optionClass:   this.utils.getClassname('option'),
            options:       this.optionData
        };

        return this.utils.render(templates.list, data);
    };

    Select.prototype.renderDrop = function() {
        var data = {
            dropID:    this.id,
            dropClass: this.utils.getClassname('drop'),
            search:    this.renderSearchField(),
            list:      this.renderList()
        };

        return this.utils.render(templates.drop, data);
    };

    Select.prototype.prepareDrop = function() {
        this.$drop = $(this.renderDrop());
        this.setDropPosition();
    };

    Select.prototype.setDropPosition = function() {
        this.$drop.css({
            top:  this.position.top,
            left: this.position.left,
            minWidth: this.$selection.outerWidth()
        });
    };

    Select.prototype.onFocus = function() {
        this.showDrop();
        this.$selection.addClass(this.utils.getClassname('opened'));
    };

    Select.prototype.onBlur = function() {

    };

    Select.prototype.onChange = function() {

    };

    Select.prototype.onReady = function() {
        this.utils.callback(this.options.onReady);
    };

    Select.prototype.onSelect = function() {
        this.utils.callback(this.options.onSelect);
    };

    Select.prototype.onUpdate = function() {
        this.utils.callback(this.options.onUpdate);
    };

    Select.prototype.onDestroy = function() {
        this.utils.callback(this.options.onDestroy);
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
            ready:      this.utils.getClassname('ready'),
            selector:   this.selector,
            options:    this.options
        };

        this.$el.data(ns.rocket, uxrocket);
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
            $el  = $('.uxr-select-ready');
            opts = el;
        }
        else {
            $el  = $(el);
            opts = options;
        }

        $el.filter('input').each(function() {
            var _this     = $(this),
                _instance = _this.data(ns.data),
                _opts     = _instance.options;

            // update new options
            _instance.options = $.extend(true, {}, _opts, opts);

            // use onUpdate callback from original options
            _this.utils.callback(_opts.onUpdate);
        });
    };

    ux.destroy = function(el) {
        var $el = typeof el === 'undefined' ? $('.' + utils.getClassname('ready')) : $(el);

        $el.each(function() {
            $(this).data(ns.data).destroy();
        });
    };

// version
    ux.version = '3.0.0';

// default settings
    ux.settings  = defaults;
    ux.namespace = ns;
}));