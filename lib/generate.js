const Handlebars = require("handlebars");
const { readFile } = require("./util");

Handlebars.registerHelper("isdefined", function (value) {
  return value !== undefined;
});

Handlebars.registerHelper("tostring", function(variable) {
  return JSON.stringify(variable);
});


const TEMPLATE_PATH = "../resources/templates/action-cjs.handlebars";

function generateComponent({ code, props, name, description, key }) {
  const templateString = readFile(TEMPLATE_PATH, { relative: true });
  const template = Handlebars.compile(templateString, { noEscape: true });
  return template({ code, props, name, description, key });
}

function generate({ code, props, name, description, key }) {
  return generateComponent({ code, props, name, description, key });
}

module.exports = generate;