const Tweet = require('../data/Tweet')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    res.render('tweets/add')
  },
  addPost: (req, res) => {
    let tweetObj = req.body
    let userId = req.user.id

    if (tweetObj.content.length > 140) {
      res.locals.globalError = 'Your tweet can not be longer than 140 characters!'
      res.render('tweets/add', tweetObj)
      return
    }

    let tagsArr = parseTags(tweetObj.content)

    Tweet
      .create({
        content: tweetObj.content,
        author: userId
      })
      .then((tweet) => {
        res.redirect('/')
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('tweets/add')
      })
  }
}

function parseTags (content) {
  let pattern = /[#][\w]+/g
  let tags = content.match(pattern)
  return tags
}
