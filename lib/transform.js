const applyTransform = require("jscodeshift/dist/testUtils").applyTransform;

const checkpointToDbSet = require("./transforms/checkpoint-to-db-set");
const checkpointToDbGet = require("./transforms/checkpoint-to-db-get");
const paramsToProps = require("./transforms/params-to-props");
const authsToAuth = require("./transforms/auths-to-auth");
const programToExpression = require("./transforms/program-to-expression");
const namedExportToDollarExport = require("./transforms/named-export-to-dollar-export");
const sendToDotSend = require("./transforms/send-to-dot-send");
const respondToDotRespond = require("./transforms/respond-to-dot-respond");
const endToFlowExit = require("./transforms/end-to-flow-exit");

function applyTransforms(source, transforms) {
  let output = source;
  for (const transform of transforms) {
    output = applyTransform(transform, {}, { source: output });
  }
  return output;
}

function legacyToComponentCode(source) {
  return applyTransforms(source, [
    checkpointToDbSet,
    checkpointToDbGet,
    sendToDotSend,
    respondToDotRespond,
    endToFlowExit,
    namedExportToDollarExport,
    paramsToProps,
    authsToAuth,
    programToExpression
  ]);
}

function transform(source) {
  return legacyToComponentCode(source);
}

module.exports = transform;