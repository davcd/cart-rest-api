const ItemController = require('../controllers/item')

exports.routesConfig = app => {
  app.post('/item/', [ItemController.createItem])
  app.get('/item/', [ItemController.validateItem, ItemController.getItem])
}
