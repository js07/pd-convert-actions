return await require("@pipedreamhq/platform").axios(this, {
  url: `https://mandrillapp.com/api/1.0/messages/send.json`,
  data: {
    key: auths.mandrill.api_key,
    message: {
      html: params.html,
      text: params.text,
      subject: params.subject,
      from_email: params.from_email,
      from_name: params.from_name,
      to: [{
        email: params.email,
        name: params.name,
        type: params.type || "to",
      }]
    }
  }
})