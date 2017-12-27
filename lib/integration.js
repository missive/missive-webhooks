class Integration {
  link(url, label) {
    return `<${url}|${label || url}>`
  }

  codeLink(url, label) {
    return this.link(url, `\`${label}\``)
  }
}

module.exports = Integration
