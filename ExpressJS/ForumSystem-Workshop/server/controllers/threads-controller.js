const Thread = require('../data/Thread')
const Comment = require('../data/Comment')
const Category = require('../data/Category')
const User = require('../data/User')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    Category
      .find({})
      .then((categories) => {
        res.render('threads/add', { categories: categories })
      })
  },

  addPost: (req, res) => {
    let threadObj = req.body
    let userId = req.user.id

    Thread
      .create({
        title: threadObj.title,
        description: threadObj.description,
        author: userId,
        category: threadObj.category
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
    let pageSize = 20
    let page = parseInt(req.query.page) || 1
    let threadsToShow = 0
    Thread
      .find({})
      .then((allThreads) => {
        threadsToShow = allThreads.length
        Thread
          .find({})
          .sort('-lastAnswer')
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .then((threads) => {
            res.render('threads/list', {
              threads: threads,
              hasPrevPage: page > 1,
              hasNextPage: threadsToShow > page * pageSize,
              prevPage: page - 1,
              nextPage: page + 1
            })
          })
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
        thread.views += 1
        thread
          .save()
          .then((thread) => {
            Comment
              .find({ thread: threadId })
              .sort('-postedOn')
              .populate('author')
              .populate('thread')
              .then((comments) => {
                if (req.user) {
                  let userId = req.user.id
                  User
                    .findById(userId)
                    .then((user) => {
                      if (user.threadsLiked.indexOf(threadId) > -1) {
                        res.render('threads/thread', { thread: thread, comments: comments, hasLiked: true })
                      } else if (user.threadsLiked.indexOf(threadId) < 0) {
                        res.render('threads/thread', { thread: thread, comments: comments, hasLiked: false })
                      }
                    })
                    .catch(err => {
                      let message = errorHandler.handleMongooseError(err)
                      res.locals.globalError = message
                      res.render('/')
                    })
                } else {
                  res.render('threads/thread', { thread: thread, comments: comments })
                }
              })
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
  },
  like: (req, res) => {
    let threadId = req.params.id
    let userId = req.user.id

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
        User
          .findById(userId)
          .then((user) => {
            if (req.body.submit === 'Like') {
              user.threadsLiked.push(threadId)
              user
                .save()
                .then(() => {
                  thread.likes += 1
                  thread
                    .save()
                    .then(() => {
                      res.render('threads/thread', { thread: thread, comments: comments, hasLiked: true })
                    })
                })
            } else if (req.body.submit === 'Dislike') {
              user.threadsLiked.splice(user.threadsLiked.indexOf(threadId), 1)
              user
                .save()
                .then(() => {
                  thread.likes -= 1
                  thread
                    .save()
                    .then(() => {
                      res.render('threads/thread', { thread: thread, comments: comments, hasLiked: false })
                    })
                })
            }
          })
      })
    })
    .catch(err => {
      let message = errorHandler.handleMongooseError(err)
      res.locals.globalError = message
      res.render('/')
    })
  },
  getByCategory: (req, res) => {
    let categoryName = req.params.name
    Category
      .findOne({ name: categoryName })
      .then((category) => {
        Thread
          .find({ category: category._id })
          .then((threads) => {
            res.render('threads/byCategory', {threads: threads})
          })
      })
  }
}
