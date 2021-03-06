'use strict';

describe('Fields:', sandbox(function () {

    var Field = require('../lib/field'),
        FormError = require('../lib/error'),
        fields = require('../lib/fields'),
        instance;

    it('has field children which are all extended from Field, and have types matching to their names', function () {

        fields
            .should.have.keys(
                'text', 'string', 'number', 'color', 'date', 'datetime', 'datetime-local',
                'month', 'week', 'search', 'time', 'tel', 'url', 'email', 'hidden', 'password',
                'file', 'checkbox', 'radio', 'select'
            );

        for (var i in fields) {
            (new fields[i]())
                .should.be.instanceof(Field);
            if (i !== 'select') {
                fields[i].prototype.inputType
                    .should.equal(i === 'string' ? 'text' : i);
            }
        }

    });

    describe('.url()', function () {

        beforeEach(function () {
            instance = new fields.url();
        });

        describe('.widgetHtml()', function () {

            it('adds a typeMismatch data-message', function () {

                instance.message = { typeMismatch: 'Invalid url' };

                instance.widgetHtml('string')
                    .should.equal('<input type="url" value="string" data-message-typeMismatch="Invalid url"/>');

            });

        });

    });

    describe('.tel()', function () {

        beforeEach(function () {
            instance = new fields.tel();
        });

        describe('.widgetHtml()', function () {

            it('adds a typeMismatch data-message', function () {

                instance.message = { typeMismatch: 'Invalid tel' };

                instance.widgetHtml('string')
                    .should.equal('<input type="tel" value="string" data-message-typeMismatch="Invalid tel"/>');

            });

        });

    });

    describe('.email', function () {

        beforeEach(function () {
            instance = new fields.email();
        });

        it('will validate against the W3C email RegExp, returning a typeMismatch error if validation fails', function () {

            instance.value = 'b';

            instance.validate()
                .should.be.an.instanceof(FormError);

            instance.validate().message
                .should.equal('Please enter a valid email');

        });

        it('will return a custom `typeMismatch` error message if supplied (and the value is not an email)', function () {

            instance.value = 'b';
            instance.message = { typeMismatch: 'Invalid email Foo' };

            instance.validate()
                .should.be.an.instanceof(FormError);

            instance.validate().message
                .should.equal('Invalid email Foo');

        });

        it('will also validate against maxlength, required and pattern', function () {

            instance.maxlength = 10;
            instance.required = true;
            instance.pattern = /^a@a.a$/;
            instance.value = '';
            instance.message = {
                valueMissing: 'valueMissing',
                tooLong: 'tooLong',
                patternMismatch: 'patternMismatch',
                typeMismatch: 'typeMismatch'
            };

            instance.validate('')
                .should.be.an.instanceof(FormError);

            instance.validate('').message
                .should.equal('valueMissing');

            instance.validate('aaaaaaaaaaa')
                .should.be.an.instanceof(FormError);

            instance.validate('aaaaaaaaaaa').message
                .should.equal('tooLong');

            instance.validate('ab@ab.ab')
                .should.be.an.instanceof(FormError);

            instance.validate('ab@ab.ab').message
                .should.equal('patternMismatch');

            should.equal(instance.validate('a@a.a'), null);

        });

        describe('.widgetHtml()', function () {

            it('adds a typeMismatch data-message', function () {

                instance.message = { typeMismatch: 'Invalid email' };

                instance.widgetHtml('string')
                    .should.equal('<input type="email" value="string" data-message-typeMismatch="Invalid email"/>');

            });

        });

        describe('.getError()', function () {

            it('will return typeMistch if the value is not a valid email address', function () {

                instance.getError('aaaa', {}, {})
                    .should.equal('typeMismatch');

            });

        });


    });

    describe('.file', function () {

        beforeEach(function () {
            instance = new fields.file();
        });

        it('has its own set of availableAttributes', function () {

            instance.availableAttributes
                .should.deep.equal(['type', 'autofocus', 'disabled', 'form', 'formaction',
                    'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'value',
                    'required', 'selectiondirection', 'accept', 'multiple', 'placeholder']);

        });

    });

    describe('.select', function () {

        beforeEach(function () {
            instance = new fields.select({ id: 'select', label: 'label', choices: ['Mr', { 'Mrs': 'Mrs' }, 'Miss'], required: true });
        });

        describe('.widgetHtml()', function () {

            it('adds choices to option elements', function () {

                instance.widgetHtml()
                    .should.equal('<select required="true" name="select" id="select" data-message-valueMissing="This field is required"><option value="Mr">Mr</option><option value="Mrs">Mrs</option><option value="Miss">Miss</option></select>');

            });

            it('selects choice whose value matches the value argument', function () {

                instance.widgetHtml('Mrs')
                    .should.equal('<select required="true" name="select" id="select" data-message-valueMissing="This field is required"><option value="Mr">Mr</option><option value="Mrs" selected="selected">Mrs</option><option value="Miss">Miss</option></select>');

            });

        });

        describe('.validate()', function () {

            it('will validate against missing values', function () {

                instance.message = {
                    valueMissing: 'valueMissing'
                };

                instance.validate('')
                    .should.be.an.instanceof(FormError);

                instance.validate('').message
                    .should.equal('valueMissing');

            });

        });
    });

    describe('.checkbox', function () {

        beforeEach(function () {
            instance = new fields.checkbox({ id: 'checkbox', label: 'label' });
        });

        describe('instance', function () {

            it('has an availableAttributes array, with available attributes for the field', function () {

                instance.availableAttributes
                    .should.deep.equal([
                        'autofocus', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod',
                        'formnovalidate', 'formtarget', 'required', 'selectiondirection', 'value',
                        'autocomplete', 'inputmode', 'list', 'readonly', 'validateif', 'name', 'checked'
                    ]);

            });
        });

        describe('.html()', function () {

            it('renders input first', function () {

                this.stub(instance, 'widgetHtml', function () { return 'widgetHtml'; });
                this.stub(instance, 'labelHtml', function () { return 'labelHtml'; });

                instance.html()
                    .should.equal('<div class=\"field\" data-type=\"checkbox\">widgetHtmllabelHtml</div>');

            });

        });

        describe('.widgetHtml()', function () {

            it('adds checked attribute if value passed matches values attribute', function () {

                instance.widgetHtml(true)
                    .should.equal('<input type="checkbox" value="true" name="checkbox" id="checkbox" checked="checked"/>');

            });

        });

        describe('.parseBody()', function () {

            it('compares POSTed string value to "true" if field.value is boolean', function () {

                instance.parseBody({ body: { checkbox: 'true' } })
                    .should.equal(true);

                should.not.exist(instance.parseBody({ body: { checkbox: 'aString' } }));

            });

            it('accepts POSTed true(bool) if field.value is boolean', function () {

                instance.parseBody({ body: { checkbox: true } })
                    .should.equal(true);

                should.not.exist(instance.parseBody({ body: { checkbox: null } }));

            });

            it('returns POSTed string value if field.value is not boolean', function () {

                instance = new fields.checkbox({ id: 'checkbox', label: 'label', value: 'aString' });

                should.not.exist(instance.parseBody({ body: { checkbox: 'true' } }));

                instance.parseBody({ body: { checkbox: 'aString' } })
                    .should.equal('aString');

            });

        });

    });

    describe('.radio', function () {

        beforeEach(function () {
            instance = new fields.radio({ id: 'radio-foo', label: 'label', name: 'radio', value: 'foo' });
        });

        describe('instance', function () {

            it('has an availableAttributes array, with available attributes for the field', function () {

                instance.availableAttributes
                    .should.deep.equal([
                        'autofocus', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod',
                        'formnovalidate', 'formtarget', 'required', 'selectiondirection', 'value',
                        'autocomplete', 'inputmode', 'list', 'readonly', 'validateif', 'name', 'checked'
                    ]);

            });

        });

        describe('.html()', function () {

            it('renders input first', function () {

                this.stub(instance, 'widgetHtml', function () { return 'widgetHtml'; });
                this.stub(instance, 'labelHtml', function () { return 'labelHtml'; });

                instance.html()
                    .should.equal('<div class=\"field\" data-type=\"radio\">widgetHtmllabelHtml</div>');

            });

        });

        describe('.widgetHtml()', function () {

            it('adds checked attribute if value passed matches values attribute', function () {

                instance.widgetHtml('foo')
                    .should.equal('<input type="radio" value="foo" name="radio" id="radio-foo" checked="checked"/>');

            });

        });

        describe('.parseBody()', function () {

            it('compares POSTed string value to the body value', function () {

                instance.parseBody({ body: { radio: 'foo' } })
                    .should.equal('foo');

            });

        });

    });

}));
