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
            selection: '<span class="{{selectionClass}} {{#if multiple}}{{multipleClass}}{{/if}}" style="{{width}}">' +
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
                       '   <li>' +
                       '        <a class="{{optionClass}}" data-value="{{options.value}}">{{options.text}}</a>' +
                       '   </li>' +
                       '   {{/each}}' +
                       '</ul>'
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
                list:          'list',
                option:        'option',
                optionName:    'option-name',
                selected:      'selected',
                search:        'search',
                hidden:        'hidden'
            }
        };

    // Constructor Method
    var Select = function(el, options, selector) {
        var $el = $(el);

        this._instance = i;
        this._name     = rocketName;
        this._defaults = defaults;

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

        this.decorateUI();

        this.bindUI();

        this.getOptionData();

        this.$el.addClass(this.utils.getClassname('ready'));

        this.emitEvent('ready');
    };

    Select.prototype.getWidth = function() {
        var clone = this.$el
            .clone()
            .removeClass(this.utils.getClassname('ready') + ' ' + this.utils.getClassname('hidden'))
            .appendTo('body')
            .wrap('<div style="display:none"></div>'),
            w     = clone.css('width');

        clone.parent().remove();

        return w;
    };

    Select.prototype.getSelected = function() {
        return {
            value: this.$el.val(),
            text:  this.$el.find('option:selected').text()
        }
    };

    Select.prototype.getOptionData = function() {
        var _this = this;

        _this.optionData = [];

        this.$el.find('option').each(function() {
            _this.optionData.push({
                text:  $(this).text(),
                value: $(this).val()
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

    };

    Select.prototype.unwrap = function() {

    };

    Select.prototype.addSelection = function() {
        var selection = this.renderSelection();
        this.$el.after(selection);
    };

    Select.prototype.removeSelection = function() {

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
    };

    Select.prototype.unbindUI = function() {
        this.emitEvent('remove');
        this.$el.off('.' + rocketName);
    };

    Select.prototype.renderSelection = function() {
        var data = {
            selectionClass:     this.utils.getClassname('selection'),
            multiple:           this.multiple,
            multipleClass:      this.utils.getClassname('multiple'),
            width:              'width:' + this.width,
            selectionTextClass: this.utils.getClassname('selectionText'),
            selectionText:      this.getSelected()['text'],
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
            listClass:   this.utils.getClassname('list'),
            optionClass: this.utils.getClassname('option'),
            options:     this.optionData
        };

        return this.utils.render(templates.list, data);
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