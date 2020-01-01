const uuidv4 = require('uuid/v4')

const mongoose = require('mongoose')

const { Schema } = mongoose

const cartSchema = new Schema(
  {
    cart_code: { type: String, default: () => uuidv4(), required: true },
    date: { type: Date, default: Date.now, required: false },
    items: [
      {
        item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
        meta: {
          quantity: { type: Number, required: true }
          // Discounts, sizes, and other stuff
        }
      }
    ]
  },
  { versionKey: false }
)

const Cart = mongoose.model('Cart', cartSchema)

function createCart() {
  const cart = new Cart()
  return cart.save()
}

function existsCartByCode(cart_code) {
  return Cart.exists({ cart_code })
}

function getCartByCode(cart_code) {
  return Cart.findOne({ cart_code })
}

function getCartById(id) {
  return Cart.findById(id).populate('items.item')
}

function removeCartById(id) {
  return Cart.deleteOne({ _id: id })
}

function addCartItem(cart_id, item_id, meta) {
  return Cart.updateOne({ _id: cart_id, 'items.item': { $ne: item_id } }, { $push: { items: { item: item_id, meta } } }).then(() => {
    return getCartById(cart_id)
  })
}

function updateCartItem(cart_id, item_id, meta) {
  return Cart.updateOne({ _id: cart_id, 'items.item': item_id }, { $set: { 'items.$.meta': meta } }).then(() => {
    return getCartById(cart_id)
  })
}

function removeCartItem(cart_id, item_id) {
  return Cart.updateOne({ _id: cart_id, 'items.item': item_id }, { $pull: { items: { item: item_id } } }).then(() => {
    return getCartById(cart_id)
  })
}

module.exports = {
  Cart,

  createCart,
  existsCartByCode,
  getCartByCode,
  getCartById,
  removeCartById,

  addCartItem,
  updateCartItem,
  removeCartItem
}
