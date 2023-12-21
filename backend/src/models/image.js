const {model, Schema} = require("mongoose");

const ImageModel = model(
    "image",
    new Schema({
        name: String,
        image: {
            data: Buffer,
            contentType: String,
        },
    })
)

module.exports = { ImageModel }