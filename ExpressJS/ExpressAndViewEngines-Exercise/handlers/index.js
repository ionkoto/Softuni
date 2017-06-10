const homeHandler = require('./home')
const movieHandler = require('./movie')
const genreHandler = require('./genre')

module.exports = {
  home: homeHandler,
  movie: movieHandler,
  genre: genreHandler
}
