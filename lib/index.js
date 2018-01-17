let fs = require('fs')
let path = require('path')

const INTEGRATIONS = path.join(__dirname, 'integrations')

for (let filename of fs.readdirSync(INTEGRATIONS)) {
  if (!/\.js$/.test(filename)) { continue }

  let integrationPath = path.join('integrations', filename)
  let name = path.basename(integrationPath, path.extname(integrationPath))

  let Klass = require(`./${integrationPath}`)
  module.exports[name] = new Klass
}
