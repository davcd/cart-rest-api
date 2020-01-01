const uuidv4 = require('uuid/v4')

const mongoose = require('../services/mongoose')

const ItemModel = require('../models/item')

beforeAll(() => {
  mongoose.connect()
})

afterAll(async () => {
  await ItemModel.Item.deleteMany()
  mongoose.mongoose.disconnect()
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

describe('Check item exists by code', () => {
  test('Existing code', async () => {
    const item = await ItemModel.createItem()
    const res = await ItemModel.existsItemByCode(item.item_code)
    expect(res).toBe(true)
  })

  test('Non existing code', async () => {
    const res = await ItemModel.existsItemByCode(uuidv4())
    expect(res).toBe(false)
  })
})

describe('Get item by code', () => {
  test('Existing code', async () => {
    const item = await ItemModel.createItem()
    const res = await ItemModel.getItemByCode(item.item_code)
    expect(res).toHaveProperty('_id')
    expect(res).toHaveProperty('item_code')
    expect(res).toHaveProperty('date')
    expect(res).toHaveProperty('name')
    expect(res).toHaveProperty('description')
    expect(res).toHaveProperty('image')
  })

  test('Non existing code', async () => {
    const res = await ItemModel.getItemByCode(uuidv4())
    expect(res).toBe(null)
  })
})

describe('Get item by id', () => {
  test('Existing id', async () => {
    const item = await ItemModel.createItem()
    const res = await ItemModel.getItemById(item._id)
    expect(res).toHaveProperty('_id')
    expect(res).toHaveProperty('item_code')
    expect(res).toHaveProperty('date')
    expect(res).toHaveProperty('name')
    expect(res).toHaveProperty('description')
    expect(res).toHaveProperty('image')
  })

  test('Non existing id', async () => {
    const res = await ItemModel.getItemById(mongoose.mongoose.Types.ObjectId())
    expect(res).toBe(null)
  })
})
