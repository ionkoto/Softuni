const Movie = require('../models/Movie')
const Genre = require('../models/Genre')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
  Genre.find().then((genres) => {
    res.render('movie/add', {genres: genres})
  })
}

module.exports.editGet = (req, res) => {
  let id = req.params.id
  Movie.findById(id).then((movie) => {
    if (!movie) {
      res.sendStatus(404)
      return
    }

    Genre.find().then((genres) => {
      res.render('movie/edit', {
        movie: movie,
        genres: genres
      })
    })
  })
}

module.exports.deleteGet = (req, res) => {
  let id = req.params.id
  Movie.findById(id).then((movie) => {
    if (!movie) {
      res.sendStatus(404)
      return
    }
    res.render('movie/delete', {
      movie: movie
    })
  })
}

module.exports.buyGet = (req, res) => {
  let id = req.params.id
  Movie.findById(id).then((movie) => {
    if (!movie) {
      res.sendStatus(404)
      return
    }
    res.render('movie/buy', {
      movie: movie
    })
  })

}

module.exports.addPost = (req, res) => {
  let movieObj = req.body

  movieObj.image = '\\' + req.file.path
  Movie.create(movieObj).then((movie) => {
    Genre.findById(movie.genre).then((genre) => {
      genre.movies.push(movie._id)
      genre.save()
    })
    res.redirect('/')
  })
}

module.exports.editPost = (req, res) => {
  let id = req.params.id
  let editedMovie = req.body

  Movie.findById(id).then((movie) => {
    if (!movie) {
      res.redirect(`/?error=${encodeURIComponent('error=Movie was not found!')}`)
      return
    }
    movie.name = editedMovie.name
    movie.summary = editedMovie.description
    movie.director = editedMovie.director

    if (req.file) {
      movie.image = '\\' + req.file.path
    }

    // Check if genre is changed
    if (movie.genre.toString() !== editedMovie.genre) {
      // Find current and next genre
      Genre.findById(movie.genre).then((currentGenre) => {
        Genre.findById(editedMovie.category).then((nextGenre) => {
          let index = currentGenre.movies.indexOf(movie._id)
          if (index >= 0) {
            // Remove the movie from current genre
            currentGenre.movies.splice(index, 1)
          }
          currentGenre.save()

          // Add the movie to the new genre's products List
          nextGenre.movies.push(movie._id)
          nextGenre.save()

          movie.genre = editedMovie.genre

          movie.save().then(() => {
            res.redirect(
              `/?success=${encodeURIComponent('Movie was edited successfully!')}`
            )
          })
        })
      })
    } else {
      movie.save().then(() => {
        res.redirect(
          `/?success=${encodeURIComponent('Movie was edited successfully!')}`
        )
      })
    }
  })
}

module.exports.deletePost = (req, res) => {
  let id = req.params.id

  Movie.findById(id).then((movie) => {
    Genre.findById(movie.genre).then((genre) => {
      let imagePath = movie.image
      let index = genre.movies.indexOf(id)
      if (index >= 0) {
        // Remove the movie from current genre
        genre.movies.splice(index, 1)
      }
      genre.save()
      Movie.findByIdAndRemove(id).then(() => {
        fs.unlink(path.join('.', imagePath), () => {
          res.redirect(`/?success=${encodeURIComponent('Movie was edited successfully!')}`)
        })
      })
    })
  })
}
