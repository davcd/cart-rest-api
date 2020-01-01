const uuidv4 = require('uuid/v4')

const mongoose = require('../services/mongoose')

const ItemModel = require('../models/item')
const ItemController = require('../controllers/item')

const reqMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

const nextMock = () => jest.fn()

beforeAll(() => {
  mongoose.connect()
})

afterAll(async () => {
  await ItemModel.Item.deleteMany()
  mongoose.mongoose.disconnect()
})

test('Create item', async () => {
  const req = {}
  const res = reqMock()

  await ItemController.createItem(req, res)
  expect(res.status).toHaveBeenCalledWith(201)
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      item_code: expect.any(String)
    })
  )
})

describe('Validate item', () => {
  test('Existing item', async () => {
    const item = await ItemModel.createItem()

    const req = {
      query: { item_code: item.item_code }
    }
    const res = reqMock()
    const next = nextMock()

    await ItemController.validateItem(req, res, next)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.send).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('Non existing item', async () => {
    const req = {
      query: { item_code: uuidv4() }
    }
    const res = reqMock()
    const next = nextMock()

    await ItemController.validateItem(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith()
    expect(next).not.toHaveBeenCalled()
  })
})

describe('Get item', () => {
  test('Existing item', async () => {
    const item = await ItemModel.createItem()

    const req = {
      item_id: item._id
    }
    const res = reqMock()

    await ItemController.getItem(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        item_code: expect.any(String),
        date: expect.any(Date),
        name: expect.any(String),
        description: expect.any(String),
        image: expect.any(String)
      })
    )
  })

  test('Non existing item', async () => {
    const req = {
      item_id: mongoose.mongoose.Types.ObjectId()
    }
    const res = reqMock()

    await ItemController.getItem(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith()
  })
})
