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
            // callbacks
            onReady      : false,
            onSelect     : false,
            onUpdate     : false,
            onRemove     : false
        },
        events = {
            click: 'click.' + rocketName,
            blur : 'blur.' + rocketName
        },
        ns = {
            prefix : 'uxr-',
            rocket : 'uxRocket',
            data   : rocketName,
            name   : 'select',
            wrap   : 'uxr-plugin-wrap',
            classes: {
                wrap : 'wrap',
                ready: 'ready',
                arrow: 'arrow'
            }
        };

    // Constructor Method
    var Select = function(el, options, selector) {
        var $el = $(el);

        this._instance = i;
        this._name = rocketName;
        this._defaults = defaults;

        this.el = el;
        this.$el = $el;
        this.id = 'uxr-select-options-' + i;

        this.selector = selector;
        this.terms = {};
        this.options = $.extend(true, {}, defaults, options, $el.data());

        i++;

        this.lastTerm = 'as';

        this.init();
    };

    $.extend(Select.prototype, {
        init         : function() {
            var uxrocket = this.$el.data(ns.rocket) || {};

            // add ready class
            this.$el.addClass(utils.getClassname('ready'));

            // register plugin data to rocket
            uxrocket[ns.data] = {hasWrapper: true, wrapper: ns.wrap, ready: utils.getClassname('ready'), selector: this.selector, options: this.options};
            this.$el.data(ns.rocket, uxrocket);


            // set plugin layout
            this.setLayout();

            utils.callback(this.options.onReady);

            this.bindUIActions();
        },
        handleClasses: function() {
            this.classList = this.$el.context.className.replace(utils.getClassname('ready'), '');

            if(this.selector.charAt(0) === '.') {
                this.classList = this.classList.replace(this.selector.substr(1), '');
            }

            this.classList += ns.wrap + ' ' + utils.getClassname('wrap') + ' ' + utils.getClassname('wrap') + '-' + this._instance;
            this.classList = $.trim(this.classList);
        },

        removeClasses: function() {
            this.$el.removeClass(utils.getClassname('ready'));
            this.$el.parent().removeClass(this.classList.replace(ns.wrap, ''));
        },

        handleWrapper: function() {
            this.$el.parent().is('.' + ns.wrap) ?
            this.$el.parent().addClass(this.classList) :
            this.$el.wrap('<span class="' + this.classList + '"></span>');
        },

        setLayout: function() {
            this.handleClasses();
            this.handleWrapper();
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

            _this.$el.next('.' + utils.getClassname('magnify')).remove();
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

            $ul.attr('id', this.id).addClass(utils.getClassname('select')).css('display', 'none').appendTo('body');

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
            $('.' + utils.getClassname('wrap') + '-' + this._instance).remove();

            this.removeContainer();
        }
    });

    var utils = {
        callback: function(fn) {
            // if callback string is function call it directly
            if(typeof fn === 'function') {
                fn.apply(this);
            }

            // if callback defined via data-attribute, call it via new Function
            else {
                if(fn !== false) {
                    var func = function() {
                        return fn;
                    };
                    func();
                }
            }
        },

        getStringVariable: function(str) {
            var val;
            // check if it is chained
            if(str.indexOf('.') > -1) {
                var chain = str.split('.'),
                    chainVal = window[chain[0]];

                for(var i = 1; i < chain.length; i++) {
                    chainVal = chainVal[chain[i]];
                }

                val = chainVal;
            }

            else {
                val = window[str];
            }

            return val;
        },

        getClassname: function(which) {
            return ns.prefix + ns.name + '-' + ns.classes[which];
        }
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
            $el = $('.' + utils.getClassname('ready'));
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
            utils.callback(_opts.onUpdate);
        });
    };

    ux.destroy = function(el) {
        var $el = el !== undefined ? $(el) : $('.' + utils.getClassname('ready'));

        $el.filter('input').each(function() {
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

            utils.callback(_instance.options.onRemove);
        });
    };

// version
    ux.version = '3.0.0';

// default settings
    ux.settings = defaults;
    ux.namespace = ns;
}));