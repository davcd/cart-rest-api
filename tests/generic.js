/* eslint-disable no-await-in-loop */
const uuidv4 = require('uuid/v4')
const validate = require('uuid-validate')
const { LoremIpsum } = require('lorem-ipsum')

function checkCart(result, cart, item, quantity) {
  if (cart !== null) {
    expect(result).toHaveProperty('cart_code', cart.cart_code)
    expect(result).toHaveProperty('date', cart.date)
  }

  expect(result).toHaveProperty('items')

  if (item !== null) {
    expect(result).toHaveProperty(['items', 0, 'item', 'item_code'], item.item_code)
    expect(result).toHaveProperty(['items', 0, 'item', 'date'], item.date)
    expect(result).toHaveProperty(['items', 0, 'item', 'name'], item.name)
    expect(result).toHaveProperty(['items', 0, 'item', 'description'], item.description)
    expect(result).toHaveProperty(['items', 0, 'item', 'image'], item.image)
    expect(result).toHaveProperty(['items', 0, 'item', 'price'], item.price)
  } else {
    expect(result).not.toHaveProperty(['items', 0, 'item'])
  }

  if (quantity !== null) {
    expect(result).toHaveProperty(['items', 0, 'meta', 'quantity'], quantity)
  } else {
    expect(result).not.toHaveProperty(['items', 0, 'meta', 'quantity'])
  }
}

function checkItem(result, item) {
  expect(result).toHaveProperty('item_code', item.item_code)
  expect(result).toHaveProperty('date', item.date)
  expect(result).toHaveProperty('name', item.name)
  expect(result).toHaveProperty('description', item.description)
  expect(result).toHaveProperty('image', item.image)
  expect(result).toHaveProperty('price', item.price)
}

async function modelFunctionParameterErrorExpect(fun, result) {
  const cases = [uuidv4(), new LoremIpsum().generateWords(1), null, undefined, '']

  for (let i = 0; i < cases.length; i += 1) {
    const res = await fun(cases[i])

    expect(res).toBe(result)
  }
}

async function controllerFunctionParametersError(request, resMock, fun, is_validate) {
  const cases = [uuidv4(), new LoremIpsum().generateWords(1), null, undefined, '']

  const req = { query: {} }
  let res = null

  for (let i = 0; i < cases.length; i += 1) {
    req.query[request] = cases[i]
    res = resMock()

    await fun(req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    if (is_validate && validate(req.query[request])) {
      expect(res.status).toHaveBeenCalledWith(404)
    } else {
      expect(res.status).toHaveBeenCalledWith(400)
    }
    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }))
  }
}

module.exports = {
  checkCart,
  checkItem,
  modelFunctionParameterErrorExpect,
  controllerFunctionParametersError
}
