const uuidv4 = require('uuid/v4')
const { LoremIpsum } = require('lorem-ipsum')
const { mongoose } = require('../services/mongoose')

const { Schema } = mongoose

const itemSchema = new Schema(
  {
    item_code: { type: String, default: () => uuidv4(), required: true },
    date: { type: Date, default: Date.now, required: false },
    name: { type: String, default: () => new LoremIpsum().generateWords(3), required: true },
    description: { type: String, default: () => new LoremIpsum().generateSentences(1), required: false },
    image: { type: String, default: () => `${new LoremIpsum().generateWords(1)}.jpg`, required: false },
    price: { type: Number, default: () => (Math.random() * 1000).toFixed(2), required: true }
  },
  { versionKey: false }
)

const Item = mongoose.model('Item', itemSchema)

function createItem() {
  const item = new Item()
  return item.save()
}

function existsItemByCode(item_code) {
  return Item.exists({ item_code })
}

function getItemByCode(item_code) {
  return Item.findOne({ item_code })
}

function getItemById(id) {
  return Item.findById(id)
}

module.exports = {
  Item,
  createItem,
  existsItemByCode,
  getItemByCode,
  getItemById
}
