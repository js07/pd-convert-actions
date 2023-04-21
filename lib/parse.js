import getAuths from "./getters/auths.js";
import getParams from "./getters/params.js";
import getCheckpointAssignments from "./getters/checkpoint-assignments.js";
import getCheckpointExpressions from "./getters/checkpoint-expressions.js";
import getWorkflowCheckpoints from "./getters/workflow-checkpoints.js";

function parse(source) {
  const checkpointAssignments = getCheckpointAssignments({ source });
  const checkpointExpressions = getCheckpointExpressions({ source });
  const workflowCheckpoints = getWorkflowCheckpoints({ source });
  const auths = getAuths({ source });
  const params = getParams({ source });
  return {
    checkpoints: [...checkpointAssignments, ...checkpointExpressions, ...workflowCheckpoints],
    auths,
    params,
  };
}

export default parse;