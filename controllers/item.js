const validate = require('uuid-validate')

const ItemModel = require('../models/item')

function validateItemCode(req, res, next) {
  if (validate(req.query.item_code)) {
    ItemModel.getItemByCode(req.query.item_code)
      .then(cart => {
        if (cart === false) {
          throw new Error()
        }
        next()
      })
      .catch(() => {
        res.status(404).send({ error: 'Item not found' })
      })
  } else {
    res.status(400).send({ error: 'Incorrect item_code' })
  }
}

function createItem(req, res) {
  ItemModel.createItem()
    .then(result => {
      res.status(201).send({ item_code: result.item_code })
    })
    .catch(() => {
      res.status(400).send({ error: 'Error creating item' })
    })
}

function getItem(req, res) {
  ItemModel.getItemByCode(req.query.item_code)
    .then(result => {
      res.status(200).send(result)
    })
    .catch(() => {
      res.status(400).send({ error: 'Error retrieving item' })
    })
}

module.exports = {
  validateItemCode,
  createItem,
  getItem
}
