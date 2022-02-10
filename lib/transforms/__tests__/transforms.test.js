jest.autoMockOff();
const { defineInlineTest } = require("../testUtils");

const checkpointToDbSet = require("../checkpoint-to-db-set");
const checkpointToDbGet = require("../checkpoint-to-db-get");
const paramsToProps = require("../params-to-props");
const authsToAuth = require("../auths-to-auth");
const programToExpression = require("../program-to-expression");
const namedExportToDollarExport = require("../named-export-to-dollar-export");
const sendToDotSend = require("../send-to-dot-send");
const respondToDotRespond = require("../respond-to-dot-respond");
const endToFlowExit = require("../end-to-flow-exit");
const pipedreamhqToPipedream = require("../pipedreamhq-to-pipedream");
const axiosThisToDollar = require("../axios-this-to-dollar");
const removeUnusedAxios = require("../remove-unused-axios");
const undefAssignmentToDeclaration = require("../undef-assignment-to-declaration");
const removeEmptyObject = require("../remove-empty-object");
const snakeToCamelCase = require("../snake-to-camel-case");
const cjsToEsm = require("../cjs-to-esm");


describe("params-to-props", () => {
  defineInlineTest(paramsToProps, {},
    "const foo = params.bar;",
    "const foo = this.bar;",
    "transforms `params.__a` to `this.__a`"
  );
  defineInlineTest(paramsToProps, {},
    "const { foo } = params;",
    "const { foo } = this;",
    "transforms `{ foo } = params` to `{ foo } = this"
  );
});

describe("auths-to-auth", () => {
  defineInlineTest(authsToAuth, {},
    "const { auth_key } = auths.github;",
    "const { auth_key } = this.github.$auth;",
    "transforms `auths.__a` to `this.__a.$auth`"
  );
  defineInlineTest(authsToAuth, {},
    "const { github } = auths;",
    "const github = this.github.$auth;",
    "transforms `{ __a } = auths` to `__a = this.__a.$auth;"
  );
});

describe("named-to-dollar-export", () => {
  defineInlineTest(namedExportToDollarExport, {},
    "this.foo = \"bar\";",
    "$.export(\"foo\", \"bar\");",
    "transforms `this.__a = __b` to `$.export(\"__a\", __b)`"
  );
});

describe("program-to-expression", () => {
  defineInlineTest(programToExpression, {},
    "async (params, auths) => { const foo = \"bar\"; }",
    "{ const foo = \"bar\"; }",
    "transforms program to an expression",
    false,
  );
});

describe("send-to-dot-send", () => {
  defineInlineTest(checkpointToDbSet, {},
    "this.$checkpoint = { foo: \"bar\" }",
    "this.db.set(\"$checkpoint\", { foo: \"bar\" })",
    "transforms `this.$checkpoint = __a` to `this.db.set(\"$checkpoint\", __a)`"
  );
});

describe("checkpoint-to-db-get", () => {
  defineInlineTest(checkpointToDbGet, {},
    "const foo = this.$checkpoint",
    "const foo = this.db.get(\"$checkpoint\")",
    "transforms `this.$checkpoint` to `this.db.get(\"$checkpoint\")`"
  );
});

describe("send-to-dot-send", () => {
  defineInlineTest(sendToDotSend, {},
    "$send({ foo: \"bar\" })",
    "$.send({ foo: \"bar\" })",
    "transforms `$send` to `$.send`"
  );
});

describe("respond-to-dot-respond", () => {
  defineInlineTest(respondToDotRespond, {},
    "$respond({ foo: \"bar\" })",
    "$.respond({ foo: \"bar\" })",
    "transforms `$respond` to `$.respond`"
  );
});

describe("end-to-flow-exit", () => {
  defineInlineTest(endToFlowExit, {},
    "$end({ foo: \"bar\" })",
    "$.flow.exit({ foo: \"bar\" })",
    "transforms `$end` to `$.flow.exit`"
  );
});

describe("pipedreamhq-to-pipedream", () => {
  defineInlineTest(pipedreamhqToPipedream, {},
    "require(\"@pipedreamhq/platform\")",
    "require(\"@pipedream/platform\")",
    "transforms `require(\"@pipedreamhq/platform\"))` to `require(\"@pipedream/platform\"))`"
  );
});

