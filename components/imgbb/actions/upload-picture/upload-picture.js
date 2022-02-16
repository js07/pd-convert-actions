const data = {
  image: params.image,
  name: params.name,
}
const config = {
  method: "post",
  url: `https://api.imgbb.com/1/upload?key=${auths.imgbb.api_key}`,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  data: require("qs").stringify(data),
}
return await require("@pipedreamhq/platform").axios(this, config)