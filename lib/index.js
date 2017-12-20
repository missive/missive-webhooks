const GitHub = require('./integrations/github')
const Heroku = require('./integrations/heroku')

module.exports = {
  github: new GitHub,
  heroku: new Heroku,
}
