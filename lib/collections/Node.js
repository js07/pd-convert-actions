const Collection = require("jscodeshift/dist/Collection");
const NodeCollection = require("jscodeshift/dist/collections/Node");
const recast = require("recast");
const once = require("lodash.once");

const types = recast.types.namedTypes;

const Node = recast.types.namedTypes.Node;

/**
* @mixin
*/
const traversalMethods = {
  /**
   * Gets a variable's occurrences. Sourced from
   * {@link https://bit.ly/3B4BwNa jscodeshift's GitHub Repo}.
   *
   * @param {string} varName
   * @return {Collection}
   */
  getVariableOccurrences: function(varName) {
    // TODO: Include JSXElements
    let paths = [];
    this.forEach(function(path) {
      // const node = path.value;
      // const oldName = node.id.name;
      const rootScope = path.scope;
      const rootPath = rootScope.path;
      Collection.fromPaths([rootPath])
        .find(types.Identifier, { name: varName })
        .filter(function(path) { // ignore non-variables
          const parent = path.parent.node;

          if (
            types.MemberExpression.check(parent) &&
            parent.property === path.node &&
            !parent.computed
          ) {
            // obj.varName
            return false;
          }

          if (
            types.Property.check(parent) &&
            parent.key === path.node &&
            !parent.computed
          ) {
            // { varName: 3 }
            return false;
          }

          if (
            types.MethodDefinition.check(parent) &&
            parent.key === path.node &&
            !parent.computed
          ) {
            // class A { varName() {} }
            return false;
          }

          if (
            types.ClassProperty.check(parent) &&
            parent.key === path.node &&
            !parent.computed
          ) {
            // class A { varName = 3 }
            return false;
          }

          if (
            types.JSXAttribute.check(parent) &&
            parent.name === path.node &&
            !parent.computed
          ) {
            // <Foo varName={varName} />
            return false;
          }

          return true;
        })
        .forEach(function(path) {
          let scope = path.scope;
          while (scope && scope !== rootScope) {
            if (scope.declares(varName)) {
              return;
            }
            scope = scope.parent;
          }
          if (scope) {
            paths.push(path);
          }
        });
    });
    return Collection.fromPaths(paths, this);
  }
};

function register() {
  NodeCollection.register();
  Collection.registerMethods(traversalMethods, Node);
}

exports.register = once(register);