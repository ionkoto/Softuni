const mongoose = require('mongoose')
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'

let tagSchema = new mongoose.Schema({
  name: { type: String, required: REQUIRED_VALIDATION_MESSAGE }
})

let Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
