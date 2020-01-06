const { MongoMemoryServer } = require('mongodb-memory-server')

const Generic = require('./generic')
const mongooseService = require('../services/mongoose')

const ItemModel = require('../models/item')

beforeAll(async () => {
  mongooseService.connect(await new MongoMemoryServer().getUri(), mongooseService.cTestOptions)
})

afterAll(async () => {
  await ItemModel.Item.deleteMany()
  mongooseService.disconnect()
})

test('Create item', async () => {
  const item = await ItemModel.createItem()

  expect(item).toHaveProperty('item_code', item.item_code)

  const res = await ItemModel.existsItemByCode(item.item_code)

  expect(res).toBe(true)
})

describe('Check item exists by code', () => {
  test('Existing item_code', async () => {
    const item = await ItemModel.createItem()
    const res = await ItemModel.existsItemByCode(item.item_code)

    expect(res).toBe(true)
  })

  test('Non existing item_code', async () => {
    await Generic.modelFunctionParameterErrorExpect(ItemModel.existsItemByCode, false)
  })
})

describe('Get item by code', () => {
  test('Existing item_code', async () => {
    const item = await ItemModel.createItem()
    const res = await ItemModel.getItemByCode(item.item_code)

    Generic.checkItem(res, item)
  })

  test('Non existing item_code', async () => {
    await Generic.modelFunctionParameterErrorExpect(ItemModel.getItemByCode, null)
  })
})
