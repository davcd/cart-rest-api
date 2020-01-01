const uuidv4 = require('uuid/v4')

const mongoose = require('../services/mongoose')

const CartModel = require('../models/cart')
const ItemModel = require('../models/item')

const CartController = require('../controllers/cart')

const reqMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

const nextMock = () => jest.fn()

beforeAll(() => {
  mongoose.connect()
})

afterAll(async () => {
  await CartModel.Cart.deleteMany()
  await ItemModel.Item.deleteMany()
  mongoose.mongoose.disconnect()
})

async function generateCartWithItem(quantity) {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()

  await CartModel.addCartItem(cart._id, item._id, { quantity })

  return { cart, item }
}

test('Create cart', async () => {
  const req = {}
  const res = reqMock()

  await CartController.createCart(req, res)
  expect(res.status).toHaveBeenCalledWith(201)
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      cart_code: expect.any(String)
    })
  )
})

describe('Validate cart', () => {
  test('Existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = reqMock()
    const next = nextMock()

    await CartController.validateCart(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non existing cart', async () => {
    const req = {
      query: { cart_code: uuidv4() }
    }
    const res = reqMock()
    const next = nextMock()

    await CartController.validateCart(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith()
    expect(next).not.toHaveBeenCalled()
  })
})

describe('Get cart', () => {
  test('Existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      cart_id: cart._id
    }
    const res = reqMock()

    await CartController.getCart(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        cart_code: expect.any(String),
        date: expect.any(Date),
        items: expect.any(Array)
      })
    )
  })

  test('Non existing cart', async () => {
    const req = {
      cart_id: uuidv4()
    }
    const res = reqMock()

    await CartController.getCart(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith()
  })
})

test('Remove cart', async () => {
  const cart = await CartModel.createCart()

  const req = {
    cart_id: cart._id
  }
  const res = reqMock()

  await CartController.removeCart(req, res)
  expect(res.status).toHaveBeenCalledWith(204)
  expect(res.send).toHaveBeenCalledWith()
})

describe('Get cart items', () => {
  test('Empty cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      cart_id: cart._id
    }
    const res = reqMock()

    await CartController.getCartItems(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('Non empty cart', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      cart_id: cart._id
    }
    const res = reqMock()

    await CartController.getCartItems(req, res)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status.mock.calls[0][0]).toBe(200)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'date'], item.date)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'description'], item.description)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'image'], item.image)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'item_code'], item.item_code)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'name'], item.name)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'price'], item.price)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['meta', 'quantity'], oQuantity)
  })
})

describe('Validate cart item meta', () => {
  test('Valid meta', async () => {
    const req = {
      query: { quantity: Math.ceil(Math.random() * 10) }
    }
    const res = reqMock()
    const next = nextMock()

    await CartController.validateCartItemMeta(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non valid meta', async () => {
    const req = {
      query: { quantity: uuidv4() }
    }
    const res = reqMock()
    const next = nextMock()

    await CartController.validateCartItemMeta(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith()
    expect(next).not.toHaveBeenCalled()
  })
})

describe('Modify cart items', () => {
  test('Add non existing cart item', async () => {
    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()

    const req = {
      cart_id: cart._id,
      item_id: item._id,
      query: { quantity: Math.ceil(Math.random() * 10) }
    }
    const res = reqMock()
    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'date'], item.date)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'description'], item.description)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'image'], item.image)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'item_code'], item.item_code)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'name'], item.name)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'price'], item.price)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['meta', 'quantity'], req.query.quantity)
  })

  test('Add non existing cart item with negative quantity', async () => {
    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()

    const req = {
      cart_id: cart._id,
      item_id: item._id,
      query: { quantity: -Math.ceil(Math.random() * 10) }
    }
    const res = reqMock()
    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test.skip('Add existing cart item with positive quantity', async () => {
    const oQuantity = Math.ceil(Math.random() * 10)
    const mQuantity = Math.ceil(Math.random() * 10)
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      cart_id: cart._id,
      item_id: item._id,
      query: { quantity: mQuantity }
    }
    const res = reqMock()

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status.mock.calls[0][0]).toBe(201)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'date'], item.date)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'description'], item.description)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'image'], item.image)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'item_code'], item.item_code)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'name'], item.name)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'price'], item.price)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['meta', 'quantity'], oQuantity + mQuantity)
  })

  test.skip('Add existing cart item with negative quantity', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20
    const mQuantity = Math.ceil(Math.random() * 10)
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      cart_id: cart._id,
      item_id: item._id,
      query: { quantity: -mQuantity }
    }
    const res = reqMock()

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.status.mock.calls[0][0]).toBe(201)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'date'], item.date)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'description'], item.description)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'image'], item.image)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'item_code'], item.item_code)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'name'], item.name)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['item', 'price'], item.price)
    expect(res.send.mock.calls[0][0][0]).toHaveProperty(['meta', 'quantity'], oQuantity - mQuantity)
  })
})
