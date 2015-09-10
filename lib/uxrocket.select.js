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
        i = 1,
        rocketName = 'uxrSelect',

        defaults = {
            wrapper : '',
            current : '',
            arrow   : '',
            list    : '',
            option  : '',
            selected: '',

            // callbacks
            onReady : false,
            onSelect: false,
            onUpdate: false,
            onRemove: false
        },
        events = {
            blur  : 'blur.' + rocketName,
            change: 'change.' + rocketName,
            click : 'click.' + rocketName,
            keyup : 'keyup.' + rocketName
        },
        ns = {
            prefix : 'uxr-',
            rocket : 'uxRocket',
            data   : rocketName,
            name   : 'select',
            wrap   : 'uxr-plugin-wrap',
            classes: {
                wrap       : 'wrap',
                ready      : 'ready',
                current    : 'current',
                currentText: 'current-text',
                arrow      : 'arrow',
                list       : 'list',
                option     : 'option',
                selected   : 'selected'
            }
        };

// Constructor Method
    var Select = function(el, options, selector) {
        var $el = $(el);

        this._instance = i;
        this._name = rocketName;
        this._defaults = defaults;

        this.utils = new window.uxrPluginUtils({ns: ns});

        this.el = el;
        this.$el = $el;
        this.id = 'uxr-select-options-' + i;

        this.selector = selector;
        this.options = $.extend(true, {}, defaults, options, $el.data());

        // add ready class
        this.$el.addClass(this.utils.getClassname('ready'));

        this.init();

        i++;
    };

    $.extend(Select.prototype, {
        init: function() {
            // add options to UX Rocket registry
            this.registry();

            // set plugin layout
            this.setLayout();

            // bind events
            this.bindUIActions();

            this.utils.callback(this.options.onReady);
        },

        registry: function() {
            var uxrocket = this.$el.data(ns.rocket) || {};

            // register plugin data to rocket
            uxrocket[ns.data] = {hasWrapper: true, wrapper: ns.wrap, ready: this.utils.getClassname('ready'), selector: this.selector, options: this.options};
            this.$el.data(ns.rocket, uxrocket);
        },

        handleClasses: function() {
            this.classList = this.$el.context.className.replace(this.utils.getClassname('ready'), '');

            if(this.selector.charAt(0) === '.') {
                this.classList = this.classList.replace(this.selector.substr(1), '');
            }

            this.classList += ns.wrap + ' ' + this.utils.getClassname('wrap') + ' ' + this.utils.getClassname('wrap') + '-' + this._instance;
            this.classList = $.trim(this.classList);
        },

        removeClasses: function() {
            this.$el.removeClass(this.utils.getClassname('ready'));
            this.$el.parent().removeClass(this.classList.replace(ns.wrap, ''));
        },

        handleWrapper: function() {
            this.$el.parent().is('.' + ns.wrap) ?
            this.$el.parent().addClass(this.classList) :
            this.$el.wrap('<label class="' + this.classList + '"></label>');
        },

        addCurrent: function() {
            var selectedText = this.$el.find(':selected').text(),
                selected = '<span class="' + this.utils.getClassname('current') + '">' +
                           '    <span class="' + this.utils.getClassname('currentText') + '">' + selectedText + '</span>' +
                           '    <span class="' + this.utils.getClassname('arrow') + '"></span>' +
                           '</span>';

            this.$el.after(selected);
        },

        setLayout: function() {
            this.handleClasses();
            this.handleWrapper();
            this.addCurrent();
        },

        removeLayout: function() {
            var _this = this,
                uxrocket = _this.$el.data(ns.rocket);

            // remove or reformat wrap
            if(Object.keys && Object.keys(uxrocket).length === 1) {
                _this.$el.unwrap();
            }

            else {
                _this.$el.parent().removeClass(ns.wrap);
            }

            _this.$el.next('.' + this.utils.getClassname('magnify')).remove();
        },

        removeContainer: function() {
            $('#' + this.id).remove();
        },

        bindUIActions: function() {
            var _this = this;

            $('body').on('DOMNodeRemoved', function(e) {
                if(e.target === _this.el) {
                    _this.cleanUp();
                }
            });
        },

        unbindUIActions: function() {
            this.$el.off('.' + rocketName);
        },

        prepareContainer: function() {
            var $ul = $('<ul></ul>');

            this.setPosition($ul);

            $ul.attr('id', this.id).addClass(this.utils.getClassname('select')).css('display', 'none').appendTo('body');

            this.$list = $ul;
        },

        setPosition: function($ul) {
            var offset = this.$el.offset(),
                top = offset.top + this.el.offsetHeight,
                left = offset.left,
                width = this.el.offsetWidth;

            return $ul.css({top: top, left: left, minWidth: width});
        },

        hideContainer: function() {
            $('#' + this.id).delay(100).hide();
        },

        update: function(options) {
            return ux.update(this.el, options);
        },

        destroy: function() {
            return ux.destroy(this.el);
        },

        cleanUp: function() {
            // remove wrapper
            $('.' + this.utils.getClassname('wrap') + '-' + this._instance).remove();

            this.removeContainer();
        }
    });

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
            $el = $('.' + this.utils.getClassname('ready'));
            opts = el;
        }
        else {
            $el = $(el);
            opts = options;
        }

        $el.filter('input').each(function() {
            var _this = $(this),
                _instance = _this.data(ns.data),
                _opts = _instance.options;

            // update new options
            _instance.options = $.extend(true, {}, _opts, opts);

            // use onUpdate callback from original options
            _this.utils.callback(_opts.onUpdate);
        });
    };

    ux.destroy = function(el) {
        var $el = el !== undefined ? $(el) : $('.' + this.utils.getClassname('ready'));

        $el.filter('select').each(function() {
            var _this = $(this),
                _instance = _this.data(ns.data),
                _uxrocket = _this.data(ns.rocket);

            // remove ready class
            _instance.removeClasses();

            // remove plugin events
            _instance.unbindUIActions();

            // remove container
            _instance.removeContainer();

            // remove plugin data
            _this.removeData(ns.data);

            // remove uxRocket registry
            delete _uxrocket[ns.data];
            _this.data(ns.rocket, _uxrocket);

            _this.utils.callback(_instance.options.onRemove);
        });
    };

// version
    ux.version = '3.0.0';

// default settings
    ux.settings = defaults;
    ux.namespace = ns;
}))
;