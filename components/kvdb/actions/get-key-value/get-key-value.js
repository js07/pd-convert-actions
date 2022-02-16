const config = {
  url: `https://kvdb.io/${auths.kvdb.api_key}/${params.key}`
}
return await require("@pipedreamhq/platform").axios(this, config)