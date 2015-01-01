/**
 * UX Rocket
 * jQuery based Select box replacement function
 * @author Bilal Cinarli
 */


;(function($){
    var ux, // local shorthand

        defaults = {
            // class names for the layout
            wrapper: '',
            current: '',
            arrow: '',
            list: '',
            option: '',
            selected: '',

            // callbacks
            onReady: false,
            onSelect: false
        },
        index = 1,
        opts;


    // constructor method
    var Select = function(el, options, selector){
        var $el = $(el),
            id = $el.attr('id');

        if(id === undefined){
            $el.attr('id', 'uxitd-select-index-' + index);
            id = 'uxitd-select-index-' + index;
        }

        // set options
        opts = $.extend({}, defaults, options, $el.data(), {'id': id, 'index': index, 'selector': selector});

        $el.data('uxSelect', opts);

        setLayout($el);

        // call Ready Callback
        callback(opts.onReady);

        bindUIActions($el);

        $el.keydown(function(e){
            $('.uxitd-select-option-selected').removeClass('uxitd-select-option-selected').removeClass(opts.selected);
        });

        index++;
    };

    var setLayout = function($el){
        var columns,
            _opts = $el.data('uxSelect'),
            $current = setText($el.find(':selected').text()),
            optionList = builtOptions($el);

        columns = ' ' + $el.context.className.replace('uxitd-select-ready', '');

        if(_opts.selector.charAt(0) == '.') {
            columns = columns.replace(' ' + _opts.selector.substr(1), '');
        }

        if($el.is('.readonly')){
            columns += ' uxitd-select-readonly';
        }

        if($el.parent().is('.uxitd-plugin-wrap')){
            $el.parent().addClass('uxitd-select-wrap' + columns).addClass(opts.wrapper);
        }
        else if($el.parent().is('label') && $el.is(':only-child')){
            $el.parent().addClass('uxitd-plugin-wrap uxitd-select-wrap' + columns).addClass(opts.wrapper);
        }
        else if(!$el.parent().is('label')){
            $el.wrap('<label class="uxitd-plugin-wrap uxitd-select-wrap ' + opts.wrapper + columns + '"></label>');
        }
        else {
            $el.wrap('<span class="uxitd-plugin-wrap uxitd-select-wrap ' + opts.wrapper + columns + '"></span>');
        }

        $el.after(
                '<span class="uxitd-select-current ' + opts.current + '">' +
                '<span class="uxitd-select-current-text">' + $current + '</span>' +
                '<span class="uxitd-select-arrow ' + opts.arrow + '"></span>' +
                '</span>');

        $('body').append(optionList);
    };

    var bindUIActions = function($el){
        var _opts = $el.data('uxSelect');

        $('#uxitd-select-list-' + _opts.index).not('.uxitd-select-readonly').on('click', '.uxitd-select-option', function(e){
            e.preventDefault();
            selectOption($(this));
        });

        $el.not('.readonly').off('focus').on('focus', function(e){
            var $this = $(this);

            toggleList($this);

        })
        .off('change').on('change', function(e){
            var $v = $el.val(),
                id = $el.attr('id'),
                $current = $el.siblings('.uxitd-select-current').find('.uxitd-select-current-text'),
                $options = $('.uxitd-select-list').filter('[data-select="' + id + '"]').find('.uxitd-select-option'),
                $selected = $options.filter('[data-value="' + $v + '"]');

            $current.html($selected.html());
            $selected.addClass('uxitd-select-option-selected');

            $el.keydown(function(e){
                if (!e) e = $el.event;
                if (e.keyCode == '13'){
                    toggleList($el);
                }
            });

            callback(_opts.onSelect);

        })
        .off('blur').on('blur', function(e){
            $(this).animate({ opacity: 1 }, 150, function(){
                $(this).removeClass('uxitd-focused');
            });
        });

        $(document).on('click', function (e) {
            if(!$(e.target).is('.uxitd-select-wrap, .uxitd-select-wrap *')){
                $(".uxitd-select-list").hide();
                $(".uxitd-select-focused").removeClass('uxitd-select-focused');
            }
        });

    };

    var toggleList = function($el){
        var data = $el.attr('id'),
            pos = $el.offset(),
            $w = $el.parents('.uxitd-select-wrap').width(),
            $list = $('.uxitd-select-list').filter('[data-select="' + data + '"]');

        $('.uxitd-select-list').not($list).hide();
        $list.css({minWidth: $w, top: pos.top, left: pos.left}).toggle();
        $el.toggleClass('uxitd-select-focused');
    };

    var selectOption = function($option){
        var $list = $option.parents('.uxitd-select-list'),
            $el = $("#" + $list.data('select')),
            _opts = $el.data('uxSelect'),
            $v = $option.data('value');

        $list.find('.uxitd-select-option-selected').removeClass('uxitd-select-option-selected').removeClass(_opts.selected);

        $el.val($v).trigger('change');
    };

    var builtOptions = function($el){
        var list,
            _opts = $el.data('uxSelect'),
            id = $el.attr('id'),
            readonly = '';

        if($el.is('.readonly')){
            readonly = ' uxitd-select-readonly';
        }

        list = '<ul id="uxitd-select-list-' + _opts.index + '" data-select="' + id + '" class="uxitd-select-list ' + opts.list + readonly + '">';

        $el.find('option').each(function(){
            var $o = $(this);

            list += '<li class="group uxitd-select-list-item"><a class="group uxitd-select-option ' + opts.option;

            if($o.is(':selected')){
                list += ' uxitd-select-option-selected ' + opts.selected;
            }

            list += '" data-index="' + $o.index() + '" data-value="' + $o.val() + '">' + setText($o.text()) + '</a></li>';
        });

        list += '</ul>';

        return list;
    };

    var setText = function(text){
        // replace brackets syntax to tags
        return text.replace(/\[/g, '<').replace(/]/g, '>');
    };

    // global callback
    var callback = function(fn){
        // if callback string is function call it directly
        if(typeof fn === 'function'){
            call(fn);
        }

        // if callback defined via data-attribute, call it via new Function
        else {
            if(fn !== false){
                var func = new Function('return ' + fn);
                func();
            }
        }
    };

    // jquery bindings
    ux = $.fn.select = $.uxselect = function(options){
        var selector = this.selector;

        return this.each(function(){
            var $el = $(this),
				uxrocket = $el.data('uxRocket') || {},
                select;

            if(!$el.is('select') || $el.hasClass('uxitd-select-ready')){
                return;
            }

            $el.addClass('uxitd-select-ready');
			
            uxrocket['uxSelect'] = {'hasWrapper': true, 'ready': 'uxitd-select-ready', 'selector': selector, 'options': options};

            $el.data('uxRocket', uxrocket);

            $el.keydown(function(e){
                if (!e) e = $el.event;
                if (e.keyCode == '13'){
                    return false;
                }
            });

            select = new Select(this, options, selector);
        });
    };

    // update method for dom edits
    ux.update = function(el){
        var $el;

        if(el === undefined){
            $el = $("select.uxitd-select-ready");
        }
        else {
            $el = $(el);
        }

        $el.each(function(){
            var optionList = builtOptions($(this)),
                $current = setText($(this).find(':selected').text());
            $(this).next('.uxitd-select-current').find('.uxitd-select-current-text').text($current);
            $('.uxitd-select-list').filter('[data-select="' + $(this).attr('id') + '"]').replaceWith(optionList);
        });

        bindUIActions($el);
    };

    // Version
    ux.version = "2.6.1a";

    // settings
    ux.settings = defaults;
})(jQuery);