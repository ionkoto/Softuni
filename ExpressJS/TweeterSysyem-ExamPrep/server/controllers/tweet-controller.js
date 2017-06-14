const Tweet = require('../data/Tweet')
const Tag = require('../data/Tag')
const User = require('../data/User')
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

    let tagsUnique = parseTags(tweetObj.content)

    tweetObj.content = tweetObj.content.replace(/(#[a-z0-9][a-z0-9\-_]*)/ig, function (x) {
      return `<a href="/tag/${x.substr(1).toLowerCase()}">${x}</a>`
    })
    tweetObj.content = tweetObj.content.replace(/(@[a-z0-9][a-z0-9\-_]*)/ig, function (x) {
      return `<a href="/profile/${x.substr(1)}">${x}</a>`
    })

    Tweet
      .create({
        content: tweetObj.content,
        author: userId
      })
      .then((tweet) => {
        User
          .findByIdAndUpdate(userId, { $push: { 'tweets': tweet } }, { new: true })
          .then((user) => {
            let createdPromises = tagsUnique.map((t) => {
              return Tag.findOneAndUpdate({ name: t.substr(1).toLowerCase() }, { $push: { 'tweets': tweet } }, { upsert: true, new: true })
            })
            Promise
              .all(createdPromises)
              .then(() => {
                res.redirect('/')
              })
              .catch(err => {
                let message = errorHandler.handleMongooseError(err)
                res.locals.globalError = message
                res.render('tweets/add')
              })
          })
          .catch(err => {
            let message = errorHandler.handleMongooseError(err)
            res.locals.globalError = message
            res.render('tweets/add')
          })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('tweets/add')
      })
  },
  getByTag: (req, res) => {
    let tagName = req.params.tagName

    Tag
      .findOne({ name: tagName })
      .populate('tweets')
      .then((tag) => {
        let tweets = tag.tweets.sort((t) => t.creationDate).slice(0, 100)  // sort By date and limit to 100
        res.render('tweets/byTag', { tweets: tweets, tag: tagName })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('tweets/add')
      })
  }
}

function parseTags (content) {
  let pattern = /#(\w+\b)(?!.*\1\b)/gi   // filter unique tags
  let tags = content.match(pattern)
  return tags
}
