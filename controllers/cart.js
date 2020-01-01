const CartModel = require('../models/cart')
const ParserUtils = require('../utils/parser')
const GenericUtils = require('../utils/generic')

function validateCart(req, res, next) {
  return CartModel.getCartByCode(req.query.cart_code)
    .then(cart => {
      req.cart_id = cart._id
      next()
    })
    .catch(() => {
      res.status(400).send()
    })
}

function createCart(req, res) {
  return CartModel.createCart()
    .then(result => {
      res.status(201).send({ cart_code: result.cart_code })
    })
    .catch(() => {
      res.status(400).send()
    })
}

function getCart(req, res) {
  return CartModel.getCartById(req.cart_id)
    .then(result => {
      res.status(200).send(ParserUtils.cleanResult(result))
    })
    .catch(() => {
      res.status(400).send()
    })
}

function removeCart(req, res) {
  return CartModel.removeCartById(req.cart_id)
    .then(() => {
      res.status(204).send()
    })
    .catch(() => {
      res.status(400).send()
    })
}

function validateCartItemMeta(req, res, next) {
  const cart = new CartModel.Cart({ items: [{ meta: { quantity: req.query.quantity } }] })
  const error = cart.validateSync()
  if (!GenericUtils.checkAnyStringOfArrayContains(Object.keys(error.errors), 'items.0.meta')) {
    next()
  } else {
    res.status(400).send()
  }
}

function getCartItems(req, res) {
  return CartModel.getCartById(req.cart_id)
    .then(result => {
      res.status(200).send(ParserUtils.cleanResult(result.items))
    })
    .catch(() => {
      res.status(400).send()
    })
}

function checkCartItemPosition(array, item_id) {
  let pos = null
  for (let i = 0; i < array.length; i += 1) {
    if (array[i].item._id.equals(item_id)) {
      pos = i
    }
  }
  return pos
}

function modifyCartItem(req, res) {
  return CartModel.getCartById(req.cart_id).then(cart => {
    const pos = checkCartItemPosition(cart.items, req.item_id)
    if (pos !== null) {
      const newQuantity = parseInt(req.query.quantity, 10) + cart.items[pos].meta.quantity

      if (newQuantity > 0) {
        return CartModel.updateCartItem(req.cart_id, req.item_id, { quantity: newQuantity }).then(result => {
          res.status(201).send(ParserUtils.cleanResult(result.items))
        })
      }
      return CartModel.removeCartItem(req.cart_id, req.item_id).then(result => {
        res.status(201).send(ParserUtils.cleanResult(result.items))
      })
    }
    if (req.query.quantity > 0) {
      return CartModel.addCartItem(req.cart_id, req.item_id, { quantity: req.query.quantity }).then(result => {
        res.status(201).send(ParserUtils.cleanResult(result.items))
      })
    }
    return res.status(200).send(ParserUtils.cleanResult(cart.items))
  })
}

module.exports = {
  validateCart,
  createCart,
  getCart,
  removeCart,

  validateCartItemMeta,
  getCartItems,
  modifyCartItem
}
