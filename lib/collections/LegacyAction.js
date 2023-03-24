import Collection from "jscodeshift/dist/Collection.js";
import { register as registerArrowFunctionExpression } from "./ArrowFunctionExpression.js";
import recast from "recast";
import once from "lodash.once";
import { fromPaths } from "jscodeshift/dist/Collection.js";

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
   * Finds occurrences of `auths` member expressions
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
   * Finds occurrences of `auths` variable declarators
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
   * Finds occurrences of `this.$checkpoint` assignment expressions
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
   * Finds occurrences of `this.$checkpoint` expressions
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
  },

  getRequireCalls: function(name) {
    return this
      .find(types.CallExpression)
      .filter((path) => {
        return path.value.callee?.name === "require";
      })
      .filter((path) => {
        return !name || path.value.arguments?.[0]?.value === name;
      });
  },

  getImports: function(value) {
    return this
      .find(types.ImportDeclaration)
      .filter((path) => {
        return !value || path.value.source.value === value;
      });
  },

  /**
   * Finds occurrences of `require("@pipedreamhq/platform")`
   * 
   * @returns {Collection}
   */
  getRequirePipedreamHQPlatform: function() {
    return this
      .getRequireCalls("@pipedreamhq/platform");
  },

  /**
   * Finds occurences of axios call expressions
   * 
   * `axios(this, {})` or `__a.axios(this, {})`
   * 
   * @returns {Collection}
   */
  getAxiosThisCalls: function() {
    return this
      .find(types.CallExpression)
      .filter((path) => {
        const isAxiosIdentifier = ((n) => 
          types.Identifier.check(n) && n.name === "axios"
        );
        const callee = path.value.callee;
        return isAxiosIdentifier(callee) || 
          (types.MemberExpression.check(callee) && isAxiosIdentifier(callee.property));
      });
  }

};

export const register = once(() => {
// function register() {
  registerArrowFunctionExpression();
  Collection.registerMethods(traversalMethods, File);
// }
});

// export const register = once(register);

// exports.register = once(register);

export default {
  register
};