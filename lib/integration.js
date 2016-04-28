const marked = require('marked')

class Integration {
  markdownToHTML(markdown) {
    return marked(markdown)
  }

  link(url, label) {
    return `<a href="${url}">${label || url}</a>`
  }
}

module.exports = Integration
