const validate = require('uuid-validate')

const ItemModel = require('../models/item')

async function validateItemCode(req, res, next) {
  if (validate(req.query.item_code)) {
    try {
      if ((await ItemModel.existsItemByCode(req.query.item_code)) === false) {
        throw new Error()
      }
      next()
    } catch (e) {
      res.status(404).send({ error: 'Item not found' })
    }
  } else {
    res.status(400).send({ error: 'Incorrect item_code' })
  }
}

async function createItem(req, res) {
  try {
    const item = await ItemModel.createItem()
    if (item === null) {
      throw new Error()
    }
    res.status(201).send({ item_code: item.item_code })
  } catch (e) {
    res.status(400).send({ error: 'Error creating item' })
  }
}

async function getItem(req, res) {
  try {
    const item = await ItemModel.getItemByCode(req.query.item_code)
    if (item === null) {
      throw new Error()
    }
    res.status(200).send(item)
  } catch (e) {
    res.status(400).send({ error: 'Error retrieving item' })
  }
}

module.exports = {
  validateItemCode,
  createItem,
  getItem
}
