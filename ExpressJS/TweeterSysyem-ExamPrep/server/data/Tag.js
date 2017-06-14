const mongoose = require('mongoose')
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'
const ObjectId = mongoose.Schema.Types.ObjectId

let tagSchema = new mongoose.Schema({
  name: { type: String, required: REQUIRED_VALIDATION_MESSAGE, unique: true },
  tweets: [{ type: ObjectId, ref: 'Tweet' }]
})

let Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
