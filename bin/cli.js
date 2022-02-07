#!/usr/bin/env node
const convert = require("../lib/convert");
const { writeFile } = require("../lib/util");
const csv = require("csvtojson");
const { parse } = require("json2csv");
var inquirer = require("inquirer");

var argv = require("minimist")(process.argv.slice(2));

async function prompt() {
  return inquirer.prompt([
    {
      type: "list",
      name: "outputType",
      message: "Output as separate javascript files or a single CSV file?",
      default: "js",
      choices: [
        { name: "JavaScript", value: "js" }, 
        { name: "CSV", value: "csv" },
      ],
    },
    {
      type: "input",
      name: "out",
      message: "CSV output path",
      default: "test/output/component_actions.csv",
      when: ({ outputType }) => outputType === "csv",
    },
    {
      type: "input",
      name: "componentsDirPath",
      message: "Path to components directory to write files to",
      default: "./test/output",
      when: ({ outputType }) => outputType === "js",
    },
    {
      type: "confirm",
      name: "defineComponent",
      message: "Wrap the component with `defineComponent()`?",
      default: false,
    },
  ]);
}

async function readCsvFile(path) {
  return csv().fromFile(path);
}

async function convertAction(actionConfig, options) {
  const {
    CODE_RAW: codeRaw,
    TITLE: title,
    DEFAULT_NAMESPACE: namespace,
    DESCRIPTION: description,
    CODE_CONFIG_JSON: codeConfig,
    PUBLISHED_VERSION_MAJOR: publishedVersionMajor,
    PUBLISHED_VERSION_MINOR: publishedVersionMinor,
  } = actionConfig;
  try {
    return await convert({
      code: codeRaw,
      codeConfig,
      namespace,
      title,
      description,
    }, options);
  } catch (error) {
    console.log(`Error converting action "${title}":`, error);
  }
}

async function main() {
  const [csvPath] = argv._;
  const answers = await prompt();
  const {
    outputType,
    componentsDirPath,
    out,
    defineComponent,
  } = answers;

  const actionConfigs = await readCsvFile(csvPath);

  let convertedActions = [];
  for (const actionConfig of actionConfigs) {
    convertedActions.push(await convertAction(actionConfig, { defineComponent }));
  }

  if (outputType === "js") {
    for (const action of convertedActions) {
      const { code, appSlug, componentSlug } = action;
      writeFile(`${componentsDirPath}/${appSlug}/actions/${componentSlug}/${componentSlug}.js`, code);
    }
  } else {
    const csv = parse(convertedActions, { fields: ["code", "appSlug", "componentSlug"] });
    writeFile(out, csv);
  }
}

main()
  .then()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });