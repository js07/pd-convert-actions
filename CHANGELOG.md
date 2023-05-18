## 0.7.2 (May 18, 2023)

* Fix event transform converting property keys. (#55)
* Add snapshot tests for converting actions. (#56)
* Update package dependencies. (#57)
* Refactor collection and util functions. (#58)

## 0.7.1 (May 9, 2023)

* Fix browser incompatibility from using ESLint & putout packages. (#54)
* Install parser dependencies for putout engine-parser to fix Vite errors. (#54)
* Fix code config input being required. (#54)
* Add TypeScript declaration file for this package. (#54)

## 0.7.0 (May 2, 2023)

* Fix conversion of references to named exports used outside of assignment expressions. (#44)
* Add `steps` arg to generated run method. (#45)
* Adds transform for `$attachments` to `steps.context.trigger.attachments`. (#46)
* Adds transform for `event` to `steps.trigger.event`. (#47)
* Fix transform for `this.$checkpoint`. (#48)
* Add transform for `$checkpoint`. (#49)
* Add support for converting legacy code steps. (#51)
* Fix cjs-to-esm transform causing variable conflicts converting require to import. (#52)
