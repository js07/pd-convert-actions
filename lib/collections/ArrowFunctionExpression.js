import Collection from "jscodeshift/dist/Collection.js";
import NodeCollection from "jscodeshift/dist/collections/Node.js";
import recast from "recast";
import once from "lodash.once";

import Node from "./Node.js";

const types = recast.types.namedTypes;

const ArrowFunctionExpression = types.ArrowFunctionExpression;

/**
* @mixin
*/
const traversalMethods = {

  /**
   * Find occurrences of a variable from a function parameter
   *
   * @param {number} paramIdx - Index of the function parameter
   * @param {boolean} getSelf - Whether to include the function parameter in the
   * returned Collection
   *
   * @return {Collection}
   */
  getParamVariableInstances: function(paramIdx, getSelf = false) {
    // let paths = [];
    return this.map(function(path) {
      const node = path.value;
      return Collection.fromPaths([path], this)
        .getVariableOccurrences(node.params[paramIdx].name)
        .filter(function(path) { // ignore self unless getSelf
          return getSelf || path.parent.value !== node;
        })
        .paths();
    });
  },
};

const transformMethods = {
  /**
   * Renames a parameter and all its occurrences
   *
   * @param {string} newName
   * @return {Collection}
   */
  renameParamTo: function(paramIdx, newName, replaceSelf=false) {
    return this.
      getParamVariableInstances(paramIdx, replaceSelf)
      .forEach((path) => {
        path.get("name").replace(newName);
      });
  }
};

export const register = once(() =>{
  NodeCollection.register();
  Node.register();
  Collection.registerMethods(traversalMethods, ArrowFunctionExpression);
  Collection.registerMethods(transformMethods, ArrowFunctionExpression);
});

export default {
  register
};