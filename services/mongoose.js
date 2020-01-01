const mongoose = require('mongoose')

const options = {
  dbName: process.env.MONGO_INITDB_DATABASE,
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  autoIndex: false,
  poolSize: 10,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

function connect() {
  mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_INITDB_DATABASE}`, options).catch(err => {
    console.log('MongoDB connection unsuccessful, retry after 5 seconds.', err) // eslint no ++
  })
}

module.exports = {
  mongoose,
  connect
}
