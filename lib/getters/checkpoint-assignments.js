import jscodeshift from "jscodeshift/dist/core.js";
import { register } from "../collections/LegacyAction.js";
register();

export default function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);
  // `this.$checkpoint = __a` -> `__a`
  return ast
    .getCheckpointAssignmentExpressions()
    .nodes();
}
