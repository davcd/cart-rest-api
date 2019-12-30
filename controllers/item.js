const ItemModel = require('../models/item')
const ParserUtils = require('../utils/parser')

async function getItemIdByCode(code) {
  let id = null
  const item = await ItemModel.getItemByCode(code)
  if (item !== null) {
    ;({ id } = item)
  }
  return id
}

async function validateItem(req, res, next) {
  req.item_id = await getItemIdByCode(req.query.item_code)
  if (req.item_id !== null) {
    return next()
  }
  return res.status(400).send()
}

async function createItem(req, res) {
  await ItemModel.createItem().then(result => {
    res.status(201).send({ item_code: result.item_code })
  })
}

async function getItem(req, res) {
  await ItemModel.getItemById(req.item_id).then(result => {
    res.status(200).send(ParserUtils.cleanResult(result))
  })
}

module.exports = {
  validateItem,
  createItem,
  getItem,

  getItemIdByCode
}
