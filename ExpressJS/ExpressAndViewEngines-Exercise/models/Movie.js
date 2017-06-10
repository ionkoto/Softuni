const mongoose = require('mongoose')

let movieSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.String, required: true },
  summary: { type: mongoose.Schema.Types.String },
  director: { type: mongoose.Schema.Types.String, required: true },
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
  image: { type: mongoose.Schema.Types.String }
})

let Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie
