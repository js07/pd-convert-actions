const Collection = require("jscodeshift/dist/Collection");
const NodeCollection = require("jscodeshift/dist/collections/Node");
const recast = require("recast");
const once = require("lodash.once");

const Node = require("./Node");

const types = recast.types.namedTypes;

const ArrowFunctionExpression = types.namedTypes.ArrowFunctionExpression;

/**
* @mixin
*/
const traversalMethods = {

  /**
   * Find occurences of a variable from a function parameter
   *
   * @param {number} paramIdx - Index of the function parameter
   * @param {boolean} getSelf - Whether to include the function parameter in the
   * returned Collection
   *
   * @return {Collection}
   */
  getVariableInstances: function(paramIdx, getSelf = false) {
    // let paths = [];
    return this.map(function(path) {
      const node = path.value;
      return Collection.fromPaths([path], this)
        .getVariableOccurences(node.params[paramIdx].name)
        .filter(function(path) { // ignore self unless getSelf
          return getSelf || path.parent.value !== node;
        })
        .paths();
    });
  },
};

const transformMethods = {
  /**
   * Renames a variable and all its occurrences
   *
   * @param {string} newName
   * @return {Collection}
   */
  renameTo: function(paramIdx, newName, replaceSelf=false) {
    // TODO: Include JSXElements
    return this.
      getVariableInstances(paramIdx, replaceSelf)
      .forEach((path) => {
        path.get("name").replace(newName);
      });
  }
};

function register() {
  NodeCollection.register();
  Node.register();
  Collection.registerMethods(traversalMethods, ArrowFunctionExpression);
  Collection.registerMethods(transformMethods, ArrowFunctionExpression);
}

exports.register = once(register);