const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
})

let Category = mongoose.model('Category', categorySchema)

module.exports = Category
