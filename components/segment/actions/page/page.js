return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `https://api.segment.io/v1/page`,
  auth: {
    username: auths.segment.write_key,
  },
  data: {
    anonymousId: params.anonymousId,
    context: params.context,
    integrations: params.integrations,
    name: params.name,
    properties: params.properties,
    timestamp: params.timestamp,
    userId: params.userId,
  },
})