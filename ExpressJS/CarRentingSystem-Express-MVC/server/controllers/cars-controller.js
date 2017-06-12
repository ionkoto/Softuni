const Car = require('../data/Car')
const Renting = require('../data/Renting')
const errorHandler = require('../utilities/error-handler')

module.exports = {
  addGet: (req, res) => {
    res.render('cars/add')
  },
  addPost: (req, res) => {
    let carObject = req.body

    // Validations:
    if (carObject.pricePerDay <= 0) {
      res.locals.globalError = 'Price per day cannot be less than 0'
      res.render('cars/add', carObject)
      return
    }

    Car
      .create({
        make: carObject.make,
        model: carObject.model,
        image: carObject.image,
        pricePerDay: carObject.pricePerDay
      })
      .then((car) => {
        res.redirect('/cars/all')
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('cars/add', carObject)
      })
  },
  allGet: (req, res) => {
    let pageSize = 2
    let page = parseInt(req.query.page) || 1
    let search = req.query.search
    let carsToShow = 0
    Car.find({isRented: false}).then((cars) => { carsToShow = cars.length })
    let query = Car.find({isRented: false})

    if (search) {
      query = query.where('make').regex(new RegExp(search, 'i'))
      query.where('make').regex(new RegExp(search, 'i')).then((cars) => { carsToShow = cars.length })
    }

    query
      .sort('-createdOn')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .then((cars) => {
        res.render('cars/all', {
          cars: cars,
          hasPrevPage: page > 1,
          hasNextPage: carsToShow > page * 2,
          prevPage: page - 1,
          nextPage: page + 1,
          search: search
        })
      })
  },
  rentPost: (req, res) => {
    let carId = req.params.id
    let userId = req.user.id
    let rentDays = parseInt(req.body.days)

    Car
      .findById(carId)
      .then((car) => {
        if (car.isRented) {
          res.locals.globalError = 'Car is already rented!'
          res.render('cars/all')
          return
        }
        Renting.create({
          user: userId,
          car: carId,
          days: rentDays,
          totalPrice: parseInt(req.body.days * car.pricePerDay)
        })
          .then((renting) => {
            car.isRented = true
            setTimeout(() => {
              car.isRented = false
            }, renting.days * 24 * 3600 * 1000)
            car
              .save()
              .then(car => res.redirect('/users/me'))
          })
          .catch(err => {
            let message = errorHandler.handleMongooseError(err)
            res.locals.globalError = message
            res.render('cars/all')
          })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('cars/all')
      })
  },
  editGet: (req, res) => {
    let carId = req.params.id
    Car.findById(carId)
      .then((car) => {
        res.render('cars/edit', car)
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('cars/all')
      })
  },
  editPost: (req, res) => {
    let carId = req.params.id
    let editedCar = req.body
    Car.findById(carId)
      .then((car) => {
        car.make = editedCar.make
        car.model = editedCar.model
        car.pricePerDay = editedCar.pricePerDay
        car.image = editedCar.image
        car.save()
          .then((carReady) => {
            res.redirect('/cars/all')
          })
          .catch(err => {
            let message = errorHandler.handleMongooseError(err)
            res.locals.globalError = message
            res.render('cars/all')
          })
      })
      .catch(err => {
        let message = errorHandler.handleMongooseError(err)
        res.locals.globalError = message
        res.render('cars/all')
      })
  }
}

function checkIfCarReturned (car, renting) {
  let currDate = Date.now()
  let date = new Date()
  date.setDate(renting.rentedOn.getDate() + renting.days)
  if (currDate > date) {
    car.isRented = false
    car.save()
    return true
  }
  return false
}
