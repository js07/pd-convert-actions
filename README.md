
# Usage
<!-- usage -->
## CLI
Clone repo
```
git clone https://github.com/js07/pd-convert-actions.git
```
Install dependencies
```
cd pd-convert-actions
npm install
```
Run CLI
```sh-session
$ node bin/cli.js ./test/data/actions.csv
? Output as separate javascript files or a single CSV file? JavaScript
? Path to components directory to write files to ./test/output
? Wrap the component with `defineComponent()`? No
? Generate labels for component props? No
? Convert generated component to ESM? (Y/n)
```

### CLI Options
```
USAGE
  $ bin/cli.js FILE

ARGUMENTS
  FILE  csv file containing legacy action configs

OPTIONS
  --outputType=js/csv      Output actions as a csv file or js files
  --out                    CSV output path
  --componentsDirPath      Path to components directory to write js files
  --defineComponent        Wrap the component with defineComponent()
  --createLabel            Generate labels for component props
  --[no-]toEsm             Convert generated component to ESM (default: Yes)
```

## Lib

Install
```
npm install https://github.com/js07/pd-convert-actions
```

Convert action
```js
const convert = require("pd-convert-actions");
const actionConfig = {
  code: "raw legacy action code;",
  title: "Title/Name of the action",
  description: "Description of the action",
  namespace: "component_slug",
  codeConfig: "{ params_schema: { ... } }",
  versionMajor: "0",
  versionMinor: "2",
  hashId: "a_67imr8"
};
const {
  code,
  appSlug,
  componentSlug,
} = await convert(actionConfig);
```

# Conversions

Config
- params_schema -> props
- DEFAULT_NAMESPACE -> component_slug
- version `<Major>.<minor>` -> `<Major>.<minor>.1`
- TITLE -> name

Code
- `this.$checkpoint =` -> `$.db.set("$checkpoint",` (+ `db` prop)
- `this.$checkpoint` -> `$.db.get("$checkpoint")` (+ `db` prop)
- `$send` -> `$.send`
- `$respond` -> `$.respond`
- `$end` -> `$.flow.exit`
- `params` -> `this`
- `auths.app_name` -> `this.app_name.$auth` (+ `app_name` prop)
- `require("@pipedreamhq/platform")` -> require("@pipedream/platform")
- `.axios(this,` -> `.axios($,`

Fixes
- Remove unused `const axios = require("axios")`
- [Replace byte character with `'`](https://github.com/js07/pd-convert-actions/pull/23)
- Adds declarator for undeclared variables (eslint no-undef)
- Removes unused variables (eslint no-unused-var)
- Converts variables to camelCase (eslint camelcase)
- Converts code from CommonJS to ESModules
- Fix eslint-fixable eslint errors

# Examples
###### _Created with v0.3.0_

The __[examples](./examples)__ directory contains examples of converted actions, in addition to the ones below. Action config can be found in __[actions.csv](./test/data/actions.csv)__.

`segment-track`

**Before**
```js
return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `https://api.segment.io/v1/track`,
  auth: {
    username: auths.segment.write_key,
  },
  data: {
    anonymousId: params.anonymousId,
    context: params.context,
    event: params.event,
    integrations: params.integrations,
    properties: params.properties,
    timestamp: params.timestamp,
    userId: params.userId,
  },
})
```
**After**
```js
// legacy_hash_id: "a_2wim5R"
module.exports = {
  key: "segment-track",
  name: "Track actions your users perform",
  description: "Track lets you record the actions your users perform (note requires userId or anonymousId)",
  version: "0.3.1",
  type: "action",
  props: {
    segment: {
      type: "app",
      app: "segment",
    },
    anonymousId: {
      type: "string",
      description: "A pseudo-unique substitute for a User ID, for cases when you don't have an absolutely unique identifier. A userId or an anonymousId is required.",
      optional: true,
    },
    context: {
      type: "object",
      description: "Dictionary of extra information that provides useful context about a message, but is not directly related to the API call like ip address or locale",
      optional: true,
    },
    event: {
      type: "string",
      description: "Name of the action that a user has performed.",
    },
    integrations: {
      type: "object",
      description: "Dictionary of destinations to either enable or disable",
      optional: true,
    },
    properties: {
      type: "object",
      description: "\tFree-form dictionary of properties of the event, like revenue",
      optional: true,
    },
    timestamp: {
      type: "string",
      description: "ISO-8601 date string",
      optional: true,
    },
    userId: {
      type: "string",
      description: "Unique identifier for the user in your database. A userId or an anonymousId is required.",
      optional: true,
    },
  },
  async run({ $ }) {
    return await require("@pipedream/platform").axios($, {
      method: "post",
      url: "https://api.segment.io/v1/track",
      auth: {
        username: this.segment.$auth.write_key,
      },
      data: {
        anonymousId: this.anonymousId,
        context: this.context,
        event: this.event,
        integrations: this.integrations,
        properties: this.properties,
        timestamp: this.timestamp,
        userId: this.userId,
      },
    });
  },
};
```

`mailchimp-add_or_update_subscriber`

**Before**
```js
const axios = require('axios')

