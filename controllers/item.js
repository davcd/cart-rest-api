const ItemModel = require('../models/item')
const ParserUtils = require('../utils/parser')

function validateItem(req, res, next) {
  return ItemModel.getItemByCode(req.query.item_code)
    .then(item => {
      req.item_id = item._id
      next()
    })
    .catch(() => {
      res.status(400).send()
    })
}

function createItem(req, res) {
  return ItemModel.createItem()
    .then(result => {
      res.status(201).send({ item_code: result.item_code })
    })
    .catch(() => {
      res.status(400).send()
    })
}

function getItem(req, res) {
  return ItemModel.getItemById(req.item_id)
    .then(result => {
      res.status(200).send(ParserUtils.cleanResult(result))
    })
    .catch(() => {
      res.status(400).send()
    })
}

module.exports = {
  validateItem,
  createItem,
  getItem
}
