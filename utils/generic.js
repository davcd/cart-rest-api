function checkAnyStringOfArrayContains(array, string) {
  let res = false
  for (let i = 0; i < array.length; i += 1) {
    if (array[i].includes(string)) {
      res = true
    }
  }
  return res
}
module.exports = {
  checkAnyStringOfArrayContains
}
