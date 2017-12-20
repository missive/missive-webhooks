class Integration {
  link(url, label) {
    return `<${url}|${label || url}>`
  }
}

module.exports = Integration
