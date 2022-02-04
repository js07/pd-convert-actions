const getAuths = require("./getters/auths");
const transform = require("./transform");
const generate = require("./generate");
const fix = require("./fix");

function paramTypeToPropType(type) {
  const mapping = {
    "array": "any",
    "boolean": "boolean",
    "integer": "integer",
    "number": "integer",
    "object": "object",
    "string": "string",
  };
  if (!mapping[type]) {
    throw new Error(`Can't convert unsupported param type "${type}" to a prop type`);
  }
  return mapping[type];
}

function paramToProp(param, required) {
  return {
    type: paramTypeToPropType(param.type),
    label: param._label,
    description: param.description,
    optional: !required || undefined
  };
}

function paramsSchemaToProps(params) {
  return Object.entries(params.properties).map(([key, value]) => ({
    key,
    ...paramToProp(value, params.required.includes(key)),
  }));
}

function getAppProps(source) {
  const appNames = getAuths({ source });
  return appNames.map((appName) => ({
    key: appName,
    type: "app",
    app: appName,
  }));
}

function makeComponentKey(appSlug, componentSlug) {
  return `${appSlug}-${componentSlug}`;
}

function wrapCodeWithFunctionExpr(source) {
  if (source.startsWith("async (")) {
    return source;
  }
  return `async (params, auths) => {\n${source}\n}`;
}

// Wrap code with function Expression
// Get app props from `auths.appName` in code
// Convert params to array of props
// Convert code to component code
// Generate component file using handlebars template, props, and component code
async function convert({
  code: codeRaw,
  title,
  description,
  namespace,
  codeConfig: codeConfigString
}, options) {
  // const escapedCodeConfigString = codeConfigString.replace(/\\/g, "\\\\");
  const { params_schema: paramsSchema } = JSON.parse(codeConfigString);

  let source = wrapCodeWithFunctionExpr(codeRaw);

  // Get props from code (`auths.app`) & params
  const appProps = getAppProps(source);
  if (!appProps?.[0]) {
    throw new Error("The legacy action is missing at least 1 auth");
  }
  const appSlug = appProps[0].key;
  const paramsProps = paramsSchemaToProps(paramsSchema);
  const props = [
    ...appProps,
    ...paramsProps,
  ];

  const transformedCode = transform(source);
  
  const componentKey = makeComponentKey(appSlug, namespace);
  const componentCode = generate({
    code: transformedCode,
    props,
    name: title,
    description,
    key: componentKey 
  });

  const lintedCode = await fix(componentCode);

  return {
    code: lintedCode,
    appSlug,
    componentSlug: namespace,
  };
}

module.exports = convert;
