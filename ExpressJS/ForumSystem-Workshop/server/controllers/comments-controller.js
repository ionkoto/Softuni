const Thread = require('../data/Thread')
const Comment = require('../data/Comment')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  add: (req, res) => {
    let commentObj = req.body
    let userId = req.user.id
    let threadId = req.params.id
    Comment
      .create({
        content: commentObj.content,
        author: userId,
        thread: threadId
      })
      .then((comment) => {
        Thread
          .findById(threadId)
          .then((thread) => {
            thread.lastAnswer = comment.postedOn
            thread
              .save()
              .then((thread) => {
                res.redirect(`/post/${thread._id}/${thread.title}`)
              })
              .catch(err => {
                let message = errorHandler.handleMongooseError(err)
                res.locals.globalError = message
                res.redirect('/')
              })
          })
          .catch(err => {
            let message = errorHandler.handleMongooseError(err)
            res.locals.globalError = message
            res.redirect('/')
          })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.redirect('/')
      })
  },
  editGet: (req, res) => {
    let threadId = req.params.id
    let commentId = req.params.commentId
    Thread
      .findById(threadId)
      .then((thread) => {
        Comment
          .findById(commentId)
          .then((comment) => {
            res.render('comments/edit', { thread: thread, comment: comment })
          })
      })
  },
  editPost: (req, res) => {
    let commentObj = req.body
    let commentId = req.params.commentId
    let threadId = req.params.id
    let threadTitle = req.params.title

    Comment
      .findByIdAndUpdate(commentId, {
        content: commentObj.content
      })
      .then((comment) => {
        res.redirect(`/post/${threadId}/${threadTitle}`)
      })
  },
  deleteGet: (req, res) => {
    let threadId = req.params.id
    let commentId = req.params.commentId
    Thread
      .findById(threadId)
      .then((thread) => {
        Comment
          .findById(commentId)
          .then((comment) => {
            res.render('comments/delete', { thread: thread, comment: comment })
          })
      })
  },
  deletePost: (req, res) => {
    let commentId = req.params.commentId
    let threadId = req.params.id
    let threadTitle = req.params.title

    Comment
      .findByIdAndRemove(commentId)
      .then(() => {
        res.redirect(`/post/${threadId}/${threadTitle}`)
      })
  }
}
