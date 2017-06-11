const Article = require('../data/Article')
const User = require('../data/User')
const fs = require('fs')
const path = require('path')

module.exports = {
  addGet: (req, res) => {
    res.render('article/add')
  },

  addPost: (req, res) => {
    let articleObj = req.body
    articleObj.image = generateImagePath(req.file.path)
    articleObj.author = req.user._id

    Article.create(articleObj).then((article) => {
      User.findById(req.user._id).then((user) => {
        user.articles.push(article._id)
        user.save()
      })
      res.redirect('/')
    })
  },
  listGet: (req, res) => {
    let page = parseInt(req.query.page) || 1
    let pageSize = 2
    let search = req.query.search
    let query = Article.find({})

    if (search) {
      // We query both the Title and the Content
      query = query.find({$or: [
        {title: {$regex: search, $options: 'i'}},
        {content: {$regex: search, $options: 'i'}}
      ]})
    }

    query
      .sort('-date')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .then((articles) => {
        res.render('article/list', {
          articles: articles,
          hasPrevPage: page > 1,
          hasNextPage: articles.length > 0,
          nextPage: page + 1,
          prevPage: page - 1,
          search: search
        })
      })
  },
  detailsGet: (req, res) => {
    let articleId = req.params.id
    Article.findById(articleId).then((article) => {
      if (!article) {
        res.sendStatus(404)
        return
      }
      User.findById(article.author).then((author) => {
        let canEdit = checkIfUserCanEdit(req.user, author._id)
        let isAdmin = checkIfUserIsAdmin(req.user)
        let date = formatDate(article.date)
        res.render('article/details', {
          article: article,
          author: author,
          date: date,
          canEdit: canEdit,
          isAdmin: isAdmin
        })
      })
    }).catch(() => {
      res.sendStatus(404)
    })
  },
  editGet: (req, res) => {
    let articleId = req.params.id
    Article.findById(articleId).then((article) => {
      if (!article) {
        res.sendStatus(404)
        return
      }
      let canEdit = checkIfUserCanEdit(req.user, article.author)
      if (canEdit) {
        res.render('article/edit', {article: article})
      } else {
        res.sendStatus(404)
      }
    })
  },
  editPost: (req, res) => {
    let articleId = req.params.id
    let editedArticle = req.body
    Article.findById(articleId).then(article => {
      if (!article) {
        res.redirect(`/?error=${encodeURIComponent('error=Article was not found!')}`)
        return
      }
      if (checkIfUserCanEdit(req.user, article.author)) {
        article.title = editedArticle.title
        article.content = editedArticle.content
        if (req.file) {
          article.image = generateImagePath(req.file.path)
        }
        article.save()
          .then(() => {
            res.redirect('/?success=' +
              encodeURIComponent('Article was edited successfully'))
          })
      }
    })
  },
  deleteGet: (req, res) => {
    let articleId = req.params.id
    Article.findById(articleId).then(article => {
      if (!article) {
        res.sendStatus(404)
        return
      }
      res.render('article/delete', {article: article})
    })
  },
  deletePost: (req, res) => {
    let articleId = req.params.id
    Article.findById(articleId).then(article => {
      if (!article) {
        res.sendStatus(404)
        return
      }
      let imagePath = article.image
      let userId = article.author
      Article.findByIdAndRemove(articleId).then(() => {
        User.findById(userId).then((user) => {
          let articleArrayIndex = user.articles.indexOf(articleId)
          user.articles.splice(articleArrayIndex, 1)
          user.save()
            .then(() => {
              fs.unlink(path.join('.', imagePath), () => {
                res.redirect(`/?success=${encodeURIComponent('Article was deleted successfully!')}`)
              })
            })
        })
      })
    })
  }
}

function formatDate (date) {
  let monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ]

  let day = date.getDate()
  let monthIndex = date.getMonth()
  let year = date.getFullYear()

  return day + ' ' + monthNames[monthIndex] + ' ' + year
}

function checkIfUserCanEdit (currUser, authorId) {
  if (currUser._id.toString() === authorId.toString()) {
    return true
  }
  if (currUser.roles.indexOf('Admin') >= 0) {
    return true
  }
  return false
}

function generateImagePath (filePath) {
  return filePath.substring(filePath.indexOf('\\'))
}

function checkIfUserIsAdmin (user) {
  return user.roles.indexOf('Admin') >= 0
}
