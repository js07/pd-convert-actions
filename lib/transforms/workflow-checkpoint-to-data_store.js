import { register } from "../collections/LegacyAction.js";
register();

// convert `$checkpoint = __a` to
// ```
// let $checkpoint = await this.db.get("$checkpoint");
// try {
//  $checkpoint = __a;
// } finally {
//   await this.db.set("$checkpoint", $checkpoint); 
// }
// ```

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ast = j(fileInfo.source);

  const checkpointVarName = "$checkpoint";
  const checkpointDBKey = "$checkpoint";

  const checkpointExpressions = ast.getLegacyCodeCellVars("$checkpoint");
  // If there's at least one checkpoint expression:
  //  1. Find or create try...finally statement
  //  2. Add `await this.db.set("$checkpoint", $checkpoint)` to finally block
  //  3. Add `let $checkpoint = await this.db.get("$checkpoint")` before try...finally
  if (checkpointExpressions.size()) {
    const tryFinallyBlock = ast.getOrAddTryFinallyBlock(j);
    const finallyBlock = tryFinallyBlock.finalizer.body;
    finallyBlock.push(j.expressionStatement(
      ast.createDataStoreCall(j, "set", checkpointDBKey, j.identifier(checkpointVarName))
    ));
    const mainBlock = ast.getMainBlock();
    mainBlock.get("body").unshift(
      j.variableDeclaration("let", [
        j.variableDeclarator(
          j.identifier(checkpointVarName),
          ast.createDataStoreCall(j, "get", checkpointDBKey)
        )
      ])
    );
  }

  return ast.toSource();
}