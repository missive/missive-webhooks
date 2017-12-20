const Integration = require('../integration')

class Heroku extends Integration {
  process(payload, req) {
    var { app, user, url, head, git_log, release } = payload
    var message = []

    message.push(`${user} deployed version ${release || head} of ${this.link(url, app)}`)
    message.push(`${git_log}`)

    return {
      referenceId: app,
      subject: app,
      message: message.join('\n'),
    }
  }
}

module.exports = Heroku
