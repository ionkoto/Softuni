const fs = require('fs')
const database = require('../database/database')
const homePath = './index.html'
const multiparty = require('multiparty')
const shortid = require('shortid');
let path = require('path')

module.exports = (req, res) => {
  if (req.path === '/' && req.method === 'GET') {
    fs.readFile('./views/home/home.html', 'utf8', (err, data) => {
      if (err) {
        console.log(err)
        return
      }
      res.writeHead(200, {
        'content-type': 'text/html'
      })

      res.write(data)
      res.end()
    })
  } else if (req.path === '/' && req.method === "POST") {
    let form = new multiparty.Form()
    let imageFile = {}

    form.on('part', (part) => {
      if (part.filename) {
        let encoding = 'binary'
        let options = {encoding: encoding}
        let fileName = shortid.generate()
        let filePath = path.normalize(path.join(__dirname, '../content/images', fileName + part.filename))
        let writeStream = fs.createWriteStream(filePath, encoding)

        part.setEncoding('binary')
        part.on('data', (data) => {
          writeStream.write(data, encoding)
        })

        part.on('end', () => {
          filePath = path.normalize(path.join('/content/images', fileName + part.filename))
          imageFile.image = filePath

          writeStream.end()
        })
      } else {
        part.setEncoding('utf-8')
        let field = ''

        part.on('data', (data) => {
          field += data
        })

        part.on('end', () => {
          imageFile[part.name] = field
        })
      }
    })

    form.on('close', () => {
      imageFile.url = "/images/download/" + shortid.generate()
      database.images.add(imageFile)

      res.writeHead(302, {
        Location: '/images/all'
      })

      res.end()
    })

    form.parse(req)
  }
  else
    return true
}
