const Thread = require('../data/Thread')
const Comment = require('../data/Comment')
const Category = require('../data/Category')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    res.render('category/add')
  },
  addPost: (req, res) => {
    let categoryObj = req.body
    Category
      .create({
        name: categoryObj.name
      })
      .then((category) => {
        res.redirect('/categories')
      })
  },
  list: (req, res) => {
    Category
      .find({})
      .then((categories) => {
        res.render('category/all', { categories: categories })
      })
  },
  delete: (req, res) => {
    let categoryId = req.params.id
    Category
      .findByIdAndRemove(categoryId)
      .then(() => {
        Thread
          .remove({ category: categoryId })
          .then(() => {
            res.redirect('/categories')
          })
      })
  }
}