list_id = params.list_id
subscriber_hash = params.subscriber_hash
skip_merge_validation = params.skip_merge_validation

return await require("@pipedreamhq/platform").axios(this, {
  url: `https://${auths.mailchimp.dc}.api.mailchimp.com/3.0/lists/${list_id}/members/${subscriber_hash}?skip_merge_validation=${skip_merge_validation}`,
  headers: {
    Authorization: `Bearer ${auths.mailchimp.oauth_access_token}`,
  },
  method: 'PUT',
  data: {
      "email_address": params.email_address,
      "status_if_new": params.statu_if_new,
      "email_type": params.email_type,
      "status": params.status,
      "merge_fields": params.merge_fields,
      "interests": params.interests,
      "language": params.language,
      "vip": params.vip,
      "location": {
        "latitude": params.latitude,
        "longitude": params.longitude
      },
      "marketing_permissions": [{
        "marketing_permission_id": params.marketing_permission_id,
        "enabled": params.marketing_permissions_enabled
      }],
      "ip_signup": params.ip_signup,
      "timestamp_signup": params.timestamp_signup,
      "ip_opt": params.ip_opt,
      "timestamp_opt": params.timestamp_opt
  }
})
```

**After**
```js
// legacy_hash_id: "a_RAiaJ1"
module.exports = {
  key: "mailchimp-add_or_update_subscriber",
  name: "Add or Update Subscriber",
  description: "Adds a new subscriber to an audience or updates existing subscriber.",
  version: "0.2.1",
  type: "action",
  props: {
    mailchimp: {
      type: "app",
      app: "mailchimp",
    },
    list_id: {
      type: "string",
      description: "The unique ID for the list.",
    },
    subscriber_hash: {
      type: "string",
      description: "The MD5 hash of the lowercase version of the list member's email address.",
    },
    skip_merge_validation: {
      type: "boolean",
      description: "If skip_merge_validation is true, member data will be accepted without merge field values, even if the merge field is usually required. This defaults to False.",
      optional: true,
    },
    email_address: {
      type: "string",
      description: "Email address for a subscriber. This value is required only if the email address is not already present on the list.",
    },
    statu_if_new: {
      type: "string",
      description: "Subscriber's status. This value is required only if the email address is not already present on the list.",
    },
    email_type: {
      type: "string",
      description: "Type of email this member asked to get ('html' or 'text').",
      optional: true,
    },
    status: {
      type: "string",
      description: "Subscriber's current status.",
      optional: true,
    },
    merge_fields: {
      type: "object",
      description: "An individual merge var and value for a member.",
      optional: true,
    },
    interests: {
      type: "object",
      description: "The key of this object's properties is the ID of the interest in question.",
      optional: true,
    },
    language: {
      type: "string",
      description: "If set/detected, the subscriber's language.",
      optional: true,
    },
    vip: {
      type: "boolean",
      description: "VIP status for subscriber.",
      optional: true,
    },
    latitude: {
      type: "integer",
      description: "The location latitude.",
      optional: true,
    },
    longitude: {
      type: "integer",
      description: "The location longitude.",
      optional: true,
    },
    marketing_permission_id: {
      type: "string",
      description: "The id for the marketing permission on the list.",
      optional: true,
    },
    marketing_permissions_enabled: {
      type: "boolean",
      description: "If the subscriber has opted-in to the marketing permission.",
      optional: true,
    },
    ip_signup: {
      type: "string",
      description: "IP address the subscriber signed up from.",
      optional: true,
    },
    timestamp_signup: {
      type: "string",
      description: "The date and time the subscriber signed up for the list in ISO 8601 format.",
      optional: true,
    },
    ip_opt: {
      type: "string",
      description: "The IP address the subscriber used to confirm their opt-in status.",
      optional: true,
    },
    timestamp_opt: {
      type: "string",
      description: "The date and time the subscriber confirmed their opt-in status in ISO 8601 format.",
      optional: true,
    },
  },
  async run({ $ }) {
    let listId = this.list_id;
    let subscriberHash = this.subscriber_hash;
    let skipMergeValidation = this.skip_merge_validation;

    return await require("@pipedream/platform").axios($, {
      url: `https://${this.mailchimp.$auth.dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}?skip_merge_validation=${skipMergeValidation}`,
      headers: {
        Authorization: `Bearer ${this.mailchimp.$auth.oauth_access_token}`,
      },
      method: "PUT",
      data: {
        "email_address": this.email_address,
        "status_if_new": this.statu_if_new,
        "email_type": this.email_type,
        "status": this.status,
        "merge_fields": this.merge_fields,
        "interests": this.interests,
        "language": this.language,
        "vip": this.vip,
        "location": {
          "latitude": this.latitude,
          "longitude": this.longitude,
        },
        "marketing_permissions": [
          {
            "marketing_permission_id": this.marketing_permission_id,
            "enabled": this.marketing_permissions_enabled,
          },
        ],
        "ip_signup": this.ip_signup,
        "timestamp_signup": this.timestamp_signup,
        "ip_opt": this.ip_opt,
        "timestamp_opt": this.timestamp_opt,
      },
    });
  },
};
```
