const mongoose = require('mongoose')
const uuidv4 = require('uuid/v4')

const ItemModel = require('../models/item')

afterEach(async () => {
  await ItemModel.Item.deleteMany()
})

test('Create item', async () => {
  const item = await ItemModel.createItem()
  expect(item).toHaveProperty('_id')
  expect(item).toHaveProperty('item_code')
  expect(item).toHaveProperty('date')
  expect(item).toHaveProperty('name')
  expect(item).toHaveProperty('description')
  expect(item).toHaveProperty('image')
})

test('Check item exists by code', async () => {
  const item = await ItemModel.createItem()
  const res = await ItemModel.existsItemByCode(item.item_code)
  expect(res).toBe(true)
})

test('Check item not exists by wrong code', async () => {
  const res = await ItemModel.existsItemByCode(uuidv4())
  expect(res).toBe(false)
})

test('Get item by code', async () => {
  const item = await ItemModel.createItem()
  const res = await ItemModel.getItemByCode(item.item_code)
  expect(res).toHaveProperty('_id')
  expect(res).toHaveProperty('item_code')
  expect(res).toHaveProperty('date')
  expect(res).toHaveProperty('name')
  expect(res).toHaveProperty('description')
  expect(res).toHaveProperty('image')
})

test('Get item by wrong code', async () => {
  const res = await ItemModel.getItemByCode(uuidv4())
  expect(res).toBe(null)
})

test('Get item by id', async () => {
  const item = await ItemModel.createItem()
  const res = await ItemModel.getItemById(item._id)
  expect(res).toHaveProperty('_id')
  expect(res).toHaveProperty('item_code')
  expect(res).toHaveProperty('date')
  expect(res).toHaveProperty('name')
  expect(res).toHaveProperty('description')
  expect(res).toHaveProperty('image')
})

test('Get item by wrong id', async () => {
  const res = await ItemModel.getItemById(mongoose.Types.ObjectId())
  expect(res).toBe(null)
})
