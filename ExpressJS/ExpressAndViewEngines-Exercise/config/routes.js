const handlers = require('../handlers')
const multer = require('multer')

let upload = multer({dest: './content/images'})

module.exports = (app) => {
  app.get('/', handlers.home.index)

  app.get('/movie/add', handlers.movie.addGet)
  app.post('/movie/add', upload.single('image'), handlers.movie.addPost)

  app.get('/genre/add', handlers.genre.addGet)
  app.post('/genre/add', handlers.genre.addPost)

  app.get('/genre/:genre/movies', handlers.genre.movieByGenre)

  app.get('/movie/edit/:id', handlers.movie.editGet)
  app.post('/movie/edit/:id', upload.single('image'), handlers.movie.editPost)

  app.get('/movie/delete/:id', handlers.movie.deleteGet)
  app.post('/movie/delete/:id', handlers.movie.deletePost)

  app.get('/movie/buy/:id', handlers.movie.buyGet)

}
