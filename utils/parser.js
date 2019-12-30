function cleanArray(array) {
  return array.map(value => {
    // eslint-disable-next-line no-use-before-define
    return cleanObject(value)
  })
}

function cleanObject(object) {
  const o = object
  Object.entries(o).forEach(([key]) => {
    if (key === '_id') {
      delete o[key]
    } else if (Array.isArray(o[key])) {
      o[key] = cleanArray(o[key])
    } else if (o[key] !== null && typeof o[key] === 'object') {
      o[key] = cleanObject(o[key])
    }
  })
  return o
}

function cleanResult(result) {
  let res = result.toObject()
  if (Array.isArray(res)) {
    res = cleanArray(res)
  } else if (res !== null && typeof res === 'object') {
    res = cleanObject(res)
  }
  return res
}
module.exports = {
  cleanResult
}
