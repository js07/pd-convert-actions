import { fromPaths } from "jscodeshift/dist/Collection.js";
import { register } from "../collections/LegacyAction.js";
register();

// remove `import __a from "axios"` if __a is unused

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.getRequireCalls("axios")
    .map((path) => path.parent)
    .filter((path) => j.VariableDeclarator.check(path.node))
    .filter((path) => j.Identifier.check(path.value.id))
    .filter((path) => {
      const occurrences = fromPaths([path]).getVariableOccurrences(path.value.id.name);
      return occurrences.length <= 1;
    })
    .remove();

  return ast.toSource();
}