import { register } from "../collections/LegacyAction.js";
register();

// replace `axios(this, __a)` with `axios($, __a)`
// replace `.axios(this, __a)` with `.axios($, __a)`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.getAxiosThisCalls()
    .filter((path) => {
      return j.ThisExpression.check(path.value.arguments[0]);
    })
    .map((path) => {
      return path.get("arguments", 0);
    })
    .replaceWith(() => {
      return j.identifier("$");
    });

  return ast.toSource();
}