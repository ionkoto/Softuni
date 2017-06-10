const mongoose = require('mongoose')
const encryption = require('../utilities/encryption')
const propertyIsRequired = '{0} is required'

let userSchema = mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: propertyIsRequired.replace('{0}', 'Username'),
    minlength: [5, 'The username must be between 6 and 18 characters long'],
    maxlength: [18, 'The username must be between 6 and 18 characters long'],
    unique: true
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: propertyIsRequired.replace('{0}', 'Password'),
    minlength: [8, 'The password must be at least 8 characters long']
  },
  salt: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  firstName: {
    type: mongoose.Schema.Types.String,
    required: propertyIsRequired.replace('{0}', 'First Name'),
    minlength: [2, 'The name must be between 2 and 18 characters long'],
    maxlength: [18, 'The name must be between 2 and 18 characters long']
  },
  lastName: {
    type: mongoose.Schema.Types.String,
    required: propertyIsRequired.replace('{0}', 'Last Name'),
    minlength: [2, 'The name must be between 2 and 18 characters long'],
    maxlength: [18, 'The name must be between 2 and 18 characters long']
  },
  age: {
    type: mongoose.Schema.Types.Number,
    min: [0, 'Age must be between 0 and 120'],
    max: [120, 'Age must be between 0 and 120']
  },
  gender: {
    type: mongoose.Schema.Types.String,
    enum: {
      values: ['Male', 'Female'],
      message: 'Gender should be either \'Male\' or \'Female\'.'
    }
  },
  roles: [{ type: mongoose.Schema.Types.String }],
  boughtProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
})

userSchema.method({
  authenticate: function (password) {
    let hashedPassword = encryption.generateHashedPassword(this.salt, password)

    if (hashedPassword === this.password) {
      return true
    }

    return false
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User

module.exports.seedAdminUser = () => {
  User.find({username: 'admin'}).then(users => {
    if (users.length === 0) {
      let salt = encryption.generateSalt()
      let hashedPass = encryption.generateHashedPassword(salt, 'Admin123')

      User.create({
        username: 'admin',
        firstName: 'Chuck',
        lastName: 'Test',
        salt: salt,
        password: hashedPass,
        age: 33,
        gender: 'Male',
        roles: ['Admin']
      })
    }
  })
}

