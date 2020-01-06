const validate = require('uuid-validate')

const CartModel = require('../models/cart')
const GenericUtils = require('../utils/generic')

async function validateCartCode(req, res, next) {
  if (validate(req.query.cart_code)) {
    try {
      if ((await CartModel.existsCartByCode(req.query.cart_code)) === false) {
        throw new Error()
      }
      next()
    } catch (e) {
      res.status(404).send({ error: 'Cart not found' })
    }
  } else {
    res.status(400).send({ error: 'Incorrect cart_code' })
  }
}

async function createCart(req, res) {
  try {
    const cart = await CartModel.createCart()
    if (cart === null) {
      throw new Error()
    }
    res.status(201).send({ cart_code: cart.cart_code })
  } catch (e) {
    res.status(400).send({ error: 'Error creating cart' })
  }
}

async function getCart(req, res) {
  try {
    const cart = await CartModel.getCartByCode(req.query.cart_code)
    if (cart === null) {
      throw new Error()
    }
    res.status(200).send(cart)
  } catch (e) {
    res.status(400).send({ error: 'Error retrieving cart' })
  }
}

async function removeCart(req, res) {
  try {
    const result = await CartModel.removeCartByCode(req.query.cart_code)
    if (result.deletedCount === undefined || result.deletedCount === 0) {
      throw new Error()
    }
    res.status(204).send()
  } catch (e) {
    res.status(400).send({ error: 'Error deleting cart' })
  }
}

function validateCartItemMeta(req, res, next) {
  const cart = new CartModel.Cart({ items: [{ meta: { quantity: req.query.quantity } }] })
  const error = cart.validateSync()
  if (!GenericUtils.checkAnyStringOfArrayContains(Object.keys(error.errors), 'items.0.meta')) {
    res.locals.quantity = parseInt(req.query.quantity, 10) || 1
    next()
  } else {
    res.status(400).send({ error: 'Incorrect meta' })
  }
}

async function getCartItems(req, res) {
  try {
    const cart = await CartModel.getCartByCode(req.query.cart_code)
    if (cart === null) {
      throw new Error()
    }
    res.status(200).send(cart.items)
  } catch (e) {
    res.status(400).send({ error: 'Error retrieving cart items' })
  }
}

function checkCartItemPosition(array, item_code) {
  let pos = null
  for (let i = 0; i < array.length; i += 1) {
    if (array[i].item.item_code === item_code) {
      pos = i
    }
  }
  return pos
}

async function modifyCartItem(req, res) {
  try {
    const cart = await CartModel.getCartByCode(req.query.cart_code)

    let result = null

    const pos = checkCartItemPosition(cart.items, req.query.item_code)
    if (pos !== null) {
      const newQuantity = res.locals.quantity + cart.items[pos].meta.quantity

      if (newQuantity !== cart.items[pos].meta.quantity) {
        if (newQuantity > 0) {
          result = await CartModel.updateCartItem(req.query.cart_code, req.query.item_code, { quantity: newQuantity })
        } else {
          result = await CartModel.removeCartItem(req.query.cart_code, req.query.item_code)
        }
      }
    } else if (res.locals.quantity > 0) {
      result = await CartModel.addCartItem(req.query.cart_code, req.query.item_code, { quantity: res.locals.quantity })
    }

    if (result !== null) {
      res.status(201).send(result.items)
    } else {
      res.status(200).send(cart.items)
    }
  } catch (e) {
    res.status(400).send({ error: 'Error retrieving cart' })
  }
}

module.exports = {
  validateCartCode,
  createCart,
  getCart,
  removeCart,

  validateCartItemMeta,
  getCartItems,
  modifyCartItem
}
