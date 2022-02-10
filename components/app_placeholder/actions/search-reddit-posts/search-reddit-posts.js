const options = {
  url: `https://api.pushshift.io/reddit/search/submission/`,
  method: 'get',
  params: {
    ids: params.ids,
    q: params.q,
    'q:not': params['q:not'],
    title: params.title,
    'title:not': params['title:not'],
    selftext: params.selftext,
    'selftext:not': params['selftext:not'],
    size: params.size,
    fields: params.fields,
    sort: params.sort,
    sort_type: params.sort_type,
    aggs: params.aggs,
    author: params.author,
    subreddit: params.subreddit,
    after: params.after,
    before: params.before,
    score: params.score,
    num_comments: params.num_comments,
    over_18: params.over_18,
    is_video: params.is_video,
    locked: params.locked,
    stickied: params.stickied,
    spoiler: params.spoiler,
    content_mode: params.content_mode,
    frequency: params.frequency,
    metadata: params.metadata
  }
}

return (await require("@pipedreamhq/platform").axios(this, options)).data