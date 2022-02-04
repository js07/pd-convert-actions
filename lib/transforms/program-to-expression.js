module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  const ast = j(fileInfo.source);
  return j(ast.get("program", "body", 0, "expression", "body"))
    .toSource();
};