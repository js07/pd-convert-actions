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