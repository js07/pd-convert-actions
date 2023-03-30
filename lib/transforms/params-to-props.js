import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .getFunctionExpression()
    .renameTo(0, "this")
    .toSource();
}