const data = {
  "name": params.name
}

return await require("@pipedreamhq/platform").axios(this, {
  method: "POST",
  url: `https://api.rs2.usw2.rockset.com/v1/orgs/self/users/self/apikeys`,
  headers: {
    "Authorization": `ApiKey ${auths.rockset.apikey}`,
  },
  data
})