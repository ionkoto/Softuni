const mongoose = require('mongoose')
const REQUIRED_VALIDATION_MESSAGE = '{PATH} is required'

let articleSchema = new mongoose.Schema({
  title: { type: String, required: REQUIRED_VALIDATION_MESSAGE, unique: true },
  content: { type: String, required: REQUIRED_VALIDATION_MESSAGE },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: REQUIRED_VALIDATION_MESSAGE },
  image: { type: String },
  date: { type: mongoose.Schema.Types.Date, default: Date.now() }
})
//
// userSchema.method({
//   authenticate: function (password) {
//     return encryption.generateHashedPassword(this.salt, password) === this.hashedPass
//   }
// })

let Article = mongoose.model('Article', articleSchema)

module.exports = Article
