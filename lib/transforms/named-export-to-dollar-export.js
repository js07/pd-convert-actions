import { uniqueId } from "../util.js";
import { register } from "../collections/LegacyAction.js";
register();

// convert `this.__a = __b` to `let __a; try { __a = __b; } finally { $.export("__a", __a) }`

export default function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ast = j(fileInfo.source);
  const mainBlock = ast.getMainBlock();
  
  const namedExports = new Set();
  // Step 1: Find all named exports
  ast
    .find(j.ThisExpression)
    .filter((path) => {
      const parent = path.parent.node;
      return j.MemberExpression.check(parent) && parent.object === path.node;
    })
    .map((path) => path.parent)
    .filter((path) => {
      const parent = path.parent.node;
      return j.AssignmentExpression.check(parent) && parent.left === path.node;
    })
    .forEach((path) => {
      namedExports.add(path.value.property.name);
    });

  const namedExportToNewVarName = {};

  // Step 2: For each named export, `this.__a`, generate:
  // ```js
  // let __a; // or __a_uniqueId if __a already exists
  // try { /* rest of code */ } finally { 
  //   $.export("__a", __a)
  // }
  // ```
  namedExports.forEach((namedExport) => {
    // If a variable with the same name as the named export exists, generate a new name
    const varOccurences = j(fileInfo.source).getFunctionExpression()
      .getVariableOccurrences(namedExport);
    const newVarName = varOccurences.size() ? `${namedExport}_${uniqueId()}` : namedExport;
    namedExportToNewVarName[namedExport] = newVarName;
    // Find or create try...finally block at bottom of code
    const tryFinallyBlock = ast.getOrAddTryFinallyBlock(j);
    // Add $.export("namedExport", __newName) to finally block
    const finallyBlock = tryFinallyBlock.finalizer.body;
    finallyBlock.push(
      j.expressionStatement(
        j.callExpression(
          j.memberExpression(j.identifier("$"), j.identifier("export")), [
            j.literal(namedExport),
            j.identifier(newVarName),
          ]
        )
      )
    );
    // Add let __newName to start of code
    mainBlock.get("body").unshift(
      j.variableDeclaration("let", [
        j.variableDeclarator(
          j.identifier(newVarName)
        )
      ])
    );
  });

  // Step 3: Replace this.__a with __a (or __a_uniqueId if __a already exists)
  ast
    .find(j.ThisExpression)
    .filter((path) => {
      const parent = path.parent.node;
      return j.MemberExpression.check(parent) && parent.object === path.node;
    })
    .map((path) => path.parent)
    .filter((path) => namedExports.has(path.value.property.name))
    .replaceWith((path) => {
      return j.identifier(namedExportToNewVarName[path.value.property.name]);
    });

  return ast.toSource();
}