return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `https://api.segment.io/v1/group`,
  auth: {
    username: auths.segment.write_key,
  },
  data: {
    anonymousId: params.anonymousId,
    context: params.context,
    groupId: params.groupId,
    integrations: params.integrations,
    timestamp: params.timestamp,
    traits: params.traits,
    userId: params.userId,
  },
})