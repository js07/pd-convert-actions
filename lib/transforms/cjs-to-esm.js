import { register } from "../collections/LegacyAction.js";
import { identifier } from "safe-identifier";
import camelcase from "camelcase";
import varname from "varname";
register();

// - Convert `module.exports = ` to `export default`
// - Convert `__b = require("__a")` to `import __b from "__a"`
// - Convert `{ __b } = require("__a")` to `import { __b } from "__a"` at top level
// - Convert `require("__a").__c` to `__c` and `import { __c } from "__a"` at top level
// - If a variable called __c already exists:
//    Convert `require("__a").__c` to `camelCase(__a-__c)` and
//    `import { __c: camelCase(__a-__c) }` at top level
// - Convert `require("__a")(__b)` to `camelCase(__a)(__b)` and 
//    `import camelCase(__a) from "__a" at top level
// - If a variable called camelCase(__a) already exists:
//    Convert `require("__a")(__b)` to `camelCase(__a)Module(__b)` and
//    `import camelCase(__a)Module from "__a" at top level

export default function(fileInfo, api, options) {
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
    let specifiers = propNames;
    if (!(typeof propNames[0] === "object")) {
      specifiers = propNames.map((p) => ({ imported: p, local: p }));
    }
    const newPropNames = specifiers.filter((s) => !hasImport(s.local, sourceValue));
    if (newPropNames.length === 0) {
      return;
    }
    getFirstPath().insertBefore(
      j.importDeclaration(
        specifiers.map((s) => j.importSpecifier(
          j.identifier(s.imported), (s.local !== s.imported) ? j.identifier(s.local) : null)
        ),
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
      const propertyName = path.parent.value.property.name;
      // Hack? Convert `require("__a").default` to `__aModule.default` and
      // `import __aModule from "__a"` instead
      if (propertyName === "default") {
        const moduleName = camelcase(identifier(`${sourceValue}Module`));
        prependDefaultImport(moduleName, sourceValue);
        path.replace(j.identifier(moduleName));
        return;
      }
      if (hasImport(propertyName, sourceValue)) {
        path.parent.replace(j.identifier(propertyName));
        return;
      }
      // If a variable with the same name as the imported property exists,
      // import the property as the conctenation of the package name and
      // property name
      let fnName = propertyName;
      if (path.scope.lookup(propertyName)) {
        fnName = varname.camelback(`${sourceValue}-${propertyName}`);
        prependImport([{ imported: propertyName, local: fnName }], sourceValue);
      } else {
        prependImport([propertyName], sourceValue);
      }
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
      let fnName = camelcase(sourceValue);
      // If a variable with the same name as the default import name exists,
      // append "Module"
      if (path.scope.lookup(fnName)) {
        fnName += "Module";
      }
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
}