const config = {
  url: `http://api.pathofexile.com/league/${params.id}`,
  params: {
    realm: params.realm || "pc",
    ladder: params.ladder || "0",
    ladderLimit: params.ladderLimit || 20,
    ladderOffset: params.ladderOffset || 0,
    ladderTrack: params.ladderTrack,
  }
}
return await require("@pipedreamhq/platform").axios(this, config)