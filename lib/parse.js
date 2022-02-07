const getAuths = require("./getters/auths");
const getCheckpointAssignments = require("./getters/checkpoint-assignments");
const getCheckpointExpressions = require("./getters/checkpoint-expressions");

function parse(source) {
  const checkpointAssignments = getCheckpointAssignments({ source });
  const checkpointExpressions = getCheckpointExpressions({ source });
  const auths = getAuths({ source });
  return {
    checkpoints: [...checkpointAssignments, ...checkpointExpressions],
    auths,
  };
}

module.exports = parse;