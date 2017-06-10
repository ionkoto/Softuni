const url = require('url')
const path = require('path')
const fs = require('fs')
const database = require('../database/database')
const zlib = require('zlib')

module.exports = (req, res) => {
    if (req.path === 'content/images/all' && req.method === "GET") {
        fs.readFile('./views/images/images.html', (err, data) => {
          if (err) {
            console.log(err)
            return
          }

          res.writeHead(200, {
              'content-type': 'text/html'
          })

          let content = ''
          let images = database.getAll()

          for (let i = 0; i < images.length; i++) {
              let image = images[i]

              content +=
                  `<div class="product-card">
                      <a href="/images/details/${i}"><img class="product-img" src="${image.image}"></a>
                      <h2>${image.name}</h2>
                  </div>`

          }

          data = data.toString().replace("{content}", content)
          res.write(data)
          res.end()
        })
    } else if (req.method === "GET" && req.path.startsWith("/images/details/")) {
        let imageId = req.path.substring(req.path.lastIndexOf('/') + 1)
        let image = database.getImageById(imageId)

        fs.readFile('../views/images/details.html', (err, data) => {
            if (err) {
                res.writeHead(500, {
                    'content-type': 'text/plain'
                });
                res.write("Invalid url!")
                res.end()
                return
            }

            if (!image) {
                res.writeHead(302, {
                    Location: '/'
                });

                res.end()
                return
            }

            let content = `<img class="img" src="${image.image}">`

            let name = image.name

            data = data.toString().replace("{content}", content)
            data = data.toString().replace("{name}", name)

            res.write(data);
            res.end();
        });
    } else if (req.method === "POST" && req.path.startsWith("/images/details/")) {
        res.writeHead(302, {
            Location: '/images/all'
        });
        res.end();
    } else if (req.method === "GET" && req.path.startsWith("/images/download/")) {
        let url = req.path
        let image = database.getImageByUrl(url)
        let imagePath = path.normalize(path.join(__dirname, '..' + image.image));
        let gzip = zlib.createGzip();
        let readStream = fs.createReadStream(imagePath);

        res.writeHead(200, {
            'Content-Disposition': `attachment; filename=pic.gz`
        });

        readStream.pipe(gzip).pipe(res);
    } else
        return true
};