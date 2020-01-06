require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const request = require('supertest')

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongooseService = require('../services/mongoose')

const Generic = require('./generic')

const ItemModel = require('../models/item')
const CartModel = require('../models/cart')

const CartRouter = require('../routes/cart')

let app = null

beforeAll(async () => {
  app = express()
  app.use(bodyParser.json())
  CartRouter.routesConfig(app)

  mongooseService.connect(await new MongoMemoryServer().getUri(), mongooseService.cTestOptions)
})

afterAll(async () => {
  await CartModel.Cart.deleteMany()
  await ItemModel.Item.deleteMany()
  mongooseService.disconnect()
})

describe('Cart endpoints', () => {
  test('POST /cart', async () => {
    const res = await request(app)
      .post('/cart')
      .query()
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('cart_code')
  })

  describe('GET /cart', () => {
    test('Exsting cart', async () => {
      const cart = await CartModel.createCart()

      const res = await request(app)
        .get('/cart')
        .query({
          cart_code: cart.cart_code
        })
      expect(res.statusCode).toEqual(200)
      Generic.checkCart(res.body, cart, null, null)
    })

    test('Non existing cart (non uuid)', async () => {
      const res = await request(app)
        .get('/cart')
        .query({
          cart_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing cart (uuid)', async () => {
      const res = await request(app)
        .get('/cart')
        .query({
          cart_code: Generic.uuidv4()
        })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })
  })

  describe('DELETE /cart', () => {
    test('Exsting cart', async () => {
      const cart = await CartModel.createCart()

      const res = await request(app)
        .delete('/cart')
        .query({
          cart_code: cart.cart_code
        })
      expect(res.statusCode).toEqual(204)
      expect(res.body).toEqual({})
    })

    test('Non existing cart (non uuid)', async () => {
      const res = await request(app)
        .delete('/cart')
        .query({
          cart_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing cart (uuid)', async () => {
      const res = await request(app)
        .delete('/cart')
        .query({
          cart_code: Generic.uuidv4()
        })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('Cart items endpoints', () => {
  describe('GET /cart/items', () => {
    test('Exsting cart', async () => {
      const cart = await CartModel.createCart()

      const res = await request(app)
        .get('/cart/items')
        .query({
          cart_code: cart.cart_code
        })
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual([])
    })

    test('Non existing cart (non uuid)', async () => {
      const res = await request(app)
        .get('/cart/items')
        .query({
          cart_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing cart (uuid)', async () => {
      const res = await request(app)
        .get('/cart/items')
        .query({
          cart_code: Generic.uuidv4()
        })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /cart/items', () => {
    test('Exsting cart, existing item, correct meta', async () => {
      const quantity = Math.ceil(Math.random() * 10)

      const cart = await CartModel.createCart()
      const item = await ItemModel.createItem()

      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: cart.cart_code,
          item_code: item.item_code,
          quantity
        })
      expect(res.statusCode).toEqual(201)
      Generic.checkCart({ items: res.body }, null, item, quantity)
    })

    test('Non existing cart (non uuid)', async () => {
      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing cart (uuid)', async () => {
      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: Generic.uuidv4()
        })
      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing item (non uuid)', async () => {
      const cart = await CartModel.createCart()

      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: cart.cart_code,
          item_code: new Generic.LoremIpsum().generateWords(1)
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })

    test('Non existing item (uuid)', async () => {
      const cart = await CartModel.createCart()

      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: cart.cart_code,
          item_code: Generic.uuidv4()
        })

      expect(res.statusCode).toEqual(404)
      expect(res.body).toHaveProperty('error')
    })

    test('Incorrect correct meta', async () => {
      const quantity = new Generic.LoremIpsum().generateWords(1)

      const cart = await CartModel.createCart()
      const item = await ItemModel.createItem()

      const res = await request(app)
        .post('/cart/items')
        .query({
          cart_code: cart.cart_code,
          item_code: item.item_code,
          quantity
        })
      expect(res.statusCode).toEqual(400)
      expect(res.body).toHaveProperty('error')
    })
  })
})
