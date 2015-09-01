/**
 * @author Bilal Cinarli
 */

var expect = chai.expect;

describe('Testing UX Rocket Select', function() {
    var $inputs = {},
        select = {},
        defaults = $.uxrselect.settings,
        namespace = $.uxrselect.namespace,
        data = namespace.data;

    before(function() {
        var options = '<option value="option-01">Option 01</option>' +
                      '<option value="option-02">Option 02</option>' +
                      '<option value="option-03">Option 03</option>' +
                      '<option value="option-04">Option 04</option>';

        // prepare the elements
        $("#elements")
            .append('<select name="select-01" id="sl01">' + options + '</select>')
            .append('<select name="select-02" id="sl02">' + options + '</select>')
            .append('<select name="select-03" id="sl03">' + options + '</select>');

        $inputs["_01"] = $("#sl01");
        $inputs["_02"] = $("#sl02");
        $inputs["_03"] = $("#sl03");

        $inputs._01.addClass('select');

        $inputs._02.wrap('<label class="uxr-plugin-wrap previously-wrapped"></label>');


        $.each($inputs, function(item) {
            $inputs[item].select();

            select[item] = $inputs[item].data(data);
        });
    });

    describe('Properties', function() {
        it('uxrselect.version', function() {
            expect($.uxrselect).to.have.property('version');
        });

        it('uxrselect.settings', function() {
            expect($.uxrselect).to.have.property('settings');
        });

        it('unique _instance', function() {
            var instances = [];

            $.each(select, function(item) {
                expect(select[item]._instance).to.exist;
                expect($.inArray(select[item]._instance, instances)).to.be.equal(-1);

                instances.push(select[item]._instance);
            });
        });
    });

    describe('Layout Setup', function() {
        it('Ready Class: "uxr-select-ready"', function() {
            expect($inputs._01.hasClass('uxr-select-ready')).to.be.equal(true);
        });

        it('Wrapper Classlist', function() {
            expect(select._01.classList).to.be.equal('select uxr-plugin-wrap uxr-select-wrap uxr-select-wrap-1');
        });

        it('Should wrapped with <span> if not wrapped before', function() {
            var $parent = $inputs._01.parent();
            expect($parent.is('span, .uxr-select-wrap')).to.be.equal(true);
        });

        it('Should not wrapped again, only "classList" should transferred', function() {
            var $parent = $inputs._02.parent();
            expect($parent.is('label, .uxr-plugin-wrap, .uxr-select-wrap')).to.be.equal(true);
        });
    });

    describe('Internal Method', function() {
        describe('Clean Up', function() {
            it('Should remove the plugin wrapper and icon when element is removed', function() {
                var instance = select["_01"]._instance,
                    el = document.getElementById('sl01');

                el.parentNode.removeChild(el);

                expect($('uxr-select-wrap-' + instance).length).to.be.equal(0);
            });
        });
    });

    describe('Public Methods', function() {
        describe('Update', function() {
            it('Will update plugin settings', function() {
                //select._02.update({selectAlso: '#id'});

                //expect(select._02.options.selectAlso).to.be.equal('#id');
            });
        });

        describe('Destroy/Remove', function() {
            it('Will destroy plugin', function() {
                select._02.destroy();

                expect($inputs._02.data(data)).to.be.undefined;
            });

            it('Will destroy all select plugins', function() {
                $.uxrselect.destroy();

                // $input1 is already destroyed in previous test, so we only control the $input2
                expect($inputs._03.data(data)).to.be.undefined;
            });
        });
    });
});