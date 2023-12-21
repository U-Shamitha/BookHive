const { model, Schema } = require("mongoose");
const {BorrowDetailsModel} = require('./borrowDetails');

const BookModel = model(
  "books",
  new Schema({
    name: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    image: {
        data: String,
        name: String,
        contentType: String,
    },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    borrowedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
    borrowedBy2: [{
      type: BorrowDetailsModel.schema, 
      default:[] }],
    priceHistory: { type: Array, required: true, default: [] },
    quantityHistory: { type: Array, required: true, default: [] },
  })
)

module.exports = { BookModel }
