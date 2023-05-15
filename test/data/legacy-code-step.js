const code = `
// conversion should use data_store prop to get and set the export at the top
// and bottom of the run method
this.someexport = [];
this.someexport.push("asdf");

// $attachments -> step.trigger.context.attachments
fs.readFileSync($attachments["test4.csv"]).toString();

// should become \`const eventData = steps.trigger.event.data\`
const eventData = event.data;
console.log(eventData);

// conversion should use data_store prop to get and set the checkpoint, with a
// (mock) unique id for the step, at the top and bottom of the run method
this.$checkpoint ||= {};
this.$checkpoint["foo"] = 5;

// conversion should use data_store prop to get and set the checkpoint at the
// top and bottom of the run method
$checkpoint ||= {};
$checkpoint["foo"] = 6;

// conversion should have a "myRequiredField" prop
console.log(params.myRequiredField);
// conversion should have a "myOptionalField" prop with optional: true
console.log(params.myOptionalField);

// should become \`return await axios($, {\` when converting to ESM
return await require("@pipedreamhq/platform").axios(this, {
  url: \`https://api.trello.com/1/cards/\`+ steps.nodejs.$return_value,
}, {
  token: {
    // should convert \`auths.trello\` to \`this.trello.$auth\`
    key: auths.trello.oauth_access_token,
    secret: auths.trello.oauth_refresh_token,
  },
  oauthSignerUri: auths.trello.oauth_signer_uri,
})
`

const paramsSchema = {
  "type": "object",
  "properties": {
    "myRequiredField": {
      "type": "string",
      "description": "A required field"
    },
    "myOptionalField": {
      "type": "string",
      "description": "An optional field"
    },
  },
  "required": [
    "myRequiredField",
  ]
};

export default {
  code,
  codeConfig: JSON.stringify({ params_schema: paramsSchema }),
}
