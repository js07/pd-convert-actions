const axios = require('axios')

list_id = params.list_id
subscriber_hash = params.subscriber_hash
skip_merge_validation = params.skip_merge_validation

return await require("@pipedreamhq/platform").axios(this, {
  url: `https://${auths.mailchimp.dc}.api.mailchimp.com/3.0/lists/${list_id}/members/${subscriber_hash}?skip_merge_validation=${skip_merge_validation}`,
  headers: {
    Authorization: `Bearer ${auths.mailchimp.oauth_access_token}`,
  },
  method: 'PUT',
  data: {
      "email_address": params.email_address,
      "status_if_new": params.statu_if_new,
      "email_type": params.email_type,
      "status": params.status,
      "merge_fields": params.merge_fields,
      "interests": params.interests,
      "language": params.language,
      "vip": params.vip,
      "location": {
        "latitude": params.latitude,
        "longitude": params.longitude
      },
      "marketing_permissions": [{
        "marketing_permission_id": params.marketing_permission_id,
        "enabled": params.marketing_permissions_enabled
      }],
      "ip_signup": params.ip_signup,
      "timestamp_signup": params.timestamp_signup,
      "ip_opt": params.ip_opt,
      "timestamp_opt": params.timestamp_opt
  }
})