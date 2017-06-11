const mongoose = require('mongoose')

let carSchema = new mongoose.Schema({
  make: {type: String, required: true},
  model: {type: String, required: true},
  image: {type: String, required: true},
  pricePerDay: {type: Number, required: true},
  isRented: {type: Boolean, default: false},
  createdOn: {type: Date, default: Date.now()}
})

let Car = mongoose.model('Car', carSchema)

module.exports = Car
