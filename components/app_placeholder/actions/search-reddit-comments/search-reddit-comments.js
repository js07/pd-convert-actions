const options = {
  url: `https://api.pushshift.io/reddit/search/comment/`,
  method: 'get',
  params: {
    q: params.q,
    ids: params.ids,
    size: params.size,
    fields: params.fields,  
    sort: params.sort,
    sort_type: params.sort_type,
    aggs: params.aggs,
    author: params.author,
    subreddit: params.subreddit,
    after: params.after,
    before: params.before,
    frequency: params.frequency,
    metadata: params.metadata
  }
}

return (await require("@pipedreamhq/platform").axios(this, options)).data