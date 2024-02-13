const Canny = require('./integrations/canny')
const GitHub = require('./integrations/github')
const Heroku = require('./integrations/heroku')
const Rollbar = require('./integrations/rollbar')
const Stripe = require('./integrations/stripe')

module.exports = {
  canny: new Canny,
  github: new GitHub,
  heroku: new Heroku,
  rollbar: new Rollbar,
  stripe: new Stripe
}
