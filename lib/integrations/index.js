const GitHub = require('./github')
const Heroku = require('./heroku')

module.exports = {
  github: new GitHub,
  heroku: new Heroku,
}
