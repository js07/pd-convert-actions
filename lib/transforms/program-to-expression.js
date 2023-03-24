import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  return j(ast.getFunctionExpression().get("body")).toSource();
}