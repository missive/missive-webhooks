class Integration {
  link(url, label) {
    if (this.sanitizing) {
      return label || url
    }

    return `<${url}|${label || url}>`
  }

  codeLink(url, label) {
    return this.link(url, `\`${label}\``)
  }

  sanitize(callbacks) {
    if (!Array.isArray(callbacks)) callbacks = [callbacks]

    let chunks = []
    let sanitizedChunks = []

    let exec = () => {
      return callbacks.map((cb) => cb()).join('')
    }

    let string = new String(exec())
    string.callbacks = callbacks
    string.add = (callback) => {
      return this.sanitize(string.callbacks.concat(callback))
    }

    this.sanitizing = true
    string.sanitized = exec()
    this.sanitizing = false

    return string
  }
}

module.exports = Integration
