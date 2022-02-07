const getAuths = require("./getters/auths");
const getCheckpoints = require("./getters/checkpoints");

function parse(source) {
  const checkpoints = getCheckpoints({ source });
  const auths = getAuths({ source });
  return {
    checkpoints,
    auths,
  };
}

module.exports = parse;