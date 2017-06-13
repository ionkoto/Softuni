const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'

let tweetSchema = new mongoose.Schema({
  content: { type: String, required: REQUIRED_VALIDATION_MESSAGE },
  author: { type: ObjectId, required: REQUIRED_VALIDATION_MESSAGE, ref: 'User' }
})

let Tweet = mongoose.model('Tweet', tweetSchema)

module.exports = Tweet
