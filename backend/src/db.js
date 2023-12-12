const { connect } = require("mongoose")

const connectDb = async () => {
  return connect(process.env.DB_URI)
}

module.exports = { connectDb }
