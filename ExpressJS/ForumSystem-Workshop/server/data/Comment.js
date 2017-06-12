const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

let commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: ObjectId, required: true, ref: 'User' },
  thread: { type: ObjectId, required: true, ref: 'Thread' },
  postedOn: { type: Date, default: Date.now() }
})

let Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
