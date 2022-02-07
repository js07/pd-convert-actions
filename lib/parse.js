const getAuths = require("./getters/auths");
const getCheckpoints = require("./getters/checkpoints");

// function getAppProps(source) {
//   const appNames = getAuths({ source });
// }

// function getCheckpoints(source) {
//   const checkpoints = getCheckpoints({ source });
//   return checkpoints;
// }

function parse(source) {
  const checkpoints = getCheckpoints({ source });
  console.log("checkpoints", checkpoints);
  const auths = getAuths({ source });
  return {
    checkpoints,
    auths,
  };
}

module.exports = parse;