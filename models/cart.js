const uuidv4 = require('uuid/v4')

const mongoose = require('mongoose')

const { Schema } = mongoose

const cartSchema = new Schema(
  {
    cart_code: { type: String, default: () => uuidv4(), required: true },
    date: { type: Date, default: Date.now, required: false },
    items: [
      {
        item: {
          item_code: { type: String, required: true }
        },
        meta: {
          quantity: { type: Number }
          // Discounts, sizes, and other stuff
        }
      }
    ]
  },
  { versionKey: false }
)

cartSchema.virtual('items.item.data', {
  ref: 'Item',
  localField: 'items.item.item_code',
  foreignField: 'item_code',
  justOne: true
})

const Cart = mongoose.model('Cart', cartSchema)

function createCart() {
  const cart = new Cart()
  return cart.save()
}

function existsCartByCode(cart_code) {
  return Cart.exists({ cart_code })
}

function getCartByCode(cart_code) {
  return Cart.findOne({ cart_code }, '-_id -items._id')
    .populate('items.item.data', '-_id')
    .lean()
    .then(result => {
      result.items.forEach(res => {
        const item = res
        if (item.item.data !== undefined && item.item.data !== null) {
          item.item = item.item.data
        } else {
          delete item.item.data
        }
        return item
      })
      return result
    })
}

function removeCartByCode(cart_code) {
  return Cart.deleteOne({ cart_code })
}

function addCartItem(cart_code, item_code, meta) {
  return Cart.updateOne({ cart_code, 'items.item.item_code': { $ne: item_code } }, { $push: { items: { item: { item_code }, meta } } }).then(() => {
    return getCartByCode(cart_code)
  })
}

function updateCartItem(cart_code, item_code, meta) {
  return Cart.updateOne({ cart_code, 'items.item.item_code': item_code }, { $set: { 'items.$.meta': meta } }).then(() => {
    return getCartByCode(cart_code)
  })
}

function removeCartItem(cart_code, item_code) {
  return Cart.updateOne({ cart_code, 'items.item.item_code': item_code }, { $pull: { items: { item: { item_code } } } }).then(() => {
    return getCartByCode(cart_code)
  })
}

module.exports = {
  Cart,

  createCart,
  existsCartByCode,
  getCartByCode,
  removeCartByCode,

  addCartItem,
  updateCartItem,
  removeCartItem
}
