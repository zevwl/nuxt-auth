const bcrypt = require('bcrypt')

module.exports = {
  hash(str) {
    return bcrypt.hashSync(str, 8)
  },

  compare(str, hash) {
    return bcrypt.compareSync(str, hash)
  }
}
