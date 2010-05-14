/*!
 * HTML5 form validator for jQuery 1.4+. Work in progress, does not implement
 * all of the spec.
 *
 * Copyright (c) 2010 Simo Kinnunen.
 * Licensed under the MIT license.
 *
 * Date: 12 May 2010
 */

;(function($) {

	function RuleStack() {

		var rules = {};

		this.addRule = function(validityProperty, rule) {
			rules[validityProperty] = rule;
		};

		this.test = function(input, form) {
			var validityProperty;
			for (validityProperty in rules) {
				if (!rules.hasOwnProperty(validityProperty)) continue;
				if (!rules[validityProperty](input, form)) return false;
			}
			return true;
		};

	}
	
	function compareNumberValue(ruleString, inputString, converter) {
		return converter(ruleString) - converter(inputString);
	}

	function dateToNumber(dateString) {
		var components = dateRegex.exec(dateString);
		if (!components) return NaN;
		return parseInt(components[1], 10) * 373
			+ parseInt(components[2], 10) * 31
			+ parseInt(components[3], 10);
	}

	function isDisabled(el) {
		return $(el).attr('disabled')
			|| !!$(el).closest('fieldset[disabled], legend', el.form).size();
	}

	function isEmpty(str) {
		return str === '';
	}

	function monthToNumber(monthString) {
		var components = monthRegex.exec(monthString);
		if (!components) return NaN;
		return parseInt(components[1], 10) * 12
			+ parseInt(components[2], 10);
	}

	function onFormSubmitted(e) {
		if ($(this).willValidate() && !$(this).checkValidity()) {
			e.preventDefault();
		}
		$(this).removeData('submitTriggeredBy');
	}

	function parseDate(str) {
		if ($.datepicker && !dateRegex.test(str)) {
			return $.datepicker.formatDate('yy-mm-dd',
				$.datepicker.parseDate($.datepicker._defaults.dateFormat, str));
		}
		return str;
	}

	function timeToNumber(timeString) {
		var components;
		components = timeRegex.exec(timeString);
		if (!components) return NaN;
		return parseInt(components[1], 10) * 3600
			+ parseInt(components[2], 10) * 60
			+ (parseInt(components[3], 10) || 0)
			+ (parseFloat(components[4]) || 0);
	}

	function type(input) {
		if (input.nodeName.toLowerCase() == 'textarea') return 'text';
		return input.getAttribute('type').toLowerCase();
	}

	function weekToNumber(weekString) {
		var components = weekRegex.exec(weekString);
		if (!components) return NaN;
		return parseInt(components[1], 10) * 53
			+ parseInt(components[2], 10);
	}

	var timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:(\.[0-9]+))?)?$/,
		weekRegex = /^([0-9]{4,})-W([0-4][0-9]|5[0-3])$/,
		monthRegex = /^([0-9]{4,})-(0[1-9]|1[0-2])$/,
		dateRegex = /^([0-9]{4,})-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/,
		urlRegex = /^[a-z]+:/, /* very lax */
		emailRegex = /^.+@.+$/, /* lax as well */
		colorRegex = /^#[a-fA-F0-9]{6}$/,
		rules = new RuleStack(),
		ignoreTypes = {
			hidden: 1,
			button: 1,
			reset: 1,
			image: 1,
			submit: 1
		};

	/**
	 * <input required="required" />
	 */
	rules.addRule('valueMissing', function(input, form) {
		var related, i, l;
		if (!$(input).attr('required')) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
			case 'url':
			case 'tel':
			case 'email':
			case 'password':
			case 'datetime':
			case 'date':
			case 'month':
			case 'week':
			case 'time':
			case 'datetime-local':
			case 'number':
				return !isEmpty(input.value);
			case 'checkbox':
				return input.checked;
			case 'radio':
				if (!$(input).attr('required')) return true;
				related = form.elements[input.name];
				if (related.nodeType) {
					return related.checked;
				}
				for (i = 0, l = related.length; i < l; ++i) {
					if (related[i].checked) return true;
				}
				return false;
		}
		return true;
	});

	/**
	 * <input type="x" />
	 */
	rules.addRule('typeMismatch', function(input, form) {
		var value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
				return true;
			case 'url':
				return urlRegex.test(value);
			case 'tel':
				return true;
			case 'email':
				return emailRegex.test(value);
			case 'password':
				return true;
			case 'datetime':
				throw new Error('datetime has not been implemented yet');
			case 'date':
				return dateRegex.test(parseDate(value));
			case 'month':
				return monthRegex.test(value);
			case 'week':
				return weekRegex.test(value);
			case 'time':
				return timeRegex.test(value);
			case 'datetime-local':
				throw new Error('datetime-local has not been implemented yet');
			case 'number':
			case 'range':
				return !isNaN(parseFloat(value));
			case 'color':
				return colorRegex.test(value);
			case 'checkbox':
				return true;
			case 'radio':
				return true;
			case 'file':
				return true;
		}
		return true;
	});

	/**
	 * <input minlength="n" />
	 */
	rules.addRule('tooShort', function(input, form) {
		var limit, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		limit = $(input).attr('minlength') || -1;
		if (limit < 0) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
			case 'url':
			case 'tel':
			case 'email':
			case 'password':
				return value.length >= limit;
		}
		return true;
	});

	/**
	 * <input maxlength="n" />
	 */
	rules.addRule('tooLong', function(input, form) {
		var limit, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		limit = $(input).attr('maxlength') || -1;
		if (limit < 0) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
			case 'url':
			case 'tel':
			case 'email':
			case 'password':
				return value.length <= limit;
		}
		return true;
	});

	/**
	 * <input pattern="regex" />
	 */
	rules.addRule('patternMismatch', function(input, form) {
		var pattern, re, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		pattern = $(input).attr('pattern');
		if (!pattern) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
			case 'url':
			case 'tel':
			case 'email':
			case 'password':
				re = new RegExp('^(?:' + pattern + ')$');
				return re.test(value);
		}
		return true;
	});

	/**
	 * <input min="x" />
	 */
	rules.addRule('rangeUnderflow', function(input, form) {
		var limit, undef, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		limit = $(input).attr('min');
		undef = limit === undef;
		switch (type(input)) {
			case 'datetime':
				throw new Error('datetime has not been implemented yet');
			case 'date':
				if (undef) return true;
				return compareNumberValue(parseDate(value), limit, dateToNumber) >= 0;
			case 'month':
				if (undef) return true;
				return compareNumberValue(value, limit, monthToNumber) >= 0;
			case 'week':
				if (undef) return true;
				return compareNumberValue(value, limit, weekToNumber) >= 0;
			case 'time':
				if (undef) return true;
				return compareNumberValue(value, limit, timeToNumber) >= 0;
			case 'datetime-local':
				throw new Error('datetime-local has not been implemented yet');
			case 'number':
				if (undef) return true;
				return parseFloat(value) >= limit;
			case 'range':
				limit = undef ? 0 : parseFloat(limit);
				return parseFloat(value) >= limit;
		}
		return true;
	});

	/**
	 * <input max="x" />
	 */
	rules.addRule('rangeOverflow', function(input, form) {
		var limit, undef, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		limit = $(input).attr('max');
		undef = limit === undef;
		switch (type(input)) {
			case 'datetime':
				throw new Error('datetime has not been implemented yet');
			case 'date':
				if (undef) return true;
				return compareNumberValue(limit, parseDate(value), dateToNumber) >= 0;
			case 'month':
				if (undef) return true;
				return compareNumberValue(limit, value, monthToNumber) >= 0;
			case 'week':
				if (undef) return true;
				return compareNumberValue(limit, value, weekToNumber) >= 0;
			case 'time':
				if (undef) return true;
				return compareNumberValue(limit, value, timeToNumber) >= 0;
			case 'datetime-local':
				throw new Error('datetime-local has not been implemented yet');
			case 'number':
				if (undef) return true;
				return parseFloat(value) <= limit;
			case 'range':
				limit = undef ? 100 : parseFloat(limit);
				return parseFloat(value) <= limit;
		}
		return true;
	});

	/**
	 * <input match="id" />
	 *
	 * Not part of HTML5, but still quite useful for "confirm password / email"
	 * fields.
	 */
	rules.addRule('matchMismatch', function(input, form) {
		var related, value;
		value = $(input).val();
		if (isEmpty(value)) return true;
		related = $(input).attr('match');
		if (!related) return true;
		switch (type(input)) {
			case 'text':
			case 'search':
			case 'url':
			case 'tel':
			case 'email':
			case 'password':
				related = $(related);
				return value === related.val();
		}
		return true;
	});

	$('form').live('submit', onFormSubmitted);

	// Unfortunately jQuery's live submit handler does not work in IE if an
	// element inside a <button type="submit" /> is clicked. Uncomment the
	// following section if this applies to you.

	//$(function() {
	//	$('form').bind('submit', onFormSubmitted);
	//});

	$('input, textarea').live('focusout', function() {
		if (!$(this).willValidate()) return;
		$(this).checkValidity();
	});

	$('input[type=radio], input[type=checkbox]').live('click', function() {
		if (!$(this).willValidate()) return;
		$(this).checkValidity();
	});

	$('input[type=submit], button[type=submit]').live('click', function() {
		$(this.form).data('submitTriggeredBy', this);
	});

	$('input, textarea').live('valid invalid', function(e) {
		$(this)
			.removeClass('error')
			.removeClass('valid')
			.nextAll('.validation-marker')
				.remove();
		if (e.type === 'valid') {
			if (!isEmpty($(this).val())) {
				$(this).after($('<span />', {
						'class': 'validation-marker validation-marker-valid'
					}))
					.addClass('valid');
			}
		}
		else {
			$(this).after($('<span />', {
					'class': 'validation-marker validation-marker-error',
					'title': $(this).attr('title')
				}))
				.addClass('error');
		}
	});

	$.fn.extend({

		checkValidity: function() {
			var valid = true;
			$(this).each(function() {
				if (!$(this).willValidate()) return;
				switch (this.nodeName.toLowerCase()) {
					case 'input':
						if (ignoreTypes[this.type]) return;
						// fall through on purpose
					case 'textarea':
						if (rules.test(this, this.form)) {
							$(this).trigger('valid');
						}
						else {
							$(this).trigger('invalid');
							valid = false;
						}
						break;
					case 'form':
						if (!$(this).find('input, textarea').checkValidity()) {
							valid = false;
						}
						break;
				}
			});
			return valid;
		},

		willValidate: function() {
			var i, l, el, trigger;
			for (i = 0, l = this.length; i < l; ++i) {
				el = this[i];
				switch (el.nodeName.toLowerCase()) {
					case 'input':
						if (!ignoreTypes[el.type] && !isDisabled(el) && $(el.form).willValidate()) {
							return true;
						}
						break;
					case 'textarea':
						return !isDisabled(el);
					case 'form':
						trigger = $(el).data('submitTriggeredBy');
						if (!$(el).attr('novalidate') && (!trigger || !$(trigger).attr('formnovalidate'))) {
							return true;
						}
						break;
				}
			}
			return false;
		}

	});

})(jQuery);