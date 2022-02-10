const { register } = require("../collections/LegacyAction");
register();

// Convert `module.exports =` to `export default`
// Convert `__b = require("__a")` to `import __b from "__a"`
// Convert `{ __b } = require("__a")` to `import { __b } from "__a"` at top level
// Convert `require("__a").__c` to `__c` and `import { __c } from "__a"` at top level

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ast = j(fileInfo.source);

  const getFirstPath = () => ast.find(j.Program).get("body", 0);
  const getFirstNode = () => getFirstPath().node;

  const prependImport = (propNames, sourceValue) => {
    getFirstPath().insertBefore(
      j.importDeclaration(
        Array.isArray(propNames)
          ? propNames.map((p) => j.importSpecifier(j.identifier(p)))
          : [j.importDefaultSpecifier(j.identifier(propNames))],
        j.literal(sourceValue)
      )
    );
  };
  // Save the comments attached to the first node
  const firstNode = getFirstNode();
  const { comments } = firstNode;

  // Convert `module.exports =` to `export default`
  ast.find(j.AssignmentExpression)
    .filter((path) => {
      return j.MemberExpression.check(path.value.left)
        && j.Identifier.check(path.value.left.object)
        && j.Identifier.check(path.value.left.property)
        && path.value.left.object.name === "module"
        && path.value.left.property.name === "exports";
    })
    .forEach((path) => {
      path.parent.replace(j.exportDefaultDeclaration(path.value.right));
    });

  // Convert `require("__a").__c` to `__c` and `import { __c } from "__a"` at top level
  ast.getRequireCalls()
    .filter((path) => {
      const node = path.value;
      return j.MemberExpression.check(path.parent.value)
        && path.parent.value.object === node
        && j.Identifier.check(path.parent.value.property);
    })
    .forEach((path) => {
      const fnName = path.parent.value.property.name;
      const sourceValue = path.get("arguments", 0).value.value; 
      prependImport([fnName], sourceValue);
      path.parent.replace(j.identifier(fnName));
    });

  // Convert `{ __b } = require("__a")` to `import { __b } from "__a"` at top level
  ast.getRequireCalls()
    .filter((path) => {
      const node = path.value;
      return j.VariableDeclarator.check(path.parent.value)
      && path.parent.value.init === node
      && j.ObjectPattern.check(path.parent.value.id);
    })
    .forEach((path) => {
      const fnNames = path.parent.value.id.properties.map(p => p.key?.name);
      const sourceValue = path.get("arguments", 0).value.value; 
      prependImport(fnNames, sourceValue);
      path.parent.prune();
    });

  // Convert `__b = require("__a")` to `import __b from "__a"`
  ast.getRequireCalls()
    .filter((path) => {
      const node = path.value;
      return j.VariableDeclarator.check(path.parent.value)
      && path.parent.value.init === node
      && j.Identifier.check(path.parent.value.id);
    })
    .forEach((path) => {
      const fnName = path.parent.value.id.name;
      const sourceValue = path.get("arguments", 0).value.value; 
      prependImport(fnName, sourceValue);
      path.parent.prune();
    });

  // If the first node has been modified or deleted, reattach the comments
  const firstNode2 = getFirstNode();
  if (firstNode2 !== firstNode) {
    if (comments) {
      firstNode.comments = [];
      ast.find(j.Program).get("comments").replace(comments);
    }

    // Add newline after last import declaration
    const lastImport = ast.find(j.ImportDeclaration).at(-1);
    if (lastImport) {
      lastImport.insertAfter();
    }
  }

  return ast.toSource();
};