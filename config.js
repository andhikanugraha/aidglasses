config = module.exports = {
  development: {
    secret: 'aidglasses',
    port: 3000
  },
  production: {
    secret: process.env.SECRET,
    port: process.env.PORT || 80
  }
}