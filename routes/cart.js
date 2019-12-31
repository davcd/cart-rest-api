const CartController = require('../controllers/cart')
const ItemController = require('../controllers/item')

exports.routesConfig = app => {
  app.post('/cart/', [CartController.createCart])
  app.get('/cart/', [CartController.validateCart, CartController.getCart])
  app.delete('/cart/', [CartController.validateCart, CartController.removeCart])

  app.get('/cart/items', [CartController.validateCart, CartController.getCartItems])
  app.post('/cart/items', [
    CartController.validateCart,
    ItemController.validateItem,
    CartController.validateCartItemMeta,
    CartController.modifyCartItem
  ])
}
