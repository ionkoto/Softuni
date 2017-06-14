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
    let username = req.user.username

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
        author: userId,
        authorUsername: username
      })
      .then((tweet) => {
        User
          .findByIdAndUpdate(userId, { $push: { 'tweets': tweet } }, { new: true })
          .then((user) => {
            if (tagsUnique) {
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
            } else {
              res.redirect('/')
            }
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
      .catch(() => {
        res.send('No such tag')
      })
  },
  editGet: (req, res) => {
    let tweetId = req.params.id
    Tweet
      .findById(tweetId)
      .then((tweet) => {
        tweet.content = tweet.content.replace(/(<a href="\/tag\/[\w]+">)|(<\/a>)/ig, '')
        res.render('tweets/edit', { content: tweet.content, author: tweet.authorUsername, id: tweet._id })
      })
  },
  editPost: (req, res) => {
    let tweetObj = req.body
    let tweetId = req.params.id
    if (tweetObj.content.length > 140) {
      res.locals.globalError = 'The tweet can not be longer than 140 characters!'
      res.render('tweets/edit', { content: tweetObj.content, author: tweetObj.authorUsername, id: tweetObj._id })
      return
    }

    tweetObj.content = addHyperlinks(tweetObj)
    Tweet
      .findByIdAndUpdate(tweetId, { content: tweetObj.content })
      .then(() => {
        res.redirect('/')
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('tweets/edit', { content: tweetObj.content, author: tweetObj.authorUsername, id: tweetObj._id })
      })
  },
  deleteGet: (req, res) => {
    let tweetId = req.params.id
    Tweet
      .findById(tweetId)
      .then((tweet) => {
        tweet.content = tweet.content.replace(/(<a href="\/tag\/[\w]+">)|(<\/a>)/ig, '')
        res.render('tweets/delete', { content: tweet.content, author: tweet.authorUsername, id: tweet._id })
      })
  },
  deletePost: (req, res) => {
    let tweetId = req.params.id
    Tweet
      .findByIdAndRemove(tweetId)
      .then((tweet) => {
        let userId = tweet.author
        User
          .findByIdAndUpdate(userId, { $pull: { 'tweets': tweet._id } })
          .then(() => {
            Tag
              .find({ tweets: { $in: [tweetId] } })
              .then((tags) => {
                let createdPromises = tags.map((t) => {
                  return Tag.findOneAndUpdate({ _id: t._id }, { $pull: { 'tweets': tweetId } })
                })
                Promise
                  .all(createdPromises)
                  .then(() => {
                    res.redirect('/')
                  })
                  .catch(err => {
                    let message = errorHandler.handleMongooseError(err)
                    res.locals.globalError = message
                    res.redirect('/')
                  })
              })
          })
        res.redirect('/')
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.redirect('/')
      })
  }
}

function parseTags (content) {
  let pattern = /#(\w+\b)(?!.*\1\b)/gi   // filter unique tags
  let tags = content.match(pattern)
  return tags
}

function addHyperlinks (tweetObj) {
  return tweetObj.content.replace(/(#[a-z0-9][a-z0-9\-_]*)/ig, function (x) {
    return `<a href="/tag/${x.substr(1).toLowerCase()}">${x}</a>`
  })
}
