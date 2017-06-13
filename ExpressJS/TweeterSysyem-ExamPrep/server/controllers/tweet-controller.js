const Tweet = require('../data/Tweet')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    res.render('tweets/add')
  },
  addPost: (req, res) => {
    let tweetObj = req.body
    let userId = req.user.id
    Tweet
      .create({
        content: tweetObj.content,
        author: userId
      })
      .then((tweet) => {
        res.redirect('/')
      })
  }
}
