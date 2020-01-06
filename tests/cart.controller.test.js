const { MongoMemoryServer } = require('mongodb-memory-server')

const Generic = require('./generic')

const mongooseService = require('../services/mongoose')

const CartModel = require('../models/cart')
const ItemModel = require('../models/item')

const CartController = require('../controllers/cart')

const resMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.locals = jest.fn().mockReturnValue(res)

  return res
}

const nextMock = () => jest.fn()

beforeAll(async () => {
  mongooseService.connect(await new MongoMemoryServer().getUri(), mongooseService.cTestOptions)
})

afterAll(async () => {
  await CartModel.Cart.deleteMany()
  await ItemModel.Item.deleteMany()
  mongooseService.disconnect()
})

async function generateCartWithItem(quantity) {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()

  await CartModel.addCartItem(cart.cart_code, item.item_code, { quantity })

  return { cart, item }
}

test('Create cart', async () => {
  const req = {}
  const res = resMock()

  await CartController.createCart(req, res)
  expect(res.status).toHaveBeenCalledWith(201)
  expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ cart_code: expect.any(String) }))
})

describe('Validate cart', () => {
  test('Existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = resMock()
    const next = nextMock()

    await CartController.validateCartCode(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non existing cart', async () => {
    Generic.controllerFunctionParametersError('cart_code', resMock, CartController.validateCartCode, 400, true)
  })
})

describe('Get cart', () => {
  test('Existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = resMock()

    await CartController.getCart(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()

    Generic.checkCart(res.send.mock.calls[0][0], cart, null, null)
  })

  test('Non existing cart', async () => {
    Generic.controllerFunctionParametersError('cart_code', resMock, CartController.getCart, 500, false)
  })
})

describe('Remove cart', () => {
  test('Existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = resMock()

    await CartController.removeCart(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalledWith()
  })
  test('Non existing cart', async () => {
    Generic.controllerFunctionParametersError('cart_code', resMock, CartController.removeCart, 500, false)
  })
})

describe('Get cart items', () => {
  test('Empty existing cart', async () => {
    const cart = await CartModel.createCart()

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = resMock()

    await CartController.getCartItems(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('Non empty existing cart', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: { cart_code: cart.cart_code }
    }
    const res = resMock()

    await CartController.getCartItems(req, res)
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledTimes(1)

    Generic.checkCart({ items: res.send.mock.calls[0][0] }, null, item, oQuantity)
  })

  test('Non existing cart', async () => {
    Generic.controllerFunctionParametersError('cart_code', resMock, CartController.getCartItems, 500, false)
  })
})

describe('Validate cart item meta', () => {
  test('Valid meta', async () => {
    const req = {
      query: { quantity: Math.ceil(Math.random() * 10) }
    }
    const res = resMock()
    const next = nextMock()

    await CartController.validateCartItemMeta(req, res, next)
    expect(res.locals.quantity).toBe(req.query.quantity)

    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Missing meta', async () => {
    const req = { query: {} }
    const res = resMock()
    const next = nextMock()

    await CartController.validateCartItemMeta(req, res, next)
    expect(res.locals.quantity).toBe(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non valid meta', async () => {
    const req = {
      query: { quantity: new Generic.LoremIpsum().generateWords(1) }
    }
    const res = resMock()
    const next = nextMock()

    await CartController.validateCartItemMeta(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
    expect(next).not.toHaveBeenCalled()
  })
})

describe('Modify cart items', () => {
  test('(New) Positive quantity with non existing cart item', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20

    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }
    const res = resMock()

    res.locals = {
      quantity: oQuantity
    }

    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalled()

    Generic.checkCart({ items: res.send.mock.calls[0][0] }, null, item, oQuantity)
  })

  test('(New) Negative quantity with non existing cart item with ', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20

    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: -oQuantity
    }

    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('(New) Zero quantity with non existing cart item with ', async () => {
    const oQuantity = 0

    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: oQuantity
    }

    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('(New) Positive quantity with existing cart item with ', async () => {
    const oQuantity = Math.ceil(Math.random() * 10)
    const mQuantity = Math.ceil(Math.random() * 10)
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: mQuantity
    }

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledTimes(1)

    Generic.checkCart({ items: res.send.mock.calls[0][0] }, null, item, oQuantity + mQuantity)
  })

  test('(New) Negative quantity (amount positive) with existing cart item', async () => {
    const oQuantity = Math.ceil(Math.random() * 10) + 20
    const mQuantity = Math.ceil(Math.random() * 10)
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: -mQuantity
    }

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledTimes(1)

    Generic.checkCart({ items: res.send.mock.calls[0][0] }, null, item, oQuantity - mQuantity)
  })

  test('(New) Negative quantity (amount zero) with existing cart item', async () => {
    const oQuantity = Math.ceil(Math.random() * 10)
    const mQuantity = oQuantity
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: -mQuantity
    }

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('(New) Negative quantity (amount negative) with existing cart item', async () => {
    const oQuantity = Math.ceil(Math.random() * 10)
    const mQuantity = Math.ceil(Math.random() * 10) + 20
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: -mQuantity
    }

    await CartController.modifyCartItem(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledTimes(1)

    expect(res.send.mock.calls[0][0]).toStrictEqual([])
  })

  test('(New) Zero quantity with existing cart item', async () => {
    const oQuantity = Math.ceil(Math.random() * 10)
    const { cart, item } = await generateCartWithItem(oQuantity)

    const req = {
      query: {
        cart_code: cart.cart_code,
        item_code: item.item_code
      }
    }

    const res = resMock()

    res.locals = {
      quantity: 0
    }

    await CartController.modifyCartItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()

    Generic.checkCart({ items: res.send.mock.calls[0][0] }, null, item, oQuantity)
  })
})
