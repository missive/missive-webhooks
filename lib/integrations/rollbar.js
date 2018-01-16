const Integration = require('../integration')

const COLORS = {
  resolved: '#009e61',
  level: {
    critical: '#c00',
    error: '#c00',
    warning: '#ffc258',
    info: '#0093ce',
    debug: '#bab6b6',
  },
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
    let { title } = item
    let text = this.sanitize(() => `${occurrences}th occurrence: ${title.replace('\n', '')}\n${this.linksForItem(item)}`)

    return {
      references: [item.id],
      subject: item.title,
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.level.info,
      }
    }
  }

  item_velocity(payload) {
    let { item, trigger } = payload
    let { title } = item
    let text = this.sanitize(() => `${trigger.threshold} occurrences in ${trigger.window_size_description}: ${title.replace('\n', '')}\n${this.linksForItem(item)}`)

    return {
      references: [item.id],
      subject: item.title,
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.level.info,
      }
    }
  }

  new_item(payload) { /* NOOP */ }

  occurrence(payload) {
    let { item, occurrence } = payload
    let { title } = item
    let { version, person, client, level } = occurrence

    let text = this.sanitize(() => `${title.replace('\n', '')} (${this.capitalize(level)})\n${this.linksForItem(item, true)}`)
    let fields = []

    if (person) {
      fields.push({
        title: 'User',
        value: person.email,
        short: true,
      })
    }

    if (version) {
      fields.push({
        title: 'Version',
        value: version,
        short: true,
      })
    }

    return {
      references: [item.id],
      subject: item.title,
      notification: text.sanitized,
      attachment: {
        text: text.toString(),
        color: COLORS.level[level] || COLORS.level.error,
        fields: fields,
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
      subject: item.title,
      notification: text.sanitized,
      attachment: {
        color: COLORS.resolved,
        text: text.toString(),
      }
    }
  }

  // Helpers
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
