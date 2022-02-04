
# Usage
<!-- usage -->
## CLI
Clone repo
```
git clone https://github.com/js07/pd-convert-actions.git
```
Install dependencies
```
cd pd-convert-actions
npm install
```
Run CLI
```
node bin/cli.js <path/to/actions.csv>
```

## Lib

Install
```
npm install https://github.com/js07/pd-convert-actions
```

Convert action
```js
const convert = require("pd-convert-actions");
const actionConfig = {
  code: "raw legacy action code;",
  title: "Title/Name of the action",
  description: "Description of the action",
  namespace: "component_slug",
  codeConfig: "{ params_schema: { ... } }"
};
const {
  code,
  appSlug,
  componentSlug,
} = await convert(actionConfig);
```