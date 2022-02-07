const jscodeshift = require("jscodeshift/dist/core");
const { register } = require("../collections/LegacyAction");
register();

module.exports = function(fileInfo) {
  const j = jscodeshift;

  const ast = j(fileInfo.source);
  // `this.$checkpoint`
  return ast
    .getCheckpointExpressions()
    .nodes();
};
