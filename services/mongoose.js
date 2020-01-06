const mongoose = require('mongoose')

const cOptions = {
  dbName: process.env.MONGO_INITDB_DATABASE,
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
  autoIndex: false,
  poolSize: 10,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const cUri = `mongodb://mongo:27017/${process.env.MONGO_INITDB_DATABASE}`

const cTestOptions = {
  autoIndex: false,
  poolSize: 10,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

function connect(uri, options) {
  return mongoose.connect(uri, options).catch(err => {
    console.log('MongoDB connection unsuccessful.', err)
  })
}

function disconnect() {
  return mongoose.disconnect()
}

module.exports = {
  mongoose,

  cOptions,
  cTestOptions,
  cUri,

  connect,
  disconnect
}
