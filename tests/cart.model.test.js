const uuidv4 = require('uuid/v4')
const mongoose = require('../services/mongoose')

const CartModel = require('../models/cart')
const ItemModel = require('../models/item')

beforeAll(() => {
  mongoose.connect()
})

afterAll(async () => {
  await CartModel.Cart.deleteMany()
  await ItemModel.Item.deleteMany()
  mongoose.mongoose.disconnect()
})

test('Create cart', async () => {
  const cart = await CartModel.createCart()
  expect(cart).toHaveProperty('_id')
  expect(cart).toHaveProperty('cart_code')
  expect(cart).toHaveProperty('date')
  expect(cart).toHaveProperty('items')
})

describe('Check cart exists by code', () => {
  test('Existing code', async () => {
    const cart = await CartModel.createCart()
    const res = await CartModel.existsCartByCode(cart.cart_code)
    expect(res).toBe(true)
  })
  test('Non existing code', async () => {
    const res = await CartModel.existsCartByCode(uuidv4())
    expect(res).toBe(false)
  })
})
describe('Get cart by code', () => {
  test('Existing code', async () => {
    const cart = await CartModel.createCart()
    const res = await CartModel.getCartByCode(cart.cart_code)
    expect(res).toHaveProperty('_id')
    expect(res).toHaveProperty('cart_code')
    expect(res).toHaveProperty('date')
    expect(res).toHaveProperty('items')
  })

  test('Non existing code', async () => {
    const cart = await CartModel.getCartByCode(uuidv4())
    expect(cart).toBe(null)
  })
})

describe('Get cart by id', () => {
  test('Existing id', async () => {
    const cart = await CartModel.createCart()
    const res = await CartModel.getCartById(cart._id)
    expect(res).toHaveProperty('_id')
    expect(res).toHaveProperty('cart_code')
    expect(res).toHaveProperty('date')
    expect(res).toHaveProperty('items')
  })

  test('Existing id with item populates', async () => {
    const cart = await CartModel.createCart()
    const item = await ItemModel.createItem()
    const quantity = Math.ceil(Math.random() * 10)
    await CartModel.addCartItem(cart._id, item._id, { quantity })
    const res = await CartModel.getCartById(cart._id)
    expect(res).toHaveProperty('_id')
    expect(res).toHaveProperty('cart_code')
    expect(res).toHaveProperty('date')
    expect(res).toHaveProperty('items')
    expect(res).toHaveProperty(['items', 0, 'item', '_id'], item._id)
    expect(res).toHaveProperty(['items', 0, 'item', 'item_code'], item.item_code)
    expect(res).toHaveProperty(['items', 0, 'item', 'date'], item.date)
    expect(res).toHaveProperty(['items', 0, 'item', 'name'], item.name)
    expect(res).toHaveProperty(['items', 0, 'item', 'description'], item.description)
    expect(res).toHaveProperty(['items', 0, 'item', 'image'], item.image)
    expect(res).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity)
  })

  test('Non existing id', async () => {
    const cart = await CartModel.getCartById(mongoose.mongoose.Types.ObjectId())
    expect(cart).toBe(null)
  })
})

test('Remove cart by Id', async () => {
  const cart = await CartModel.createCart()
  await CartModel.removeCartById(cart._id)
  const res = await CartModel.existsCartByCode(cart.cart_code)
  expect(res).toBe(false)
})

test('Add cart item', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart._id, item._id, { quantity })
  const res = await CartModel.getCartByCode(cart.cart_code)
  expect(res).toHaveProperty('_id')
  expect(res).toHaveProperty('cart_code')
  expect(res).toHaveProperty('date')
  expect(res).toHaveProperty('items')
  expect(res).toHaveProperty(['items', 0, 'item'], item._id)
  expect(res).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity)
})

test('Update cart item', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart._id, item._id, { quantity })
  const add = await CartModel.getCartByCode(cart.cart_code)
  expect(add).toHaveProperty('_id')
  expect(add).toHaveProperty('cart_code')
  expect(add).toHaveProperty('date')
  expect(add).toHaveProperty('items')
  expect(add).toHaveProperty(['items', 0, 'item'], item._id)
  expect(add).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity)
  await CartModel.updateCartItem(cart._id, item._id, { quantity: quantity + 1 })
  const update = await CartModel.getCartByCode(cart.cart_code)
  expect(update).toHaveProperty('_id')
  expect(update).toHaveProperty('cart_code')
  expect(update).toHaveProperty('date')
  expect(update).toHaveProperty('items')
  expect(update).toHaveProperty(['items', 0, 'item'], item._id)
  expect(update).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity + 1)
})

test('Remove cart items', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart._id, item._id, { quantity })
  const add = await CartModel.getCartByCode(cart.cart_code)
  expect(add).toHaveProperty('_id')
  expect(add).toHaveProperty('cart_code')
  expect(add).toHaveProperty('date')
  expect(add).toHaveProperty('items')
  expect(add).toHaveProperty(['items', 0, 'item'], item._id)
  expect(add).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity)
  await CartModel.removeCartItem(cart._id, item._id)
  const remove = await CartModel.getCartByCode(cart.cart_code)
  expect(remove).toHaveProperty('_id')
  expect(remove).toHaveProperty('cart_code')
  expect(remove).toHaveProperty('date')
  expect(remove).toHaveProperty('items')
  expect(remove).not.toHaveProperty(['items', 0, 'item'])
  expect(remove).not.toHaveProperty(['items', 0, 'meta', 'quantity'])
})
