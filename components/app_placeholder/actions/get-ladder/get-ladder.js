const config = {
  url: `http://api.pathofexile.com/ladders/${params.id}`,
  params: {
    realm: params.realm || "pc",
    limit: params.limit || 20,
    offset: params.offset || 0,
    type: params.type || "league",
    track: params.track || true,
    accountName: params.accountName,
    difficulty: params.difficulty,
    start: params.start,
  }
}
return await require("@pipedreamhq/platform").axios(this, config)