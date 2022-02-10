#!/usr/bin/env node
const convert = require("../lib/convert");
const { writeFile } = require("../lib/util");
const csv = require("csvtojson");
var inquirer = require("inquirer");

var argv = require("minimist")(process.argv.slice(2));

async function prompt() {
  return inquirer.prompt([
    {
      type: "input",
      name: "componentsDirPath",
      message: "Path to directory to write files to",
      default: "./examples",
    },
    {
      type: "confirm",
      name: "defineComponent",
      message: "Wrap the component with `defineComponent()`?",
      default: false,
    },
    {
      type: "confirm",
      name: "createLabel",
      message: "Generate labels for component props?",
      default: false,
    },
    {
      type: "confirm",
      name: "toEsm",
      message: "Convert generated component to ESM?",
      default: true,
    },
  ], argv);
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
    PUBLISHED_VERSION_MAJOR: versionMajor = 0,
    PUBLISHED_VERSION_MINOR: versionMinor = 0,
    HID: hashId,
  } = actionConfig;
  try {
    return await convert({
      code: codeRaw,
      codeConfig,
      namespace,
      title,
      description,
      versionMajor,
      versionMinor,
      hashId,
    }, options);
  } catch (error) {
    console.log(`Error converting action "${title}":`, error);
  }
}

async function main() {
  const [csvPath] = argv._;
  const answers = await prompt();
  const {
    componentsDirPath,
    defineComponent,
    createLabel,
    toEsm,
  } = answers;

  const actionConfigs = await readCsvFile(csvPath);

  for (const actionConfig of actionConfigs) {
    const { code, componentKey } = await convertAction(actionConfig, {
      defineComponent,
      createLabel,
      toEsm,
    });

    const { CODE_RAW: codeRaw } = actionConfig;
    writeFile(`${componentsDirPath}/${componentKey}.before.js`, codeRaw);
    writeFile(`${componentsDirPath}/${componentKey}.after.js`, code);
  }
}

main()
  .then()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });