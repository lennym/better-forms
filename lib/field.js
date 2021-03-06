'use strict';

var Class = require('kayclass'),
    utils = require('./utils'),
    FormError = require('./error'),
    _ = require('underscore');

module.exports = Class.extend({

    constructor: function Field(props) {
        _.extend(this, props);
        this.type = this.type || this.inputType;
        this.tagName = this.tagName || 'input';
        this.availableAttributes = [].slice.call(this.availableAttributes);
    },

    inputType: 'text',

    availableAttributes: [
        'autofocus', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod',
        'formnovalidate', 'formtarget', 'value', 'required', 'selectiondirection', 'autocomplete',
        'inputmode', 'list', 'minlength', 'maxlength', 'spellcheck', 'readonly',
        'placeholder', 'pattern', 'step', 'match', 'validateif', 'name'
    ],

    validStateMessages: [
        'badInput', 'customError', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow',
        'stepMismatch', 'tooLong', 'typeMismatch', 'valueMissing', 'noMatch', 'tooShort'
    ],

    mismatchableTypes: [
        'email', 'url', 'tel'
    ],

    createValidId: function createId(id) {
        if (typeof id !== 'string') {
            return undefined;
        }
        return id.replace(/(?:\]\[)|[\[\]]/g, '_');
    },

    fieldHtml: function fieldHtml(contents, options) {
        return utils.htmlTag(
            (options || {}).fieldWrapperTagName || this.fieldWrapperTagName || 'div',
            _.extend({
                'class': utils.mungeClassValues(this.classes, 'field'),
                'data-type': this.type
            }, this.getDataAttributes()),
            contents
        );
    },

    html: function html(value, options, fields) {
        return this.fieldHtml(this.labelHtml(value, options) +
                              this.widgetHtml(value, options) +
                              this.errorHtml(value, options, fields),
                              options);
    },

    errorHtml: function errorHTML(value, options, fields) {
        var error;
        if ((options || {}).renderErrors === false) {
            return '';
        }
        error = this.validate(value, options, fields);
        return error instanceof FormError ? utils.htmlTag('label', { for: this.id, class: 'fieldError' }, error.message) : '';
    },

    labelText: function labelText(value, options) {
        var label = (options || {}).label || this.label;
        return label || '';
    },

    labelHtml: function labelHtml(value, options) {
        options = options || {};
        var label = this.labelText(value, options),
            forVal = options.for || this.createValidId(this.id);

        if (!label) {
            return '';
        }
        if (this.optional) {
            label += utils.htmlTag('span', { 'class': 'optionalIndicator' }, typeof this.optional === 'string' ? this.optional : '(optional)');
        }
        return utils.htmlTag('label', { for: forVal }, label);
    },
    widgetHtml: function widgetHtml(value, options) {
        return utils.htmlTag(this.tagName, this.widgetAttributes(value, options));
    },

    getTypeAttribute: function getTypeAttribute() {
        if (this.inputType || this.type) {
            return { type: this.inputType || this.type || 'text' };
        }
        return {};
    },

    getDataAttributes: function getDataAttributes() {
        var dataAttrs = {};
        _.each(this.dataAttributes || {}, function (value, key) {
            dataAttrs['data-' + key] = value;
        });
        return dataAttrs;
    },

    widgetAttributes: function widgetAttributes(value, options) {
        var attrs = this.getTypeAttribute();
        _.extend(attrs, _.pick.apply(null, [this].concat(this.availableAttributes)));
        _.extend(attrs, {
                name: attrs.name || attrs.id || this.id,
                id: this.createValidId(attrs.id || this.id),
                value: value !== undefined ? value : this.value
            },
            this.getTypeAttribute(),
            this.validationMessageAttributes(options)
        );
        return attrs;
    },

    isMismatchableType: function isMismatchableType() {
        return this.mismatchableTypes.indexOf(this.type) !== -1;
    },

    validationMessageAttributes: function validationMessageAttributes(/* options */) {
        var attrs = {},
            messages = {
                'valueMissing': this.required,
                'tooLong': this.maxlength,
                'patternMismatch': this.pattern,
                'noMatch': this.match,
                'tooShort': this.minlength,
                'typeMismatch': this.isMismatchableType() ? this.type: false
            };
        if (typeof this.message === 'string') {
            attrs['data-message'] = this.message;
        }
        _.each(this.validStateMessages, function (state) {
            if (messages[state]) {
                attrs['data-message-' + state] = this.getMessage(state);
            } else if (this.message && this.message[state]) {
                attrs['data-message-' + state] = this.message[state];
            }
        }, this);
        return attrs;
    },

    getMessage: function getMessage(type) {
        if (typeof this.message === 'string') {
            return this.message;
        } else if (typeof this.message === 'function') {
            return this.message(type);
        }
        var defaultMessages = {
            valueMissing: 'This field is required',
            tooShort: 'Please use ' + this.minlength + ' characters or more',
            tooLong: 'Please use ' + this.maxlength + ' characters or less',
            patternMismatch: 'Please use the required format',
            typeMismatch: 'Please enter a valid ' + this.type,
            noMatch: this.id + ' must match ' + this.match
        };
        return (this.message || {})[type] || defaultMessages[type];
    },

    validationReady: function validationReady(fields) {
        if (!fields || !fields[this.validateif]) {
            return true;
        }
        return  (fields && fields[this.validateif] && !!fields[this.validateif].value);
    },

    getErrors: function getErrors(value, options, fields) {
        return {
            'noMatch': (fields && fields[this.match] && value !== fields[this.match].value),
            'valueMissing': (this.required && value.length === 0),
            'tooShort': (this.minlength && value.length < this.minlength),
            'tooLong': (this.maxlength && value.length > this.maxlength),
            'patternMismatch': (this.pattern && value.length && !(new RegExp(this.pattern)).test(value))
        };
    },

    validate: function validate(value, options, fields) {
        var error = null;

        if (!this.validationReady(fields)) {
            return null;
        }

        value = String(typeof value === 'undefined' ? this.value || '' : value);

        error = this.getError(value, options, fields);
        return error ? new FormError(this.getMessage(error)) : null;
    },

    getError: function getError(value, options, fields) {
        var error = null;

        _.some(this.getErrors(value, options, fields), function (value, key) {
            if (value) {
                error = key;
            }
            return error;
        }, this);

        return error;
    },

    parseBody: function parseBody(req) {
        return req.body[this.id];
    }

});
