0.0.2 (27.06.2014)
==================

Features:

- Add support for CSRF token (#2 @joechapman)

0.0.3 (28.06.2014)
==================

Features:

- Updated Simple form example (@joechapman)

0.0.4 (03.07.2014)
==================

Features:

- Make json in xhr response optionally take html strings as messages (#6 @joechapman)
- Fix validateif validation
- increase test coverage

0.0.5 (14.07.2014)
==================

Features:

- Add noMatch and tooShort to data-message attrs
- Add match and validateif to available attributes
- Always render data-message attrs

0.0.6 (15.07.2014)
==================

Features:

- Add checked and name attributes to Field class
- Persist selected option in select field
- Get correct radio value when parsing body

0.0.7 (24.07.2014)
==================

Features:

- Field html returns wrapped fields
- Preselect select option
- Documentation

0.0.8 (24.07.2014)
==================

Features:

- Fix documentation link

0.0.9 (24.07.2014)
==================

Features:

- Add typeMismatch validation and data-message to email Field

0.0.10 (25.07.2014)
==================

Features:

- New fieldHandler helpers for errorText, labelText, widgetAttributes, choices & placeholder
- Removed fieldHandler.validationErrors, replaced with errorText

0.0.11 (31.07.2014)
==================

Features:

- New fieldHandler helpers error - returns error key such as 'valueMissing', 'typeMismatch'
- Exposed field and error Classes

0.0.12 (01.08.2014)
==================

- XHR redirects returned as JSON object (@mattyod)
- Updated dependencies (@mattyod)
- Refactored out deprecated methods after dependency update (@mattyod)
