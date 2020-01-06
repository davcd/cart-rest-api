require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const request = require('supertest')

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongooseService = require('../services/mongoose')

const Generic = require('./generic')

const ItemModel = require('../models/item')

const ItemRouter = require('../routes/item')

let app = null

beforeAll(async () => {
  app = express()
  app.use(bodyParser.json())
  ItemRouter.routesConfig(app)

  mongooseService.connect(await new MongoMemoryServer().getUri(), mongooseService.cTestOptions)
})

afterAll(async () => {
  await ItemModel.Item.deleteMany()
  mongooseService.disconnect()
})

describe('Item endpoints', () => {
  test('POST /item', async () => {
    const res = await request(app)
      .post('/item')
      .query()
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('item_code')
  })

  describe('GET /item', () => {
    test('Exsting item', async () => {
      const item = await ItemModel.createItem()

      const res = await request(app)
        .get('/item')
        .query({
          item_code: item.item_code
        })
      expect(res.statusCode).toEqual(200)
      Generic.checkItem(res.body, item)
    })

    test('Non existing item (non uuid)', async () => {
      const res = await request(app)
        .get('/item')
        .query({
          item_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing item (uuid)', async () => {
      const res = await request(app)
        .get('/item')
        .query({
          item_code: Generic.uuidv4()
        })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })
  })
})
