const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

let rentingSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User' },
  car: { type: ObjectId, ref: 'Car' },
  rentedOn: { type: Date, default: Date.now() },
  days: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
})

let Renting = mongoose.model('Renting', rentingSchema)

module.exports = Renting
