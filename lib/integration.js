class Integration {
  get name() { return this.constructor.name }
  get avatar() { return `https://raw.githubusercontent.com/missive/missive-integrations/master/assets/integrations/${this.id}.png` }
  get icon() { return `https://raw.githubusercontent.com/missive/missive-integrations/master/assets/integrations/${this.id}.png` }
  get schema() { return { options: [] } }

  link(url, label) {
    if (this.sanitizing) {
      return label || url
    }

    if (label) {
      return `<${url}|${label}>`
    } else {
      return `<${url}>`
    }
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

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      icon: this.icon,
      schema: this.schema,
    }
  }
}

module.exports = Integration
