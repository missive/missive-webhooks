const Integration = require('../integration')

const COLORS = {
  occurrence: '#c00',
  resolved: '#009e61',
}

class Rollbar extends Integration {
  process(payload, req, options) {
    let { event_name, data } = payload
    this.options = options || {}

    if (this[event_name]) {
      return this[event_name](data)
    }
  }

  // Supported event types
  test(payload) {
    return { references: ['test'] }
  }

  deploy(payload) {
    let { deploy } = payload
  }

  exp_repeat_item(payload) {
    let { item, occurrences } = payload
  }

  item_velocity(payload) {
    let { item } = payload
  }

  new_item(payload) { /* NOOP */ }

  occurrence(payload) {
    let { item } = payload
    let { title } = item
    let text = this.sanitize(() => `${title.replace('\n', '')}\n${this.linksForItem(item, true)}`)

    return {
      references: [item.id],
      subject: this.subjectForItem(item),
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.occurrence,
      }
    }
  }

  reactivated_item(payload) { /* NOOP */ }
  reopened_item(payload) { /* NOOP */ }

  resolved_item(payload) {
    let { item } = payload
    let { title } = item
    let text = this.sanitize(() => `${title.replace('\n', '')}\n${this.linksForItem(item)}`)

    return {
      references: [item.id],
      subject: this.subjectForItem(item),
      notification: text.sanitized,
      attachment: {
        color: COLORS.resolved,
        text: text.toString(),
      }
    }
  }

  // Helpers
  subjectForItem(item) {
    let { title, environment } = item

    return `${title} [${environment}]`
  }

  linksForItem(item, occurrence) {
    let { counter, last_occurrence_id } = item

    let baseURL = `https://rollbar.com/${this.options.account}/${this.options.project}`
    let itemURL = `${baseURL}/items/${counter}`

    if (occurrence) {
      let occurrenceURL = `${itemURL}/occurrences/${last_occurrence_id}`
      return `${this.link(itemURL)} (${this.link(occurrenceURL, 'Occurence')})`
    } else {
      return this.link(itemURL)
    }
  }
}

module.exports = Rollbar
