import { defineInlineTest } from "../testUtils.js";

import paramsToProps from "../params-to-props.js";
import authsToAuth from "../auths-to-auth.js";
import programToExpression from "../program-to-expression.js";
import sendToDotSend from "../send-to-dot-send.js";
import respondToDotRespond from "../respond-to-dot-respond.js";
import endToFlowExit from "../end-to-flow-exit.js";
import pipedreamhqToPipedream from "../pipedreamhq-to-pipedream.js";
import axiosThisToDollar from "../axios-this-to-dollar.js";
import removeUnusedAxios from "../remove-unused-axios.js";
import undefAssignmentToDeclaration from "../undef-assignment-to-declaration.js";
import removeEmptyObject from "../remove-empty-object.js";
import snakeToCamelCase from "../snake-to-camel-case.js";
import cjsToEsm from "../cjs-to-esm.js";
import attachmentsToStepsAttachments from "../attachments-to-steps-attachments.js";
import eventToStepsEvent from "../event-to-steps-event.js";
import workflowCheckpointToDataStore from "../workflow-checkpoint-to-data_store.js";
import namedExportToDollarExport from "../named-export-to-dollar-export.js";
import stepCheckpointToDataStore from "../step-checkpoint-to-data_store.js";
import { uniqueId } from "../../util.js";

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
  const mockUniqueId = uniqueId();
  
  // $.export is done in finally clause of try/finally
  defineInlineTest(namedExportToDollarExport, {},
    "this.foo = \"bar\";", 
    `
      let foo;

      try {
        foo = "bar";
      } finally {
        $.export("foo", foo);
      }
    `,
    "transforms `this.__a = __b` to `let __a; try { __a = __b } finally { $.export(\"__a\", __a) }`",
    { formatCode: true }
  );

  defineInlineTest(namedExportToDollarExport, {}, `
    this.foo = "bar";
    const foo = "asdf"`,
  `
    let foo_${mockUniqueId};

    try {
      foo_${mockUniqueId} = "bar";
      const foo = "asdf"
    } finally {
      $.export("foo", foo_${mockUniqueId});
    }
  `,
  "transforms `this.__a = __b; const __a;` to `let __a_uniqueId; try { __a_uniqueId = __b; const __a; } finally { $.export(\"__a\", __a_uniqueId) }`",
  { formatCode: true }
  );

  defineInlineTest(namedExportToDollarExport, {}, `
    this.foo = [];
    this.foo.push(123);`,
  `
    let foo;

    try {
      foo = [];
      foo.push(123);
    } finally {
      $.export("foo", foo);
    }
  `,
  "transforms `this.__a = []; this.__a.push(123)` to `let __a; try { __a = []; __a.push(123); } finally { $.export(\"__a\", __a) }`",
  { formatCode: true }
  );
});

describe("program-to-expression", () => {
  defineInlineTest(programToExpression, {},
    "async (params, auths) => { const foo = \"bar\"; }",
    "{ const foo = \"bar\"; }",
    "transforms program to an expression",
    { wrapCode: false },
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
    { wrapCode: false },
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
    "export default {};",
    "export default {};",
    "transforms `module.exports =` to `export default`",
    { wrapCode: false },
  );
  defineInlineTest(cjsToEsm, {},
    "require(\"foo\").bar();",
    "import { bar } from \"foo\";\nbar();",
    "transforms require with member call expression to import and call expression",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    "const bar = require(\"foo\");",
    "import bar from \"foo\";",
    "transforms require variable declaration to default import declaration",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    "const { bar } = require(\"foo\");",
    "import { bar } from \"foo\";",
    "transforms require object declaration to object import declaration",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    "require(\"foo\").bar();require(\"foo\").bar();",
    "import { bar } from \"foo\";\nbar();bar();",
    "transforms require object declaration to object import declaration only once",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    "const foo = require(\"axios\").default;",
    "import axiosModule from \"axios\";\nconst foo = axiosModule.default;",
    "transforms `require(\"foo\").default` to `fooModule.default` and `import fooModule from \"foo\"`",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    "require(\"foo-bar\")(5);",
    "import fooBar from \"foo-bar\";\nfooBar(5);",
    "transforms `require(\"foo-bar\")(5)` to `fooBar(5)` and `import fooBar from \"foo-bar\"`",
    { wrapCode: false }
  );
  defineInlineTest(cjsToEsm, {},
    `require("foo-bar")(5);
      const fooBar = "hello world";
      console.log(fooBar);
    `,
    `import fooBarModule from "foo-bar";
      fooBarModule(5);
      const fooBar = "hello world";
      console.log(fooBar);
    `,
    "Renames import default specifier to avoid var name conflict",
    { wrapCode: false, formatCode: true }
  );
  defineInlineTest(cjsToEsm, {},
    `const bar = "hello world";
      require("foo").bar(5);
      console.log(bar);
    `,
    `import { bar as fooBar } from "foo";
      const bar = "hello world";
      fooBar(5);
      console.log(bar);
    `,
    "Renames import specifier to avoid name conflict",
    { wrapCode: false, formatCode: true }
  );
});

