const fs = require('fs')
const path = require('path')

fs.readdirSync(path.join(__dirname, 'lib', 'integrations')).forEach((filename) => {
  var integration = filename.split('.')[0]
  module.exports[integration] = require('./lib/integrations/' + integration)
})
