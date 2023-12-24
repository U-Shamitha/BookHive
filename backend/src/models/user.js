const { model, Schema } = require("mongoose")

const UserModel = model(
  "users",
  new Schema({
    email: {type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  })
)

module.exports = { UserModel }