describe("attachments-to-steps-attachments", () => {
  defineInlineTest(attachmentsToStepsAttachments, {},
    "$attachments[\"test.csv\"]",
    "steps.trigger.context.attachments[\"test.csv\"]",
    "transforms `$attachments[\"test.csv\"]` to `steps.trigger.context.attachments[\"test.csv\"]`",
  );
  defineInlineTest(attachmentsToStepsAttachments, {},
    "fs.readFileSync($attachments[\"test.csv\"]).toString();",
    "fs.readFileSync(steps.trigger.context.attachments[\"test.csv\"]).toString();",
    "transforms `$attachments` to `steps.trigger.context.attachments` in call expression",
  );
  defineInlineTest(attachmentsToStepsAttachments, {},
    "foo.$attachments[\"test.csv\"];",
    "foo.$attachments[\"test.csv\"];",
    "doesn't transform `foo.$attachments` to `foo.steps.trigger.context.attachments`",
  );
});

describe("event-to-steps-event", () => {
  defineInlineTest(eventToStepsEvent, {},
    "event",
    "steps.trigger.event",
    "transforms `event` to `steps.trigger.event`",
  );
  defineInlineTest(eventToStepsEvent, {},
    "event.foo",
    "steps.trigger.event.foo",
    "transforms `event.foo` to `steps.trigger.event.foo`",
  );
  defineInlineTest(eventToStepsEvent, {},
    "foo.event",
    "foo.event",
    "doesn't transform `foo.event` to `foo.steps.trigger.event`",
  );
});

describe("step-checkpoint-to-data_store", () => {
  const mockUniqueId = uniqueId();

  defineInlineTest(stepCheckpointToDataStore, {},
    "this.$checkpoint = 5",
    `let stepCheckpoint = await this.db.get("scp_${mockUniqueId}");

      try {
        stepCheckpoint = 5;
      } finally {
        await this.db.set("scp_${mockUniqueId}", stepCheckpoint);
      }
    `,
    "transforms `this.$checkpoint` assignment to get and set from data_store in try...finally",
    { formatCode: true }
  );

  defineInlineTest(stepCheckpointToDataStore, {},
    "const foo = this.$checkpoint",
    `let stepCheckpoint = await this.db.get("scp_${mockUniqueId}");

      try {
        const foo = stepCheckpoint;
      } finally {
        await this.db.set("scp_${mockUniqueId}", stepCheckpoint);
      }
    `,
    "transforms `this.$checkpoint` even when `this.$checkpoint` is not assigned to",
    { formatCode: true }
  );
});

describe("workflow-checkpoint-to-data_store", () => {
  defineInlineTest(workflowCheckpointToDataStore, {},
    "$checkpoint = 5",
    `let $checkpoint = await this.db.get("$checkpoint");

      try {
        $checkpoint = 5;
      } finally {
        await this.db.set("$checkpoint", $checkpoint);
      }
    `,
    "transforms `$checkpoint` assignment to get and set from data_store in try...finally",
    { formatCode: true }
  );

  defineInlineTest(workflowCheckpointToDataStore, {},
    "const foo = $checkpoint",
    `let $checkpoint = await this.db.get("$checkpoint");

      try {
        const foo = $checkpoint;
      } finally {
        await this.db.set("$checkpoint", $checkpoint);
      }
    `,
    "transforms `$checkpoint` even when `$checkpoint` is not assigned to",
    { formatCode: true }
  );
});