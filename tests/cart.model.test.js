const Generic = require('./generic')
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

  expect(cart).toHaveProperty('cart_code', cart.cart_code)

  const res = await CartModel.existsCartByCode(cart.cart_code)

  expect(res).toBe(true)
})

describe('Check cart exists by code', () => {
  test('Existing cart_code', async () => {
    const cart = await CartModel.createCart()
    const res = await CartModel.existsCartByCode(cart.cart_code)

    expect(res).toBe(true)
  })
  test('Non existing cart_code', async () => {
    await Generic.modelFunctionParameterErrorExpect(CartModel.existsCartByCode, false)
  })
})
describe('Get cart by code', () => {
  test('Existing cart_code', async () => {
    const cart = await CartModel.createCart()
    const res = await CartModel.getCartByCode(cart.cart_code)

    Generic.checkCart(res, cart, null, null)
  })

  test('Non existing cart_code', async () => {
    await Generic.modelFunctionParameterErrorExpect(CartModel.getCartByCode, null)
  })
})

test('Remove cart by code', async () => {
  const cart = await CartModel.createCart()
  const resPre = await CartModel.existsCartByCode(cart.cart_code)

  expect(resPre).toBe(true)

  await CartModel.removeCartByCode(cart.cart_code)
  const resPost = await CartModel.existsCartByCode(cart.cart_code)

  expect(resPost).toBe(false)
})

test('Add cart item', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart.cart_code, item.item_code, { quantity })
  const res = await CartModel.getCartByCode(cart.cart_code)

  Generic.checkCart(res, cart, item, quantity)
})

test('Update cart item', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart.cart_code, item.item_code, { quantity })
  const add = await CartModel.getCartByCode(cart.cart_code)

  Generic.checkCart(add, cart, item, quantity)

  await CartModel.updateCartItem(cart.cart_code, item.item_code, { quantity: quantity + 1 })
  const update = await CartModel.getCartByCode(cart.cart_code)

  Generic.checkCart(update, cart, item, quantity + 1)
})

test('Remove cart items', async () => {
  const cart = await CartModel.createCart()
  const item = await ItemModel.createItem()
  const quantity = Math.ceil(Math.random() * 10)
  await CartModel.addCartItem(cart.cart_code, item.item_code, { quantity })
  const add = await CartModel.getCartByCode(cart.cart_code)

  Generic.checkCart(add, cart, item, quantity)

  await CartModel.removeCartItem(cart.cart_code, item.item_code)
  const remove = await CartModel.getCartByCode(cart.cart_code)

  Generic.checkCart(remove, cart, null, null)
})
