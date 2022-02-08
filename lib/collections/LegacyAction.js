const Collection = require("jscodeshift/dist/Collection");
const { register: registerArrowFunctionExpression } = require("./ArrowFunctionExpression");
const recast = require("recast");
const once = require("lodash.once");
const { fromPaths } = require("jscodeshift/dist/Collection");

const types = recast.types.namedTypes;

const File = types.File;


/**
* @mixin
*/
const traversalMethods = {
  getFunctionExpression: function() {
    return fromPaths([this.get("program", "body", 0, "expression")], this);
  },

  /**
   * Finds occurences of `auths` member expressions
   * 
   * `auths.__a`
   * 
   * @return {Collection}
   */
  getAuthMemberExpressions: function() {
    return this.getFunctionExpression()
      .getVariableInstances(1)
      .map((path) => path.parent)
      .filter((path) => types.MemberExpression.check(path.value));
  },

  /**
   * Finds occurences of `auths` variable declarators
   * 
   * `const { __a: __b } = auths`
   * 
   * @return {Collection}
   */
  getAuthVariableDeclarators: function() {
    return this.getFunctionExpression()
      .getVariableInstances(1)
      .map((path) => path.parent)
      .filter((path) => types.VariableDeclarator.check(path.value))
      .filter((path) => path.value.id.properties.length === 1);
  },

  /**
   * Finds occurences of `this.$checkpoint` assignment expressions
   * 
   *  `this.$checkpoint = __a`
   * 
   * @return {Collection}
   */
  getCheckpointAssignmentExpressions: function() {
    return this
      .find(types.ThisExpression)
      .filter((path) => {
        const parent = path.parent.node;
        const isObjectThis = types.MemberExpression.check(parent) && parent.object === path.node;
        const isPropertyCheckpoint =
            types.Identifier.check(parent.property)
            && parent.property.name === "$checkpoint";
        return isObjectThis && isPropertyCheckpoint;
      })
      .map((path) => path.parent)
      .filter((path) => {
        const parent = path.parent.node;
        return types.AssignmentExpression.check(parent) && parent.left === path.node;
      })
      .map((path) => path.parent);
  },

  /**
   * Finds occurences of `this.$checkpoint` expressions
   * 
   * `this.$checkpoint` (not `__a = this.$checkpoint`)
   * 
   * @returns {Collection}
   */
  getCheckpointExpressions: function() {
    return this
      .find(types.ThisExpression)
      .filter((path) => {
        const parent = path.parent.node;
        const isObjectThis = types.MemberExpression.check(parent) && parent.object === path.node;
        return isObjectThis && parent.property.name === "$checkpoint";
      })
      .map((path) => path.parent)
      .filter((path) => {
        const parent = path.parent.node;
        return !(types.AssignmentExpression.check(parent) && parent.left === path.node);
      });
  }

};

function register() {
  registerArrowFunctionExpression();
  Collection.registerMethods(traversalMethods, File);
}

exports.register = once(register);