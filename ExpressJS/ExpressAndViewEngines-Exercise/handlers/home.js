const Genre = require('../models/Genre')
const Movie = require('../models/Movie')

module.exports.index = (req, res) => {
  let queryData = req.query

  Movie.find()
    .populate('genre')
    .then((movies) => {
      if (queryData.query) {
        movies = movies.filter(
          m => m.genre.name.toLowerCase().includes(queryData.query.toLowerCase())
        )
      }
      let data = {movies: movies}
      if (req.query.error) {
        data.error = req.query.error
      } else if (req.query.success) {
        data.success = req.query.success
      }
      res.render('home/index', data)
    })
}
