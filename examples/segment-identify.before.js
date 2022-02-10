return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `https://api.segment.io/v1/identify`,
  auth: {
    username: auths.segment.write_key,
  },
  data: {
    anonymousId: params.anonymousId,
    context: params.context,
    integrations: params.integrations,
    timestamp: params.timestamp,
    traits: params.traits,
    userId: params.userId,
  },
})