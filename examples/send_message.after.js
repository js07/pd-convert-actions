module.exports = {
  key: "chat_api_for_whatsapp-send_message",
  name: "Send Message",
  description: "Send a message to a new or existing chat.",
  version: "0.0.1",
  type: "action",
  props: {
    chat_api_for_whatsapp: {
      type: "app",
      app: "chat_api_for_whatsapp",
    },
    phone: {
      type: "string",
    },
    body: {
      type: "string",
    },
  },
  async run({ $ }) {
  // See https://app.chat-api.com/docs#sendMessage

    return await require("@pipedreamhq/platform").axios(this, {
      method: "post",
      url: `${this.chat_api_for_whatsapp.$auth.api_url}/sendMessage?token=${this.chat_api_for_whatsapp.$auth.token}`,
      data: {
        phone: this.phone,
        body: this.body,
      },
    });
  },
};
