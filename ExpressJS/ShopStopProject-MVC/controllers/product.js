const Product = require('../models/Product')
const Category = require('../models/Category')
const User = require('../models/User')
const fs = require('fs')
const path = require('path')

module.exports.addGet = (req, res) => {
  Category.find().then((categories) => {
    res.render('product/add', {categories: categories})
  })
}

module.exports.editGet = (req, res) => {
  let id = req.params.id
  Product.findById(id).then((product) => {
    if (!product) {
      res.sendStatus(404)
      return
    }

    if (product.buyer) {
      let error = `error=${encodeURIComponent('Product was already bought!')}`
      res.redirect(`/?${error}`)
      return
    }

    if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
      Category.find().then((categories) => {
        res.render('product/edit', {
          product: product,
          categories: categories
        })
      })
    } else {
      res.redirect('/')
    }
  })
}

module.exports.deleteGet = (req, res) => {
  let id = req.params.id
  Product.findById(id).then((product) => {
    if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
      if (!product) {
        res.sendStatus(404)
        return
      }
      if (product.buyer) {
        let error = `error=${encodeURIComponent('Product was already bought!')}`
        res.redirect(`/?${error}`)
        return
      }
      res.render('product/delete', {
        product: product
      })
    } else {
      res.redirect('/')
    }
  })
}

module.exports.buyGet = (req, res) => {
  let id = req.params.id
  Product.findById(id).then((product) => {
    if (!product) {
      res.sendStatus(404)
      return
    }
    if (product.buyer) {
      let error = `error=${encodeURIComponent('Product was already bought!')}`
      res.redirect(`/?${error}`)
      return
    }
    res.render('product/buy', {
      product: product
    })
  })

}

module.exports.addPost = (req, res) => {
  let productObj = req.body

  productObj.image = '\\' + req.file.path
  productObj.creator = req.user._id

  Product.create(productObj).then((product) => {
    User.findById(req.user._id).then(user => {
      user.createdProducts.push(product._id)
      user.save()
    }).then(() => {
      Category.findById(product.category).then((category) => {
        category.products.push(product._id)
        category.save()
      })
      res.redirect('/')
    })
  })
}

module.exports.editPost = (req, res) => {
  let id = req.params.id
  let editedProduct = req.body

  Product
    .findById(id)
    .then(product => {
      if (!product) {
        res.redirect(`/?error=${encodeURIComponent('error=Product was not found!')}`)
        return
      }
      if (product.buyer) {
        let error = `error=${encodeURIComponent('Product was already bought!')}`
        res.redirect(`/?${error}`)
        return
      }
      if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
        product.name = editedProduct.name
        product.description = editedProduct.description
        product.price = editedProduct.price
        if (req.file) {
          product.image = req.file.path
        }
        let categoryId = editedProduct.category
        if (product.category !== categoryId) {
          Category
            .findById(product.category)
            .then(currentCategory => {
              Category
                .findById(categoryId)
                .then(newCategory => {
                  let index = currentCategory.products.indexOf(product._id)
                  if (index >= 0) {
                    currentCategory.products.splice(index, 1)
                  }
                  currentCategory.save()
                  newCategory.products.push(product._id)
                  newCategory.save()
                  product.category = editedProduct.category
                  product.save()
                    .then(() => {
                      res.redirect('/?success=' +
                        encodeURIComponent('Product was edited successfully'))
                    })
                })
            })
        } else {
          product.save()
            .then(() => {
              res.redirect('/?success=' +
                encodeURIComponent('Product was edited successfully'))
            })
        }
      }
    })
}

module.exports.deletePost = (req, res) => {
  let id = req.params.id

  Product.findById(id).then((product) => {
    if (product.buyer !== null) {
      res.sendStatus(404)
      res.send('Product was already bought!')
      return
    }
    if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
      Category.findById(product.category).then((category) => {
        let imagePath = product.image
        let index = category.products.indexOf(id)
        if (index >= 0) {
          // Remove the product from current category
          category.products.splice(index, 1)
        }
        category.save()
        Product.findByIdAndRemove(id).then(() => {
          fs.unlink(path.join('.', imagePath), () => {
            res.redirect(`/?success=${encodeURIComponent('Product was deleted successfully!')}`)
          })
        })
      })
    } else {
      res.redirect('/')
    }
  })
}

module.exports.buyPost = (req, res) => {
  let productId = req.params.id

  Product.findById(productId).then(product => {
    if (product.buyer) {
      let error = `error=${encodeURIComponent('Product was already bought!')}`
      res.redirect(`/?${error}`)
      return
    }

    product.buyer = req.user._id
    product.save().then(() => {
      req.user.boughtProducts.push(productId)
      req.user.save().then(() => {
        res.redirect('/')
      })
    })
  })
}
