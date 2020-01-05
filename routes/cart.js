const CartController = require('../controllers/cart')
const ItemController = require('../controllers/item')

function routesConfig(app) {
  app.post('/cart/', [CartController.createCart])
  app.get('/cart/', [CartController.validateCartCode, CartController.getCart])
  app.delete('/cart/', [CartController.validateCartCode, CartController.removeCart])

  app.get('/cart/items', [CartController.validateCartCode, CartController.getCartItems])
  app.post('/cart/items', [
    CartController.validateCartCode,
    ItemController.validateItemCode,
    CartController.validateCartItemMeta,
    CartController.modifyCartItem
  ])
}

module.exports = { routesConfig }
