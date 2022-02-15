const { register } = require("../collections/LegacyAction");
const { identifier } = require("safe-identifier");
const camelcase = require("camelcase");
register();

// Convert `module.exports =` to `export default`
// Convert `__b = require("__a")` to `import __b from "__a"`
// Convert `{ __b } = require("__a")` to `import { __b } from "__a"` at top level
// Convert `require("__a").__c` to `__c` and `import { __c } from "__a"` at top level
// Convert `require("__a")(__b)` to `camelCase(__a)(__b)` and 
//  `import camelCase(__a) from "__a" at top level

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ast = j(fileInfo.source);

  const getFirstPath = () => ast.find(j.Program).get("body", 0);
  const getFirstNode = () => getFirstPath().node;

  const hasImport = (propName, sourceValue) => {
    return ast
      .find(j.ImportDeclaration)
      .filter((path) => {
        return path.value.source.value === sourceValue
          && path.value.specifiers.find((s) => {
            return s.local
              ? s.local.name === propName
              : s.imported.name === propName;
          });
      })
      .size() > 0;
  };


  const prependDefaultImport = (propName, sourceValue) => {
    if (hasImport(propName, sourceValue)) {
      return;
    }
    getFirstPath().insertBefore(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(propName))],
        j.literal(sourceValue)
      )
    );
  };

  const prependImport = (propNames, sourceValue) => {
    const newPropNames = propNames.filter((p) => !hasImport(p, sourceValue));
    if (newPropNames.length === 0) {
      return;
    }
    getFirstPath().insertBefore(
      j.importDeclaration(
        propNames.map((p) => j.importSpecifier(j.identifier(p))),
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
      const sourceValue = path.get("arguments", 0).value.value;
      let fnName = path.parent.value.property.name;
      // Hack? Convert `require("__a").default` to `__aModule.default` and
      // `import __aModule from "__a"` instead
      if (fnName === "default") {
        const moduleName = camelcase(identifier(`${sourceValue}Module`));
        prependDefaultImport(moduleName, sourceValue);
        path.replace(j.identifier(moduleName));
        return;
      }
      // Hack to fix duplicate axios var when axios and pipedream axios are used
      if (
        fnName === "axios" && sourceValue !== "axios"
        && (ast.getRequireCalls("axios").size() > 0 || ast.getImports("axios").size() > 0)
      ) {
        fnName = "pipedreamAxios"; 
      }
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
      prependDefaultImport(fnName, sourceValue);
      path.parent.prune();
    });

  // ELSE, for all other `require()` call expressions
  // Convert `require("__a")(__b)` to `camelCase(__a)(__b)` and 
  //  `import camelCase(__a) from "__a" at top level
  ast.getRequireCalls()
    .forEach((path) => {
      const sourceValue = path.get("arguments", 0).value.value;
      const fnName = camelcase(sourceValue);
      prependDefaultImport(fnName, sourceValue);
      path.replace(j.identifier(fnName));
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