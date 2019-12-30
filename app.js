require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const CartRouter = require('./routes/cart')
const ItemRouter = require('./routes/item')

const app = express()

app.use(bodyParser.json())
CartRouter.routesConfig(app)
ItemRouter.routesConfig(app)

app.listen(process.env.APP_PORT, () => {
  console.log('app listening at port %s', process.env.APP_PORT)
})
