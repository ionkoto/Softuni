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
  }
}
