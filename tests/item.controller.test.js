const uuidv4 = require('uuid/v4')

const ItemModel = require('../models/item')
const ItemController = require('../controllers/item')

const reqMock = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

const nextMock = () => jest.fn()

afterEach(async () => {
  await ItemModel.Item.deleteMany()
})

test('Validate existing item', async () => {
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

test('Validate non existing item', async () => {
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

test('Get item', async () => {
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

test('Get item_id by code', async () => {
  const item = await ItemModel.createItem()
  const res = await ItemController.getItemIdByCode(item.item_code)
  expect(res).toBe(item._id.toJSON())
})

test('Get item_id by wrong code', async () => {
  const res = await ItemController.getItemIdByCode(uuidv4())
  expect(res).toBe(null)
})
