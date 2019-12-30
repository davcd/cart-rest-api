const CartModel = require('../models/cart')
const ParserUtils = require('../utils/parser')
const GenericUtils = require('../utils/generic')

async function getCartIdByCode(code) {
  let id = null
  const cart = await CartModel.getCartByCode(code)
  if (cart !== null) {
    ;({ id } = cart)
  }
  return id
}

async function validateCart(req, res, next) {
  req.cart_id = await getCartIdByCode(req.query.cart_code)
  if (req.cart_id !== null) {
    return next()
  }
  return res.status(400).send()
}

async function createCart(req, res) {
  await CartModel.createCart().then(result => {
    res.status(201).send({ cart_code: result.cart_code })
  })
}

async function getCart(req, res) {
  await CartModel.getCartById(req.cart_id).then(result => {
    res.status(200).send(ParserUtils.cleanResult(result))
  })
}

async function removeCart(req, res) {
  await CartModel.removeCartById(req.cart_id).then(() => {
    res.status(204).send()
  })
}

async function getCartItems(req, res) {
  await CartModel.getCartById(req.cart_id).then(result => {
    res.status(200).send(ParserUtils.cleanResult(result.items))
  })
}

function validateCartItemMeta(req, res, next) {
  const cart = new CartModel.Cart({ items: [{ meta: { quantity: req.query.quantity } }] })

  const error = cart.validateSync()

  if (!GenericUtils.checkAnyStringOfArrayContains(Object.keys(error.errors), 'items.0.meta')) {
    return next()
  }
  return res.status(400).send()
}

function checkCartItemPosition(array, item_id) {
  let pos = null

  for (let i = 0; i < array.length; i += 1) {
    if (array[i].item._id.toJSON() === item_id) {
      pos = i
    }
  }

  return pos
}

async function modifyCartItem(req, res) {
  await CartModel.getCartById(req.cart_id).then(async cart => {
    const pos = checkCartItemPosition(cart.items.toObject(), req.item_id)
    if (pos !== null) {
      const newQuantity = parseInt(req.query.quantity, 10) + cart.items[pos].meta.quantity

      if (newQuantity > 0) {
        await CartModel.updateCartItem(req.cart_id, req.item_id, { quantity: newQuantity }).then(result => {
          res.status(201).send(ParserUtils.cleanResult(result.items))
        })
      }
      await CartModel.removeCartItem(req.cart_id, req.item_id).then(result => {
        res.status(201).send(ParserUtils.cleanResult(result.items))
      })
    }
    if (req.query.quantity > 0) {
      await CartModel.addCartItem(req.cart_id, req.item_id, { quantity: req.query.quantity }).then(result => {
        res.status(201).send(ParserUtils.cleanResult(result.items))
      })
    } else {
      await res.status(200).send(ParserUtils.cleanResult(cart.items))
    }
  })
}

async function addCartItem(req, res) {
  await modifyCartItem(req, res)
}

async function removeCartItem(req, res) {
  req.query.quantity = -req.query.quantity
  await modifyCartItem(req, res)
}

module.exports = {
  validateCart,
  createCart,
  getCart,
  removeCart,
  validateCartItemMeta,
  getCartItems,
  addCartItem,
  removeCartItem,

  getCartIdByCode
}
