return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `https://api.segment.io/v1/alias`,
  auth: {
    username: auths.segment.write_key,
  },
  data: {
    context: params.context,
    integrations: params.integrations,
    previousId: params.previousId,
    timestamp: params.timestamp,
    userId: params.userId,
  },
})