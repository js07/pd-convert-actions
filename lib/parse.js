import getAuths from "./getters/auths.js";
import getCheckpointAssignments from "./getters/checkpoint-assignments.js";
import getCheckpointExpressions from "./getters/checkpoint-expressions.js";

function parse(source) {
  const checkpointAssignments = getCheckpointAssignments({ source });
  const checkpointExpressions = getCheckpointExpressions({ source });
  const auths = getAuths({ source });
  return {
    checkpoints: [...checkpointAssignments, ...checkpointExpressions],
    auths,
  };
}

export default parse;