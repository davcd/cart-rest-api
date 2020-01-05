const ItemController = require('../controllers/item')

function routesConfig(app) {
  app.post('/item/', [ItemController.createItem])
  app.get('/item/', [ItemController.validateItemCode, ItemController.getItem])
}

module.exports = { routesConfig }
