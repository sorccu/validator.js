Validator.js
================================================================================

HTML5 form validator for jQuery 1.4+.

How to use
--------------------------------------------------------------------------------

1. Include jQuery
2. Include validator.js
3. Write some CSS rules for (in)valid fields

And now all your existing forms will be subject to validation. Note that you
will not see any effect unless you've actually used HTML5 form validation
features.

How to style
--------------------------------------------------------------------------------

A CSS class will, by default, be added to elements that are either valid or
invalid. The class is "valid" for fields that are valid, and "error" for fields
that are invalid. If a field is optional (i.e. it is not required) and its
value is empty, the element will have neither CSS class.

A "marker" element will also be added immediately after the field itself for
easier customization (e.g. displaying icons after the field). The structure of
the marker element is as follows:

	<span class="validation-marker validation-marker-valid"></span>

for fields that are valid, and for invalid fields:

	<span class="validation-marker validation-marker-error"
		title="Whatever value the field's own title attribute holds"></span>

As with CSS classes, an optional field with no value will have no marker
element following it.

How to customize
--------------------------------------------------------------------------------

A custom jQuery event will be fired on all fields. To listen for these events,
use

	$('input, textarea').live('valid invalid', function(e) {
		if (e.type == 'valid') {
			// it's valid
		}
		else {
			// stab the user
		}
	});

How to skip
--------------------------------------------------------------------------------

Two ways. Use

	<form novalidate="novalidate">

to disable validation for the entire form, or

	<button type="submit" formnovalidate="formnovalidate"></button>
	<input type="submit" formnovalidate="formnovalidate" />

to skip validation if a certain button triggers submission (useful for "save
as draft" or "delete").

Both ways are standard HTML5 features.