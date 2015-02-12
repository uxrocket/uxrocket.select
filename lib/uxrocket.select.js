/**
 * UX Rocket
 * jQuery based Select box replacement function
 * @author Bilal Cinarli
 */


;
(function($) {
    var ux, // local shorthand

        defaults = {
            // class names for the layout
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
            blur   : 'blur.uxSelect',
            change : 'change.uxSelect',
            click  : 'click.uxSelect',
            focus  : 'focus.uxSelect',
            keydown: 'keydown.uxSelect'
        },
        ns = {
            rocket    : 'uxRocket',
            data      : 'uxSelect',
            ready     : 'uxitd-select-ready',
            index     : 'uxitd-select-index-',
            rocketWrap: 'uxitd-plugin-wrap',
            wrap      : 'uxitd-select-wrap',
            list      : 'uxitd-select-list',
            item      : 'uxitd-select-list-item',
            option    : 'uxitd-select-option',
            selected  : 'uxitd-select-option-selected',
            current   : 'uxitd-select-current',
            text      : 'uxitd-select-current-text',
            arrow     : 'uxitd-select-arrow',
            readonly  : 'uxitd-select-readonly',
            focused   : 'uxitd-select-focused'
        },
        index = 1;

    // constructor method
    var Select = function(el, options, selector) {
        var opts,
            $el = $(el),
            id = $el.attr('id');

        if(id === undefined) {
            $el.attr('id', ns.index + index);
            id = ns.index + index;
        }

        // set options
        opts = $.extend({}, defaults, options, $el.data(), {'id': id, 'index': index, 'selector': selector});

        $el.data(ns.data, opts);

        setLayout($el);

        // call Ready Callback
        callback(opts.onReady);

        bindUIActions($el);

        $el.on(events.keydown, function(e) {
            $('.' + ns.selected).removeClass(ns.selected + ' ' + opts.selected);
        });

        index++;
    };

    var setLayout = function($el) {
        var columns,
            _opts = $el.data(ns.data),
            $current = setText($el.find(':selected').text()),
            optionList = builtOptions($el);

        columns = ' ' + $el.context.className.replace(ns.ready, '');

        if(_opts.selector.charAt(0) == '.') {
            columns = columns.replace(' ' + _opts.selector.substr(1), '');
        }

        if($el.is('.readonly')) {
            columns += ' ' + ns.readonly;
        }

        if($el.parent().is('.' + ns.rocketWrap)) {
            $el.parent().addClass(ns.wrap + ' ' + _opts.wrapper + columns);
        }
        else if($el.parent().is('label') && $el.is(':only-child')) {
            $el.parent().addClass(ns.rocketWrap + ' ' + ns.wrap + ' ' + _opts.wrapper + columns);
        }
        else if(!$el.parent().is('label')) {
            $el.wrap('<label class="' + ns.rocketWrap + ' ' + ns.wrap + ' ' + _opts.wrapper + columns + '"></label>');
        }
        else {
            $el.wrap('<span class="' + ns.rocketWrap + ' ' + ns.wrap + ' ' + _opts.wrapper + columns + '"></span>');
        }

        $el.after(
            '<span class="' + ns.current + ' ' + _opts.current + '">' +
            '   <span class="' + ns.text + '">' + $current + '</span>' +
            '   <span class="' + ns.arrow + ' ' + _opts.arrow + '"></span>' +
            '</span>');

        $('body').append(optionList);
    };

    var bindUIActions = function($el) {
        var _opts = $el.data(ns.data);

        $('#' + ns.list + '-' + _opts.index).not('.' + ns.readonly).on(events.click, '.' + ns.option, function(e) {
            e.preventDefault();
            selectOption($(this));
        });

        $el.not('.readonly').off(events.focus).on(events.focus, function(e) {
            var $this = $(this);

            toggleList($this);
        })
            .off(events.change).on(events.change, function(e) {
                var $v = $el.val(),
                    id = $el.attr('id'),
                    $current = $el.siblings('.' + ns.current).find('.' + ns.text),
                    $options = $('.' + ns.list).filter('[data-select="' + id + '"]').find('.' + ns.option),
                    $selected = $options.filter('[data-value="' + $v + '"]');

                $current.html($selected.html());
                $selected.addClass(ns.selected);

                $el.on(events.keydown, function(e) {
                    if(!e) e = $el.event;
                    if(e.keyCode == '13') {
                        toggleList($el);
                    }
                });

                callback(_opts.onSelect);

            })
            .off(events.blur).on(events.blur, function(e) {
                $(this).animate({opacity: 1}, 150, function() {
                    $(this).removeClass(ns.focused);
                });
            });

        $(document).on(events.click, function(e) {
            if(!$(e.target).is('.' + ns.wrap + ', .' + ns.wrap + ' *')) {
                $("." + ns.list).hide();
                $("." + ns.focused).removeClass(ns.focused);
            }
        });

    };

    var toggleList = function($el) {
        var data = $el.attr('id'),
            pos = $el.offset(),
            $w = $el.parents('.' + ns.wrap).width(),
            $lists = $('.' + ns.list),
            $list = $lists.filter('[data-select="' + data + '"]');

        $lists.not($list).hide();
        $list.css({minWidth: $w, top: pos.top, left: pos.left}).toggle();
        $el.toggleClass(ns.focused);
    };

    var selectOption = function($option) {
        var $list = $option.parents('.' + ns.list),
            $el = $("#" + $list.data('select')),
            _opts = $el.data(ns.data),
            $v = $option.data('value');

        $list.find('.' + ns.selected).removeClass(ns.selected + ' ' + _opts.selected);

        $el.val($v).trigger(events.change);
    };

    var builtOptions = function($el) {
        var list,
            _opts = $el.data(ns.data),
            id = $el.attr('id'),
            readonly = '';

        if($el.is('.readonly')) {
            readonly = ' ' + ns.readonly;
        }

        list = '<ul id="' + ns.list + '-' + _opts.index + '" data-select="' + id + '" class="' + ns.list + ' ' + _opts.list + readonly + '">';

        $el.find('option').each(function() {
            var $o = $(this);

            list += '<li class="group ' + ns.item + '"><a class="group ' + ns.option + ' ' + _opts.option;

            if($o.is(':selected')) {
                list += ' ' + ns.selected + ' ' + _opts.selected;
            }

            list += '" data-index="' + $o.index() + '" data-value="' + $o.val() + '">' + setText($o.text()) + '</a></li>';
        });

        list += '</ul>';

        return list;
    };

    var setText = function(text) {
        // replace brackets syntax to tags
        return text.replace(/\[/g, '<').replace(/]/g, '>');
    };

    // global callback
    var callback = function(fn) {
        // if callback string is function call it directly
        if(typeof fn === 'function') {
            fn.apply(this);
        }

        // if callback defined via data-attribute, call it via new Function
        else {
            if(fn !== false) {
                var func = new Function('return ' + fn);
                func();
            }
        }
    };

    // jquery bindings
    ux = $.fn.select = $.uxselect = function(options) {
        var selector = this.selector;

        return this.each(function() {
            var $el = $(this),
                uxrocket = $el.data(ns.rocket) || {},
                select;

            if(!$el.is('select') || $el.hasClass(ns.ready)) {
                return;
            }

            $el.addClass(ns.ready);

            uxrocket[ns.data] = {'hasWrapper': true, 'wrapper': ns.wrap, 'ready': ns.ready, 'selector': selector, 'options': options};

            $el.data(ns.rocket, uxrocket);

            $el.on(events.keydown, function(e) {
                if(!e) e = $el.event;
                if(e.keyCode == '13') {
                    return false;
                }
            });

            select = new Select(this, options, selector);
        });
    };

    // update method for dom edits
    ux.update = function(el) {
        var $el;

        if(el === undefined) {
            $el = $("select." + ns.ready);
        }
        else {
            $el = $(el);
        }

        $el.each(function() {
            var _opts = $(this).data(ns.data),
                optionList = builtOptions($(this)),
                $current = setText($(this).find(':selected').text());
            $(this).next('.' + ns.current).find('.' + ns.text).text($current);
            $('.' + ns.list).filter('[data-select="' + $(this).attr('id') + '"]').replaceWith(optionList);

            callback(_opts.onUpdate);
        });

        bindUIActions($el);
    };

    // remove
    ux.remove = function(el) {
        var $el;

        if(el === undefined) {
            $el = $("select." + ns.ready);
        }
        else {
            $el = $(el);
        }

        $el.each(function() {
            var _this = $(this),
                _instance = _this.data(ns.data),
                _uxrocket = _this.data(ns.rocket);

            // remove list
            $('#' + ns.list + '-' + _instance.index).remove();

            // remove current text
            _this.next('.' + ns.current).remove();

            // remove wrapper classes
            _this.parent().removeClass(ns.wrap + ' ' + ns.readonly + ' ' + _instance.wrapper);

            // remove events
            _this.off(events.focus + ' ' + events.change + ' ' + events.blur + ' ' + events.keydown);
            $(document).off(events.click);

            // remove plugin data
            _this.removeData(ns.data);

            // remove uxRocket registry
            delete _uxrocket[ns.data];
            _this.data(ns.rocket, _uxrocket);

            // remove ready class
            _this.removeClass(ns.ready);

            callback(_instance.onRemove);
        });
    };

    // Version
    ux.version = "2.6.1b";

    // settings
    ux.settings = defaults;
})(jQuery);