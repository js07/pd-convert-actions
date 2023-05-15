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
const globalMethods = {
  /**
   * Creates a try...finally statement whose try block is the legacy action's
   * main code block
   * @param {import("jscodeshift").JSCodeshift} j 
   * @param {import("jscodeshift").BlockStatement} block
   * @returns the try...finally statement
   */
  createTryFinallyBlock: function(j, block) {
    return j.tryStatement(
      block,
      null,
      j.blockStatement([])
    );
  },

  /**
   * Returns an await expression that calls the specified method with the
   * specified key and arguments on the db object
   * 
   * @example
   * // returns `await this.db.get("foo")`
   * ast.createDataStoreCall(j, "get", "foo")
   * @example
   * // returns `await this.db.set("foo", "bar")`
   * ast.createDataStoreCall(j, "set", "foo", j.literal("bar"))
   * 
   * @param {import("jscodeshift").JSCodeshift} j 
   * @param {String} methodName 
   * @param {String} key 
   * @param  {...any} args 
   * @returns the await expression
   */
  createDataStoreCall: function(j, methodName = "get", key, ...args) {
    return j.awaitExpression(
      j.callExpression(
        j.memberExpression(
          j.memberExpression(j.thisExpression(), j.identifier("db")),
          j.identifier(methodName),
        ),
        [j.literal(key), ...args]
      ));
  },
};

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
      .getParamVariableInstances(1)
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
      .getParamVariableInstances(1)
      .map((path) => path.parent)
      .filter((path) => types.VariableDeclarator.check(path.value))
      .filter((path) => path.value.id.properties.length === 1);
  },

  /**
   * Finds occurrences of `params` member expressions
   * 
   * `params.__a`
   * 
   * @return {Collection}
   */
  getParamsMemberExpressions: function() {
    return this.getFunctionExpression()
      .getParamVariableInstances(0)
      .map((path) => path.parent)
      .filter((path) => types.MemberExpression.check(path.value));
  },

  /**
   * Finds occurrences of `params` variable declarators
   * 
   * `const { __a: __b } = params`
   * 
   * @return {Collection}
   */
  getParamsVariableDeclarators: function() {
    return this.getFunctionExpression()
      .getParamVariableInstances(0)
      .map((path) => path.parent)
      .filter((path) => types.VariableDeclarator.check(path.value))
      .filter((path) => path.value.id.properties.length === 1);
  },

  getLegacyCodeCellVars: function(name) {
    return this.find(types.Identifier)
      .filter((path) => {
        return path.node.name === name;
      })
      .filter((path) => {
        const parent = path.parent.node;
        const isMemberProperty =
          types.MemberExpression.check(parent)
          && parent.property === path.node;
        const isObjectProperty = 
          types.Property.check(parent)
          && parent.key === path.node;
        // must not be a property (e.g., foo.<name>) or { <name>: value }
        return !isMemberProperty && !isObjectProperty;
      });
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
      .getCheckpointExpressions()
      .filter((path) => {
        const parent = path.parent.node;
        return types.AssignmentExpression.check(parent) && parent.left === path.node;
      })
      .map((path) => path.parent);
  },

  /**
   * Finds occurrences of `this.$checkpoint` expressions
   * 
   * @returns {Collection}
   */
  getCheckpointExpressions: function() {
    return this
      .find(types.ThisExpression)
      .filter((path) => {
        const parent = path.parent.node;
        // looks like `this.<property>`
        const isObjectThis = types.MemberExpression.check(parent) && parent.object === path.node;
        // looks like `<object>.$checkpoint`
        const isPropertyCheckpoint =
            types.Identifier.check(parent.property)
            && parent.property.name === "$checkpoint";
        return isObjectThis && isPropertyCheckpoint;
      })
      .map((path) => path.parent);
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


/**
* @mixin
*/
const mutationMethods = {
  /**
   * Creates a try...finally statement at the end of the legacy action's main
   * code block and moves the prior main code block into the try block
   * @param {import("jscodeshift").JSCodeshift} j 
   * @returns the try...finally node
   */
  addTryFinallyBlock: function(j) {
    this.getMainBlock().replace(
      j.blockStatement(
        [this.createTryFinallyBlock(j, this.getMainBlock().node)]
      )
    );
  },

  /**
   * Finds or creates a try...finally statement at the end of the legacy
   * action's main code block
   * @param {import("jscodeshift").JSCodeshift} j 
   * @returns the try...finally node
   */
  getOrAddTryFinallyBlock: function(j) {
    if (!this.hasTryFinallyBlock()) {
      this.addTryFinallyBlock(j);
    }
    return this.getTryFinallyBlock();
  },
};

/**
 * @mixin
 */
const mappingMethods = {
  /**
   * Returns the legacy action's main code block
   * @returns {recast.types.ASTNode}
   */
  getMainBlock: function() {
    return this.getFunctionExpression().get("body");
  },

  /**
   * Gets the try...finally statement at the end of the legacy action's main
   * code block
   * @returns the try..finally node if found, else null
   */
  getTryFinallyBlock: function() {
    const mainBlock = this.getMainBlock();
    const mainBlockNode = mainBlock.get("body").value;
    const lastNodeInMainBlock = mainBlockNode[mainBlockNode.length - 1];
    if (lastNodeInMainBlock?.type !== "TryStatement" || !lastNodeInMainBlock.finalizer || lastNodeInMainBlock.handler) {
      return null;
    }
    return lastNodeInMainBlock;
  },

  /**
   * @returns true if the legacy action's main code block ends with a
   * try...finally statement, otherwise false
   */
  hasTryFinallyBlock: function() {
    return Boolean(this.getTryFinallyBlock());
  },
};

export const register = once(() => {
  registerArrowFunctionExpression();
  Collection.registerMethods(globalMethods, File);
  Collection.registerMethods(traversalMethods, File);
  Collection.registerMethods(mutationMethods, File);
  Collection.registerMethods(mappingMethods, File);
});

export default {
  register
};