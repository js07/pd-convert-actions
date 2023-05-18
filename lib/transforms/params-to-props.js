import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .getFunctionExpression()
    .renameParamTo(0, "this")
    .toSource();
}