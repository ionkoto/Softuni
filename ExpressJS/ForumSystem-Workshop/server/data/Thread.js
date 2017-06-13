const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

let threadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: ObjectId, required: true, ref: 'User' },
  lastAnswer: { type: Date, default: null },
  postedOn: { type: Date, default: Date.now() },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  category: { type: ObjectId, required: true, ref: 'Category' }
})

let Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread
