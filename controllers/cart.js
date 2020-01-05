const validate = require('uuid-validate')

const CartModel = require('../models/cart')
const GenericUtils = require('../utils/generic')

function validateCartCode(req, res, next) {
  if (validate(req.query.cart_code)) {
    CartModel.existsCartByCode(req.query.cart_code)
      .then(cart => {
        if (cart === false) {
          throw new Error()
        }
        next()
      })
      .catch(() => {
        res.status(404).send({ error: 'Cart not found' })
      })
  } else {
    res.status(400).send({ error: 'Incorrect cart_code' })
  }
}

function createCart(req, res) {
  CartModel.createCart()
    .then(result => {
      res.status(201).send({ cart_code: result.cart_code })
    })
    .catch(() => {
      res.status(400).send({ error: 'Error creating cart' })
    })
}

function getCart(req, res) {
  CartModel.getCartByCode(req.query.cart_code)
    .then(result => {
      res.status(200).send(result)
    })
    .catch(() => {
      res.status(400).send({ error: 'Error retrieving cart' })
    })
}

function removeCart(req, res) {
  CartModel.removeCartByCode(req.query.cart_code)
    .then(() => {
      res.status(204).send()
    })
    .catch(() => {
      res.status(400).send({ error: 'Error deleting cart' })
    })
}

function validateCartItemMeta(req, res, next) {
  const cart = new CartModel.Cart({ items: [{ meta: { quantity: req.query.quantity } }] })
  const error = cart.validateSync()
  if (!GenericUtils.checkAnyStringOfArrayContains(Object.keys(error.errors), 'items.0.meta')) {
    res.locals.quantity = parseInt(req.query.quantity, 10) || 1
    next()
  } else {
    res.status(400).send('Incorrect meta')
  }
}

function getCartItems(req, res) {
  CartModel.getCartByCode(req.query.cart_code)
    .then(result => {
      res.status(200).send(result.items)
    })
    .catch(() => {
      res.status(400).send({ error: 'Error retrieving cart items' })
    })
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

function modifyCartItem(req, res) {
  CartModel.getCartByCode(req.query.cart_code)
    // eslint-disable-next-line consistent-return
    .then(cart => {
      const pos = checkCartItemPosition(cart.items, req.query.item_code)
      if (pos !== null) {
        const newQuantity = res.locals.quantity + cart.items[pos].meta.quantity
        if (newQuantity > 0) {
          return CartModel.updateCartItem(req.query.cart_code, req.query.item_code, { quantity: newQuantity }).then(result => {
            res.status(201).send(result.items)
          })
        }
        return CartModel.removeCartItem(req.query.cart_code, req.query.item_code).then(result => {
          res.status(201).send(result.items)
        })
      }
      if (req.query.quantity > 0) {
        return CartModel.addCartItem(req.query.cart_code, req.query.item_code, { quantity: req.query.quantity }).then(result => {
          res.status(201).send(result.items)
        })
      }
      res.status(200).send(cart.items)
    })
    .catch(() => {
      res.status(400).send({ error: 'Error retrieving cart' })
    })
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
