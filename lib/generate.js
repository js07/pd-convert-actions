const Handlebars = require("handlebars");
const { readFile } = require("./util");

const TEMPLATE_PATH = "../resources/templates/action-cjs.handlebars";

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
  const templateString = readFile(TEMPLATE_PATH, { relative: true });
  const template = Handlebars.compile(templateString, { noEscape: true });
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

module.exports = generate;