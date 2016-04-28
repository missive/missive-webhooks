const Integration = require('../integration')

class Heroku extends Integration {
  process(payload, req) {
    var { app, user, url, head, git_log, release } = payload
    var html

    html  = `${user} deployed version ${release || head} of ${this.link(url, app)}`
    html += `<p>${git_log}</p>`

    return {
      referenceId: app,
      subject: app,
      html: html,
    }
  }
}

module.exports = Heroku
