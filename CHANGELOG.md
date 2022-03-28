# [1.0.0](https://github.com/jest-community/jest-watch-typeahead/compare/v0.6.5...v1.0.0) (2021-09-29)

### Bug Fixes

- add `exports` field to package.json ([#86](https://github.com/jest-community/jest-watch-typeahead/issues/86)) ([1bcd08f](https://github.com/jest-community/jest-watch-typeahead/commit/1bcd08fdc316fdb63b2665aac2b100222fcf2132))
- drop support for EOL versions of node ([#85](https://github.com/jest-community/jest-watch-typeahead/issues/85)) ([7351933](https://github.com/jest-community/jest-watch-typeahead/commit/73519337607032704ed67b3cf006d236256d1844))

### Features

- migrate to native ESM ([#84](https://github.com/jest-community/jest-watch-typeahead/issues/84)) ([a8e6940](https://github.com/jest-community/jest-watch-typeahead/commit/a8e6940851e7eefe16b69113fb29c6bd36916bb8))

### BREAKING CHANGES

- Drop support for Jest v26
- Module is now written in native ESM
- Disallow importing internal files
- Supported version range of node is now ^12.22.0 || ^14.17.0 || >=16.0.0

## [0.6.5](https://github.com/jest-community/jest-watch-typeahead/compare/v0.6.4...v0.6.5) (2021-09-28)

### Bug Fixes

- remove test files from published module ([db522ac](https://github.com/jest-community/jest-watch-typeahead/commit/db522ac9d1623952bbd3b8b992d583d0cb3cf1e8))

## [0.6.4](https://github.com/jest-community/jest-watch-typeahead/compare/v0.6.3...v0.6.4) (2021-05-27)

### Bug Fixes

- **deps:** update jest peer dependency to accept v27 ([#59](https://github.com/jest-community/jest-watch-typeahead/issues/59)) ([6552ead](https://github.com/jest-community/jest-watch-typeahead/commit/6552ead2dafb0258d11783f3c9e3e12877b15226))

## 0.6.2

### Fixes

- Use correct highlight offset even when rootDir is not root package directory ([#34](https://github.com/jest-community/jest-watch-typeahead/pull/34))

## 0.6.1

### Fixes

- Provide exact pattern for selected test names

## 0.6.0

### Chore & Maintenance

- Update dependencies and drop Node 8 ([#35](https://github.com/jest-community/jest-watch-typeahead/pull/35))

## 0.5.0

### Chore & Maintenance

- Update dependencies

## 0.4.2

### Fixes

- Fix issue with overly trimmed basenames when formatting test paths ([#33](https://github.com/jest-community/jest-watch-typeahead/pull/33))

## 0.4.1

### Fixes

- Allow selecting tests and files containing regexp special characters ([#32](https://github.com/jest-community/jest-watch-typeahead/pull/32))

### Chore & Maintenance

- Remove build directory before building ([#31](https://github.com/jest-community/jest-watch-typeahead/pull/31))

## 0.4.0

### Chore & Maintenance

- Update dependencies and drop Node 6 ([#30](https://github.com/jest-community/jest-watch-typeahead/pull/30))

## 0.3.1

### Fixes

- Helpful error message when attempting to use the package main file ([#29](https://github.com/jest-community/jest-watch-typeahead/pull/29))

## 0.3.0

### Chore & Maintenance

- Bump dated dependencies ([#25](https://github.com/jest-community/jest-watch-typeahead/pull/25))
- Get better truncation for testname typeahead by truncating the start and not the end ([#28](https://github.com/jest-community/jest-watch-typeahead/pull/28))

### Fixes

- Use fullName(to show ancestor titles) for test name pattern plugin ([#26](https://github.com/jest-community/jest-watch-typeahead/pull/26))

## 0.2.1

- Fix cursor in terminal app ([#21](https://github.com/jest-community/jest-watch-typeahead/pull/21))

### Chore & Maintenance

- Bump dated dependencies ([#23](https://github.com/jest-community/jest-watch-typeahead/pull/23))

## 0.2.0

### Features

- Add support for plugin config ([#13](https://github.com/jest-community/jest-watch-typeahead/pull/13))

### Fixes

- Make matching case insensitive ([#18](https://github.com/jest-community/jest-watch-typeahead/pull/18))
- fix: migrate to use jest-watcher ([#6](https://github.com/jest-community/jest-watch-typeahead/pull/6))

### Chore & Maintenance

- Upgrade Prettier to 1.13.7 ([#17](https://github.com/jest-community/jest-watch-typeahead/pull/17))
- New directory structure ([#14](https://github.com/jest-community/jest-watch-typeahead/pull/14))
- Move ansi-escapes to dependencies _23f22d4_
- Setup Travis and add tests ([#12](https://github.com/jest-community/jest-watch-typeahead/pull/12))

## 0.1.0

### Features

- Add test name typeahead ([#1](https://github.com/jest-community/jest-watch-typeahead/pull/1))
- Rename to jest-watch-typeahead

## 0.0.1

Initial Release
