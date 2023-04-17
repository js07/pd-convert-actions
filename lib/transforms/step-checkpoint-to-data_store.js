import { uniqueId } from "../util.js";
import { register } from "../collections/LegacyAction.js";
register();

// convert `this.$checkpoint = __a` to
// ```
// let stepCheckpoint = await this.db.get("scp_${uniqueId}");
// try {
//  stepCheckpoint = __a;
// } finally {
//   await this.db.set("scp_${uniqueId}", stepCheckpoint); 
// }
// ```

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ast = j(fileInfo.source);

  const checkpointVarName = "stepCheckpoint";

  const createDataStoreCall = (methodName = "get", scpId, ...args) => {
    return j.awaitExpression(
      j.callExpression(
        j.memberExpression(
          j.memberExpression(j.thisExpression(), j.identifier("db")),
          j.identifier(methodName),
        ),
        [j.literal(scpId), ...args]
      ));
  };

  const checkpointExpressions = ast.getCheckpointExpressions();
  // If there's at least one checkpoint expression:
  //  1. Find or create try...finally statement
  //  2. Add `await this.db.set("scp_<uniqueId>"", stepCheckpoint)` to finally block
  //  3. Add `let stepCheckpoint = await this.db.get("scp_<uniqueId>")` before try...finally
  if (checkpointExpressions.size()) {
    const scpId = `scp_${uniqueId()}`;
    const tryFinallyBlock = ast.getOrAddTryFinallyBlock(j);
    const finallyBlock = tryFinallyBlock.finalizer.body;
    finallyBlock.push(j.expressionStatement(
      createDataStoreCall("set", scpId, j.identifier(checkpointVarName))
    ));
    const mainBlock = ast.getMainBlock();
    mainBlock.get("body").unshift(
      j.variableDeclaration("let", [
        j.variableDeclarator(
          j.identifier(checkpointVarName),
          createDataStoreCall("get", scpId)
        )
      ])
    );
  }
  
  // Replace this.$checkpoint expressions with stepCheckpoint
  ast.getCheckpointExpressions().replaceWith(() => j.identifier(checkpointVarName));

  return ast.toSource();
}