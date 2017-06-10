const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.String, required: true, unique: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

let Genre = mongoose.model('Genre', categorySchema)

module.exports = Genre
