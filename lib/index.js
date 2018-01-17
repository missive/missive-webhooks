const GitHub = require('./integrations/github')
const Heroku = require('./integrations/heroku')
const Rollbar = require('./integrations/rollbar')

module.exports = {
  github: new GitHub,
  heroku: new Heroku,
  rollbar: new Rollbar,
}
