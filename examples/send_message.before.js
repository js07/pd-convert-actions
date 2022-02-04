// See https://app.chat-api.com/docs#sendMessage

return await require("@pipedreamhq/platform").axios(this, {
  method: 'post',
  url: `${auths.chat_api_for_whatsapp.api_url}/sendMessage?token=${auths.chat_api_for_whatsapp.token}`,
  data: {
    phone: params.phone,
    body: params.body
  },
})