const mongoose = require('mongoose')

function connect() {
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
  const uri = `mongodb://mongo:27017/${process.env.MONGO_INITDB_DATABASE}`

  return mongoose.connect(uri, options).catch(err => {
    console.log('MongoDB connection unsuccessful.', err) // eslint no ++
  })
}

async function connectTest(MongoMemoryServer) {
  // passed as parameter for production execution compatibility (MongoMemoryServer is dev dependency)
  const mongoServer = new MongoMemoryServer()

  const uri = await mongoServer.getUri()

  const options = {
    autoIndex: false,
    poolSize: 10,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  try {
    await mongoose.connect(uri, options)
  } catch (err) {
    console.log('MongoDB connection unsuccessful.', err) // eslint no ++
  }
}

module.exports = {
  mongoose,
  connect,
  connectTest
}
