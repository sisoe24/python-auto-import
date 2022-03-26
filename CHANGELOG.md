# Change Log

## [0.0.10] 2022-03-26

### Added

- Can now work with multi root folder workspace.

## [0.0.9] 2022-03-25

### Added

- Temporary debug window in the output channel.

### Fixed

- Fixed some regex patterns which did wrongfully matched the cursor being
  inside a multiple line import statement when it was not.

## [0.0.5] 2022-03-17

### Fixed

- Correctly re position the cursor after the document was changed.
- Fixed a bug where the extension did not offer suggestion for an inline statement:
`from x import a, b, c`

## [0.0.4] 2022-03-09

### Fixed

- Fixed wrong module suggestion when invoking an object method.

## [0.0.1]

- Initial release.
