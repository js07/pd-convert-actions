import Handlebars from "handlebars";

import actionCjsTemplate from "../resources/templates/action-cjs.js";

Handlebars.registerHelper("isdefined", function (value) {
  return value !== undefined;
});

Handlebars.registerHelper("tostring", function(variable) {
  return JSON.stringify(variable);
});

/**
 * 
 * @param {object} componentProps 
 * @param {object} opts 
 * @returns {string} The generated component
*/
function generateComponent(
  { code, props, name, description, key, version, hashId },
  { defineComponent } = {}
) {
  const template = Handlebars.compile(actionCjsTemplate, { noEscape: true });
  return template({ code, props, name, description, key, version, defineComponent, hashId });
}

/**
 * 
 * @param {object} componentProps 
 * @param {object} opts 
 * @returns {string} The generated component
 */
function generate(
  { code, props, name, description, key, version, hashId },
  { defineComponent } = {}
) {
  return generateComponent(
    { code, props, name, description, key, version, hashId },
    { defineComponent }
  );
}

export default generate;