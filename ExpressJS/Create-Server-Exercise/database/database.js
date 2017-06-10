const fs = require('fs')
const path = require('path')
const dbPath = path.join(__dirname, '/database.json')
// let data = []

let getImages = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbPath)) {
      fs.writeFile(dbPath, '[]', (err) => {
        if (err) throw err
        return []
      })
    }
    fs.readFile(dbPath, (err, data) => {
      if (err) {
        reject(err)
      }
      return resolve(data)
    })
  })
}

let saveImages = (images) => {
  return new Promise((resolve, reject) => {
    let json = JSON.stringify(images, null, 2)
    fs.writeFile(dbPath, json, 'utf8', (err) => {
      if (err) {
        reject(err)
      }
      return resolve
    })
  })
}

module.exports.getAll = () => {
  return getImages().filter(img => img.isPrivate === undefined)
}

module.exports.images = {}



module.exports.images.add = (image) => {
  getImages()
    .then((images) => {
      images = JSON.parse(images)
      image.id = images.length + 1
      images.push(image)
      return images
    })
    .then((images) => {
      return saveImages(images)
    })
    .catch((err) => console.log(err))
}

module.exports.getImageById = (id) => {
  let image = getImages().filter(img => img.id === id)
  return image[0]
}

module.exports.getImageByUrl = (url) => {
  let image = getImages().filter(img => img.url === url)
  return image[0];
}
