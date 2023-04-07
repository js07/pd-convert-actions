import { applyTransforms } from "./transforms/testUtils.js";

import checkpointToDbSet from "./transforms/checkpoint-to-db-set.js";
import checkpointToDbGet from "./transforms/checkpoint-to-db-get.js";
import paramsToProps from "./transforms/params-to-props.js";
import authsToAuth from "./transforms/auths-to-auth.js";
import programToExpression from "./transforms/program-to-expression.js";
import namedExportToDollarExport from "./transforms/named-export-to-dollar-export.js";
import sendToDotSend from "./transforms/send-to-dot-send.js";
import respondToDotRespond from "./transforms/respond-to-dot-respond.js";
import endToFlowExit from "./transforms/end-to-flow-exit.js";
import pipedreamHQtoPipedream from "./transforms/pipedreamhq-to-pipedream.js";
import axiosThisToDollar from "./transforms/axios-this-to-dollar.js";
import removeUnusedAxios from "./transforms/remove-unused-axios.js";
import attachmentsToStepsAttachments from "./transforms/attachments-to-steps-attachments.js";
import eventToStepsEvent from "./transforms/event-to-steps-event.js";


function legacyToComponentCode(source) {
  return applyTransforms(source, [
    checkpointToDbSet,
    checkpointToDbGet,
    sendToDotSend,
    respondToDotRespond,
    endToFlowExit,
    namedExportToDollarExport,
    attachmentsToStepsAttachments,
    paramsToProps,
    eventToStepsEvent,
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

export default transform;