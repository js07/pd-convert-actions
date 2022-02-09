const { register } = require("../collections/LegacyAction");
register();

// convert `__a = __b` to `let __a = __b` if `__a` is undeclared

// For each AssignmentExpression
//  if a parent scope doesn't declare variable, convert to declaration
module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);

  ast.find(j.AssignmentExpression)
    .forEach((path) => {
      const varName = path.value.left.name;
      if (!varName) {
        return;
      }
      // Force scan for each assignment expression to detect new variable declarations
      path.scope.scan(true);
      const varScope = path.scope.lookup(varName);
      if (!varScope) {
        path.parent.replace(
          j.variableDeclaration("let", [j.variableDeclarator(j.identifier(varName), path.value.right)])
        );
      }
    });
  return ast.toSource();
};