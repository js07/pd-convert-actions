const data = {
  image_file: params.image_file,
  image_file_b64: params.image_file_b64,
  image_url: params.image_url,
  size: params.size,
  type: params.type,
  format: params.format,
  roi: params.roi,
  crop: params.crop,
  crop_margin: params.crop_margin,
  scale: params.scale,
  position: params.position,
  channels: params.channels,
  add_shadow: params.add_shadow,
  bg_color: params.bg_color,
  bg_image_url: params.bg_image_url,
  bg_image_file: params.bg_image_file,
}
const config = {
  method: "post",
  url: `https://api.remove.bg/v1.0/removebg`,
  headers: {
    "X-API-Key": `${auths.remove_bg.api_key}`,
    "Accept": `application/json`,
  },
  data,
}
return await require("@pipedreamhq/platform").axios(this, config)