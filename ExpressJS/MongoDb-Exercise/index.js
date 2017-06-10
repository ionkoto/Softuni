const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Tag = require('./models/Tag')


const instanodeDb = require('./modules/instanodeDb')
let connection = 'mongodb://localhost:27017/mongo-db-exercise'
mongoose.connect(connection);


// let image = { url: 'https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault7.jpg', description: 'This image was added first', tags: ['cat', 'kitty'] }

// instanodeDb.saveImage(image)

// instanodeDb.findByTag('cat')
//   .then((images) => {
//   for(let img of images){
//     console.log(img.creationDate + " " + img._id)
//   }
//   })

// let minDate = new Date('2017-05-31T10:16:04.754Z')
// let maxDate = new Date('2017-05-31T10:17:56.369Z')
let minDate = undefined;
let maxDate = undefined;
let query = {after: minDate, before: maxDate, results: 24};

instanodeDb.filter(query, (data) => {
    for (let img of data) {
        console.log(img);
    }
});


// let tag = 'cat';
// instanodeDb.findByTag(tag, (images) => {
//     for (let img of images) {
//      console.log(img.creationDate +" " + img._id)
//  }
// });


