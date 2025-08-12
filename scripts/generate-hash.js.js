// scripts/generate-hash.js (version CommonJS)
const bcrypt = require('bcrypt')

const password = 'marie64'

bcrypt.hash(password, 10).then(hash => {
  console.log('Hash généré :', hash)
})
