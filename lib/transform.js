const { applyTransforms } = require("./transforms/testUtils");

const checkpointToDbSet = require("./transforms/checkpoint-to-db-set");
const checkpointToDbGet = require("./transforms/checkpoint-to-db-get");
const paramsToProps = require("./transforms/params-to-props");
const authsToAuth = require("./transforms/auths-to-auth");
const programToExpression = require("./transforms/program-to-expression");
const namedExportToDollarExport = require("./transforms/named-export-to-dollar-export");
const sendToDotSend = require("./transforms/send-to-dot-send");
const respondToDotRespond = require("./transforms/respond-to-dot-respond");
const endToFlowExit = require("./transforms/end-to-flow-exit");
const pipedreamHQtoPipedream = require("./transforms/pipedreamhq-to-pipedream");
const axiosThisToDollar = require("./transforms/axios-this-to-dollar");
const removeUnusedAxios = require("./transforms/remove-unused-axios");


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
    pipedreamHQtoPipedream,
    axiosThisToDollar,
    removeUnusedAxios,
    programToExpression
  ]);
}

function transform(source) {
  return legacyToComponentCode(source);
}

module.exports = transform;