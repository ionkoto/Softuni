const Genre = require('../models/Genre')

module.exports.addGet = (req, res) => {
  res.render('genre/add')
}

module.exports.addPost = (req, res) => {
  let genre = req.body
  Genre.create(genre).then(() => {
    res.redirect('/')
  })
}

module.exports.movieByGenre = (req, res) => {
  let genreName = req.params.genre

  Genre.findOne({name: genreName})
    .populate('movies')
    .then((genre) => {
      if (!genre) {
        res.sendStatus(404)
        return
      }

      res.render('genre/movies', {genre: genre})
    })
}
