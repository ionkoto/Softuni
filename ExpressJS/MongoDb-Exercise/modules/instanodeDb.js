let mongoose = require('mongoose')
mongoose.Promise = global.Promise

const Image = require('../models/Image')
const Tag = require('../models/Tag')

filter = (query, callback) => {
  let results = query.results || 10
  let minDate = query.after || new Date(-8640000000000000);
  let maxDate = query.before || new Date(8640000000000000);

  Image
    .find({creationDate: {$gt: minDate, $lt: maxDate}})
    .limit(results)
    .then(images => callback(images))
}


// using a Promise
findByTag = (tagName) => {
  return new Promise((resolve, reject) => {
    Image.find({ tags: tagName }, (err, data) => {
      if (err){
        reject (err)
      }
      resolve(data.sort((i1,i2) => i2.creationDate - i1.creationDate))
    })
  })

}
// using a Callback

// let findByTag = function (tag, callback) {
//   Image.find({tags: tag}).then((images) => {
//     images = images.sort((img1, img2) => {
//       return img1.creationDate - img2.creationDate
//     });
//
//     callback(images);
//   });
// };

saveImage = (image) => {
    Image.create({                              // create new Image
      url: image.url,
      description: image.description,
      tags: image.tags
    }).then((imageInDb)=>{                      // iterate the tag names
      for (let tag of image.tags){              // for each tag name search the DB
        Tag.find({name: tag})
          .then((t) => {
          if(t.length === 0){                   // if tag not found in base, create it
            Tag.create({name:tag})
              .then(tagInDb => {                          // then add the image to the tag's images Array(property)
                addImageIdToTag(tagInDb, imageInDb._id)
              })
          } else {
            addImageIdToTag(t[0], imageInDb._id)              // then add the image to the tag's images Array(property)
          }
          })
      }
    })
}

function addImageIdToTag(tag, imageId){
  tag.images.push(imageId)
  tag.save()
}


module.exports = {
  saveImage,
  findByTag,
  filter
}

