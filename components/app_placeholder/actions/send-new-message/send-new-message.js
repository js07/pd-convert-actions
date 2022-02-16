return await require("@pipedreamhq/platform").axios(this, {
  url: `https://api2.frontapp.com/channels/${params.channel_id}/messages`,
  params: {
    author_id: params.author_id,
    sender_name: params.sender_name,
    subject: params.subject,
    body: params.body,
    text: params.text	,
    attachments: params.attachments,
    options: params.options,
    options_tags: params.options_tags,
    options_archive: params.options_archive,
    to: params.to,
    cc: params.cc,
    bcc: params.bcc,
  },
})