const mongoose = require('mongoose')
const Tag = require('./Tag')

let imageSchema = new mongoose.Schema({
  url: {type: mongoose.Schema.Types.String, required: true, unique:true},
  creationDate: {type: mongoose.Schema.Types.Date, required: true, default: Date.now()},
  description: {type: mongoose.Schema.Types.String},
  tags: [{type: mongoose.Schema.Types.String, ref: 'Tag'}]
})

let Image = mongoose.model('Image', imageSchema)

module.exports = Image