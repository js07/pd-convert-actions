import transform from "./transform.js";
import generate from "./generate.js";
import fix from "./fix.js";
import parse from "./parse.js";
import { paramCase } from "param-case";

const DEFAULT_PLACEHOLDER_APP_SLUG = "app_placeholder";
const DEFAULT_VERSION_PATCH = 1;

function dbProp() {
  return { key: "db", type: "data_store", isString: true };
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
  const label = param._label || 
    (createLabel
      ? `${key.charAt(0).toUpperCase()}${key.slice(1)}`.replace(/_/g, " ")
      : undefined);
  // If a prop key contains a colon, its object key must be a string literal
  // rather than identifier (e.g. `{ prop:key: {} }` -> `{ "prop:key": {} }`)
  const key = paramKey.includes(":") ? `"${paramKey}"` : paramKey;
  // Restrict options to "string" props
  const options = param.type === "string" ? param.enum : undefined;
  return {
    key,
    type: paramTypeToPropType(param.type),
    label,
    description: param.description?.trim(),
    optional: !required || undefined,
    options,
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

function makeComponentSlug(namespace, appSlug="") {
  // E.g. `cloudinary_upload_media_asset` -> ``upload-media-asset`
  return paramCase(namespace.replace(appSlug, ""));
}

function makeComponentKey(componentSlug, appSlug) {
  if (!appSlug) {
    return componentSlug;
  }
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
// If code has this.$checkpoint, add data_store prop called "db"
// Convert params to array of props
// Convert code to component run code
// Generate component file using handlebars template, props, and component run code
// Fix issues/eslint errors in generated component file
/**
 * Converts a legacy action to a component.
 * 
 * @param {object} actionConfig 
 * @param {object} options 
 * @returns the converted component
 */
async function convert({
  code: codeRaw,
  title,
  description,
  namespace,
  codeConfig: codeConfigString,
  versionMajor,
  versionMinor,
  versionPatch,
  hashId,
}, {
  defineComponent=false,
  createLabel=false,
  toEsm=true,
  appPlaceholder=DEFAULT_PLACEHOLDER_APP_SLUG,
  addPlaceholderAppProp=false,
}={}) {
  // Extract paramsSchema from codeConfig
  let paramsSchema;
  try {
    const codeConfig = JSON.parse(codeConfigString || null);
    paramsSchema = codeConfig?.params_schema || {};
  } catch (err) {
    throw new Error(`Invalid code config: ${err.message}`);
  }
  if (typeof paramsSchema !== "object") {
    throw new Error("Invalid code config: paramsSchema must be an object");
  }

  let source = wrapCodeWithFunctionExpr(codeRaw);

  const {
    auths,
    checkpoints
  } = parse(source);

  // Get props from params and code (`auths.app` -> "app",
  // `this.$checkpoint`/`$checkpoint` -> "data_store")
  const appNames = (auths.length === 0 & addPlaceholderAppProp)
    ? [appPlaceholder]
    : auths;
  const appProps = authsToAppProps(appNames);
  const appSlug = appProps?.[0]?.key ?? appPlaceholder;
  const paramsProps = paramsSchemaToProps(paramsSchema, { createLabel });
  const props = [
    ...appProps,
    ...(checkpoints.length > 0 ? [dbProp()] : []),
    ...paramsProps,
  ];

  const transformedCode = transform(source);
  
  let componentSlug, componentKey;
  if (namespace) {
    componentSlug = makeComponentSlug(namespace, appSlug);
    componentKey = makeComponentKey(componentSlug, appSlug);
  }

  const version = (versionMajor != null || versionMinor != null)
    ? `${versionMajor || 0}.${versionMinor || 0}.${versionPatch || DEFAULT_VERSION_PATCH}`
    : undefined;

  const componentCode = generate({
    code: transformedCode,
    props,
    name: title,
    description: description?.trim(),
    key: componentKey,
    version,
    hashId,
  }, { defineComponent });

  const lintedCode = await fix(componentCode, { toEsm });

  return {
    code: lintedCode,
    appSlug,
    componentSlug,
    legacyHashId: hashId,
    componentKey: componentKey,
  };
}

export default convert;
