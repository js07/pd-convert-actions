const config = {
  url: "http://api.pathofexile.com/public-stash-tabs/",
  params: {
    id: params.id,
  }
}
return await require("@pipedreamhq/platform").axios(this, config)