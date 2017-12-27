const Integration = require('../integration')

class Heroku extends Integration {
  process(payload, req) {
    var { app, user, url, head, git_log, release } = payload

    return {
      referenceId: app,
      subject: app,
      attachment: {
        pretext: `${user} deployed version ${release || head} of ${this.link(url, app)}.`,
        text: git_log,
      }
    }
  }
}

module.exports = Heroku
