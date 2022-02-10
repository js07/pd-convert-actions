const config = {
  url: `https://api.ipdata.co/time_zone/${params.ip_address}?api-key=${auths.ipdata_co.api_key}`,
}
return await require("@pipedreamhq/platform").axios(this, config)