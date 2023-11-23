const Integration = require('../integration')

class Heroku extends Integration {
  get deprecated() { return true }
  get id() { return 'heroku' }

  process(payload, req) {
    var { app, user, url, head, git_log, release } = payload
    var pretext = this.sanitize(() => `${user} deployed version *${release || head}* of ${this.link(url, app)}`)

    return {
      references: [app],
      subject: app,
      notification: pretext.sanitized,
      attachment: {
        pretext: pretext.toString(),
        markdown: git_log,
        color: '#430098',
      }
    }
  }
}

module.exports = Heroku
