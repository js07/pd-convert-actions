return await require("@pipedreamhq/platform").axios(this, {
  method: "POST",
  url: `https://api.sendpulse.com/blacklist`,
  headers: {
    Authorization: `Bearer ${auths.sendpulse.oauth_access_token}`,
  },
  data: {
    id: params.id,
    emails: params.emails,
  }
})