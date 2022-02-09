const camelcase = require("camelcase");
const { fromPaths } = require("jscodeshift/dist/Collection");
const { register } = require("../collections/ArrowFunctionExpression");
register();

// convert `const ` to `$.export(__a, __b)`

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  ast
    .findVariableDeclarators()
    .filter((path) => {
      return path.value.id?.name?.slice(1).includes("_");
    })
    .forEach((path) => {
      const newName = camelcase(path.value.id.name);
      fromPaths([path]).renameTo(newName);
    });

  return ast.toSource();
};