const mongoose = require('mongoose')
const Image = require('./Image')

let tagSchema = new mongoose.Schema({
  name: {type: mongoose.Schema.Types.String, required: true, unique:true},
  creationDate: {type: mongoose.Schema.Types.Date, require: true, default: Date.now()},
  images: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}]
})

let Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag