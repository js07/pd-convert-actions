const { register } = require("../collections/LegacyAction");
register();

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .getFunctionExpression()
    .renameTo(0, "this")
    .toSource();
};