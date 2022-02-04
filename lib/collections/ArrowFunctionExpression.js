const Collection = require("jscodeshift/dist/Collection");
const NodeCollection = require("jscodeshift/dist/collections/Node");
const recast = require("recast");
const once = require("lodash.once");

const types = recast.types.namedTypes;

const ArrowFunctionExpression = recast.types.namedTypes.ArrowFunctionExpression;

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
    let paths = [];
    this.forEach(function(path) {
      var node = path.value;
      var oldName = node.params[paramIdx].name;
      var rootScope = path.scope;
      var rootPath = rootScope.path;
      Collection.fromPaths([rootPath])
        .find(types.Identifier, { name: oldName })
        .filter(function(path) { // ignore self unless getSelf
          return getSelf || path.parent.value !== node;
        })
        .filter(function(path) { // ignore properties in MemberExpressions
          var parent = path.parent.node;
          return !types.MemberExpression.check(parent) ||
              parent.property !== path.node ||
              !parent.computed;
        })
        .filter(function(path) { // ignore property keys
          var parent = path.parent.node;
          return !types.Property.check(parent) ||
              parent.key !== path.node;
        })
        .forEach(function(path) {
          var scope = path.scope;
          while (scope && scope !== rootScope) {
            if (scope.declares(oldName)) {
              return;
            }
            scope = scope.parent;
          }
          if (scope) { // identifier must refer to declared variable
            paths.push(path);
          }
        });
    });
    return Collection.fromPaths(paths, this);
  },
};

const transformMethods = {
  /**
   * Renames a variable and all its occurrences.
   *
   * @param {string} newName
   * @return {Collection}
   */
  renameTo: function(paramIdx, newName, replaceSelf=false) {
    // TODO: Include JSXElements
    return this.forEach(function(path) {
      var node = path.value;
      var oldName = node.params[paramIdx].name;
      var rootScope = path.scope;
      var rootPath = rootScope.path;
      Collection.fromPaths([rootPath])
        .find(types.Identifier, { name: oldName })
        .filter(function(path) {
          return replaceSelf || path.parent.value !== node;
        })
        .filter(function(path) { // ignore properties in MemberExpressions
          var parent = path.parent.node;
          return !types.MemberExpression.check(parent) ||
            parent.property !== path.node ||
            !parent.computed;
        })
        .filter(function(path) { // ignore property keys
          var parent = path.parent.node;
          return !types.Property.check(parent) ||
            parent.key !== path.node;
        })
        .forEach(function(path) {
          var scope = path.scope;
          while (scope && scope !== rootScope) {
            if (scope.declares(oldName)) {
              return;
            }
            scope = scope.parent;
          }
          if (scope) { // identifier must refer to declared variable
            path.get("name").replace(newName);
          }
        });
    });
  }
};

function register() {
  NodeCollection.register();
  Collection.registerMethods(traversalMethods, ArrowFunctionExpression);
  Collection.registerMethods(transformMethods, ArrowFunctionExpression);
}

exports.register = once(register);