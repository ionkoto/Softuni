const Thread = require('../data/Thread')
const Comment = require('../data/Comment')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    res.render('threads/add')
  },

  addPost: (req, res) => {
    let threadObj = req.body
    let userId = req.user.id

    Thread
      .create({
        title: threadObj.title,
        description: threadObj.description,
        author: userId
      })
      .then((thread) => {
        res.redirect('/')
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('threads/add', threadObj)
      })
  },
  list: (req, res) => {
    Thread
      .find({})
      .sort('-lastAnswer')
      .then((threads) => {
        res.render('threads/list', { threads: threads })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('/')
      })
  },
  threadGet: (req, res) => {
    let threadId = req.params.id
    Thread
      .findById(threadId)
      .populate('author')
      .then((thread) => {
        Comment
          .find({ thread: threadId })
          .sort('-postedOn')
          .populate('author')
          .populate('thread')
          .then((comments) => {
            res.render('threads/thread', { thread: thread, comments: comments })
          })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('/')
      })
  },
  editGet: (req, res) => {
    let threadId = req.params.id
    Thread
      .findById(threadId)
      .then((thread) => {
        res.render('threads/edit', { thread: thread })
      })
  },
  editPost: (req, res) => {
    let threadObj = req.body
    let threadId = req.params.id

    Thread
      .findByIdAndUpdate(threadId, {
        title: threadObj.title,
        description: threadObj.description
      })
      .then((thread) => {
        res.redirect(`/post/${thread._id}/${thread.title}`)
      })
  },
  deleteGet: (req, res) => {
    let threadId = req.params.id
    Thread
      .findById(threadId)
      .then((thread) => {
        res.render('threads/delete', { thread: thread })
      })
  },
  deletePost: (req, res) => {
    let threadId = req.params.id

    Thread
      .findByIdAndRemove(threadId)
      .then((thread) => {
        Comment
          .remove({ thread: thread._id })
          .then(() => {
            res.redirect(`/list`)
          })
      })
  }
}
