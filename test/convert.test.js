import { csvFileToJson } from "../lib/util.js";
import legacyCodeStep from "./data/legacy-code-step";
import convert from "../lib/convert.js";

const parseActionsCsv = async (path) => {
  const actionConfigs = await csvFileToJson(path);
  return actionConfigs.map(actionConfig => ({
    code: actionConfig.CODE_RAW,
    codeConfig: actionConfig.CODE_CONFIG_JSON,
    namespace: actionConfig.DEFAULT_NAMESPACE,
    title: actionConfig.TITLE,
    description: actionConfig.DESCRIPTION,
    versionMajor: actionConfig.PUBLISHED_VERSION_MAJOR,
    versionMinor: actionConfig.PUBLISHED_VERSION_MINOR,
    hashId: actionConfig.HID,
  }));
};

test("Converts published legacy action to component action", async () => {
  const actionConfigs = await parseActionsCsv("./test/data/actions.csv");
  const actionConfig = actionConfigs[0];
  const convertedAction = await convert(actionConfig, {
    defineComponent: false,
    createLabel: false,
    toEsm: true,
    addPlaceholderAppProp: false,
  });
  expect(convertedAction.code).toMatchSnapshot();
});

test("Converts legacy code step to component", async () => {
  const convertedAction = await convert(legacyCodeStep, {
    defineComponent: false,
    createLabel: false,
    toEsm: true,
    usePipedreamLintRules: false,
  });
  expect(convertedAction.code).toMatchSnapshot();
});
