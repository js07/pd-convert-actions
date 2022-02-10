return await require("@pipedreamhq/platform").axios(this, {
  url: `https://api.sendpulse.com/emails/${params.email}`,
  headers: {
    Authorization: `Bearer ${auths.sendpulse.oauth_access_token}`,
  },
})