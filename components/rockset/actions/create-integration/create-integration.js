const data = {
  "name": params.name,
  "description": params.description,
  "s3": params.s3,
  "kinesis": params.kinesis,
  "dynamodb": params.dynamodb,
  "redshift": params.redshift,
  "gcs": params.gcs,
  "segment": params.segment,
  "kafka": params.kafka
}

return await require("@pipedreamhq/platform").axios(this, {
  method: "POST",
  url: `https://api.rs2.usw2.rockset.com/v1/orgs/self/integrations`,
  headers: {
    "Authorization": `ApiKey ${auths.rockset.apikey}`,
  },
  data
})