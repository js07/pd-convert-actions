const data = {
  "data": params.data
}

return await require("@pipedreamhq/platform").axios(this, {
  method: "POST",
  url: `https://api.rs2.usw2.rockset.com/v1/orgs/self/ws/${params.workspace}/collections/${params.collection}/docs
`,
  headers: {
    "Authorization": `ApiKey ${auths.rockset.apikey}`,
  },
  data
})