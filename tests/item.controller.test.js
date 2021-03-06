const { MongoMemoryServer } = require('mongodb-memory-server')

const Generic = require('./generic')

const mongooseService = require('../services/mongoose')

const ItemModel = require('../models/item')
const ItemController = require('../controllers/item')

const resMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

const nextMock = () => jest.fn()

beforeAll(async () => {
  mongooseService.connect(await new MongoMemoryServer().getUri(), mongooseService.cTestOptions)
})

afterAll(async () => {
  await ItemModel.Item.deleteMany()
  mongooseService.disconnect()
})

test('Create item', async () => {
  const req = {}
  const res = resMock()

  await ItemController.createItem(req, res)
  expect(res.status).toHaveBeenCalledWith(201)
  expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ item_code: expect.any(String) }))
})

describe('Validate item', () => {
  test('Existing item', async () => {
    const item = await ItemModel.createItem()

    const req = {
      query: { item_code: item.item_code }
    }
    const res = resMock()
    const next = nextMock()

    await ItemController.validateItemCode(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non existing item', async () => {
    Generic.controllerFunctionParametersError('item_code', resMock, ItemController.validateItemCode, 400, true)
  })
})

describe('Get item', () => {
  test('Existing item', async () => {
    const item = await ItemModel.createItem()

    const req = {
      query: { item_code: item.item_code }
    }
    const res = resMock()

    await ItemController.getItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalled()

    Generic.checkItem(res.send.mock.calls[0][0], item)
  })

  test('Non existing item', async () => {
    Generic.controllerFunctionParametersError('item_code', resMock, ItemController.getItem, 500, false)
  })
})
