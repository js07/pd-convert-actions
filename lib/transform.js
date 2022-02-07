const applyTransform = require("jscodeshift/dist/testUtils").applyTransform;

const checkpointToDb = require("./transforms/checkpoint-to-db");
const paramsToProps = require("./transforms/params-to-props");
const authsToAuth = require("./transforms/auths-to-auth");
const programToExpression = require("./transforms/program-to-expression");
const namedExportToDollarExport = require("./transforms/named-export-to-dollar-export");


function legacyToComponentCode(source) {
  let output = source;
  output = applyTransform(checkpointToDb, {}, { source: output });
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