describe("axios-this-dollar", () => {
  defineInlineTest(axiosThisToDollar, {},
    "axios(this, { foo: \"bar\" })",
    "axios($, { foo: \"bar\" })",
    "transforms `axios(this, __a)` to `axios($, __a)`"
  );
  defineInlineTest(axiosThisToDollar, {},
    "require(\"@pipedream/platform\").axios(this, { foo: \"bar\" })",
    "require(\"@pipedream/platform\").axios($, { foo: \"bar\" })",
    "transforms `.axios(this, __a)` to `.axios($, __a)`"
  );
});

describe("remove-unused-axios", () => {
  defineInlineTest(removeUnusedAxios, {},
    "const axios = require(\"axios\")",
    "",
    "removes `const axios = require(\"axios\")`"
  );
  defineInlineTest(removeUnusedAxios, {},
    "const foo = require(\"bar\")",
    "const foo = require(\"bar\")",
    "doesn't remove `const foo = require(\"bar\")`"
  );
});

describe("undef-assignment-to-declaration", () => {
  defineInlineTest(undefAssignmentToDeclaration, {},
    "  foo = \"bar\";",
    "  let foo = \"bar\";",
    "transforms undefined variable assignment to declaration"
  );
  defineInlineTest(undefAssignmentToDeclaration, {}, `
  foo = "bar";
  foo = 5;`,
  `  let foo = "bar";
  foo = 5;`,
  "converts only first variable assignment to declaration"
  );
});

describe("remove-empty-object", () => {
  defineInlineTest(removeEmptyObject, {},
    "function run({}) {}",
    "function run() {}",
    "removes empty object function parameter from function declaration"
  );
  defineInlineTest(removeEmptyObject, {},
    "return { async run({}) {} };",
    "return { async run() {} };",
    "removes empty object function parameter from function expression",
    false,
  );
  defineInlineTest(removeEmptyObject, {},
    "function run({ foo }) {}",
    "function run({ foo }) {}",
    "doesn't remove filled object function parameter"
  );
});

describe("snake-to-camel-case", () => {
  defineInlineTest(snakeToCamelCase, {},
    "const foo_bar = 5;",
    "const fooBar = 5;",
    "converts snake case variable to camelCase"
  );
  defineInlineTest(snakeToCamelCase, {},
    "const foo_bar = 5; const obj = { foo_bar };",
    "const fooBar = 5; const obj = { foo_bar: fooBar };",
    "converts occurrences of snake case variable to camelCase"
  );
  defineInlineTest(snakeToCamelCase, {},
    "const obj = { foo_bar: 5 };",
    "const obj = { foo_bar: 5 };",
    "doesn't converts snake case property to camelCase"
  );
});

describe("cjs-to-esm", () => {
  defineInlineTest(cjsToEsm, {},
    "module.exports = {};",
    "export default {};",
    "transforms `module.exports =` to `export default`",
    false,
  );
  defineInlineTest(cjsToEsm, {},
    "require(\"foo\").bar();",
    "import { bar } from \"foo\";\nbar();",
    "transforms require with member call expression to import and call expression",
    false
  );
  defineInlineTest(cjsToEsm, {},
    "const bar = require(\"foo\");",
    "import bar from \"foo\";",
    "transforms require variable declaration to default import declaration",
    false
  );
  defineInlineTest(cjsToEsm, {},
    "const { bar } = require(\"foo\");",
    "import { bar } from \"foo\";",
    "transforms require object declaration to object import declaration",
    false
  );
  defineInlineTest(cjsToEsm, {},
    "require(\"foo\").bar();require(\"foo\").bar();",
    "import { bar } from \"foo\";\nbar();bar();",
    "transforms require object declaration to object import declaration only once",
    false
  );
  defineInlineTest(cjsToEsm, {},
    "const foo = require(\"axios\").default;",
    "import axiosModule from \"axios\";\nconst foo = axiosModule.default;",
    "transforms `require(\"foo\").default` to `fooModule.default` and `import fooModule from \"foo\"`",
    false
  );
});