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