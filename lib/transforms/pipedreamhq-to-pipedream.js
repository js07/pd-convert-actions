import { register } from "../collections/LegacyAction.js";
register();

// replace `require("@pipedreamhq/platform")` with `require("@pipedream/platform")`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.getRequirePipedreamHQPlatform()
    .replaceWith(() => {
      return j.callExpression(j.identifier("require"), [j.literal("@pipedream/platform")]);
    });

  return ast.toSource();
}