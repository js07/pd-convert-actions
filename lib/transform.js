const applyTransform = require("jscodeshift/dist/testUtils").applyTransform;

const checkpointToDbSet = require("./transforms/checkpoint-to-db-set");
const checkpointToDbGet = require("./transforms/checkpoint-to-db-get");
const paramsToProps = require("./transforms/params-to-props");
const authsToAuth = require("./transforms/auths-to-auth");
const programToExpression = require("./transforms/program-to-expression");
const namedExportToDollarExport = require("./transforms/named-export-to-dollar-export");
const sendToDotSend = require("./transforms/send-to-dot-send");
const respondToDotRespond = require("./transforms/respond-to-dot-respond");


function legacyToComponentCode(source) {
  let output = source;
  output = applyTransform(checkpointToDbSet, {}, { source: output });
  output = applyTransform(checkpointToDbGet, {}, { source: output });
  output = applyTransform(sendToDotSend, {}, { source: output });
  output = applyTransform(respondToDotRespond, {}, { source: output });
  output = applyTransform(namedExportToDollarExport, {}, { source: output });
  output = applyTransform(paramsToProps, {}, { source: output });
  output = applyTransform(authsToAuth, {}, { source: output });
  output = applyTransform(programToExpression, {}, { source: output });
  return output;
}

function transform(source) {
  return legacyToComponentCode(source);
}

module.exports = transform;