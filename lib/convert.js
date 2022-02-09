const transform = require("./transform");
const generate = require("./generate");
const fix = require("./fix");
const parse = require("./parse");

const PLACEHOLDER_APP_SLUG = "app_placeholder";
const DEFAULT_VERSION_PATCH = 1;

function dbProp() {
  return { key: "db", type: "$.interface.db", isString: true };
}

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

function paramToProp(param, paramKey, required, createLabel) {
  const label = createLabel
    ? (param._label ?? `${key.charAt(0).toUpperCase()}${key.slice(1)}`.replace(/_/g, " "))
    : undefined;
  // If a prop key contains a colon, its object key must be a string literal
  // rather than identifier (e.g. `{ prop:key: {} }` -> `{ "prop:key": {} }`)
  const key = paramKey.includes(":") ? `"${paramKey}"` : paramKey;
  return {
    key,
    type: paramTypeToPropType(param.type),
    label,
    description: param.description,
    optional: !required || undefined
  };
}

function paramsSchemaToProps(params, { createLabel }={}) {
  return Object.entries(params?.properties ?? {}).map(([key, value]) => ({
    ...paramToProp(value, key, params.required.includes(key), createLabel),
  }));
}

function authsToAppProps(auths) {
  return auths.map((appName) => ({
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
// If code has this.$checkpoint, add db prop
// Convert params to array of props
// Convert code to component code
// Generate component file using handlebars template, props, and component code
/**
 * 
 * @param {object} actionConfig 
 * @param {object} options 
 * @returns 
 */
async function convert({
  code: codeRaw,
  title,
  description,
  namespace,
  codeConfig: codeConfigString,
  versionMajor = 0,
  versionMinor = 0,
  versionPatch = DEFAULT_VERSION_PATCH,
  hashId,
}, { defineComponent=false, createLabel=false }={}) {
  // const escapedCodeConfigString = codeConfigString.replace(/\\/g, "\\\\");
  const { params_schema: paramsSchema } = JSON.parse(codeConfigString);

  let source = wrapCodeWithFunctionExpr(codeRaw);

  const {
    auths,
    checkpoints
  } = parse(source);

  // Get props from code (`auths.app`) & params
  const appProps = authsToAppProps(auths);
  const appSlug = appProps?.[0]?.key ?? PLACEHOLDER_APP_SLUG;
  const paramsProps = paramsSchemaToProps(paramsSchema, { createLabel });
  
  const props = [
    ...appProps,
    ...(checkpoints.length > 0 ? [dbProp()] : []),
    ...paramsProps,
  ];

  const transformedCode = transform(source);
  
  const componentKey = makeComponentKey(appSlug, namespace);
  const componentCode = generate({
    code: transformedCode,
    props,
    name: title,
    description,
    key: componentKey,
    version: `${versionMajor}.${versionMinor}.${versionPatch}`,
    hashId,
  }, { defineComponent });

  const lintedCode = await fix(componentCode);

  return {
    code: lintedCode,
    appSlug,
    componentSlug: namespace,
  };
}

module.exports = convert;
