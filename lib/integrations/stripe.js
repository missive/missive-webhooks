const Integration = require('../integration')

const EVENT_CALLBACKS = {
  'ping': 'ping',
  'charge.failed': 'charge_failed',
  'charge.refunded': 'charge_refunded',
  'charge.succeeded': 'charge_succeeded',
  'transfer.created': 'transfer_created'
}

class Stripe extends Integration {
  get id() { return 'stripe' }

  process(payload, req) {
    let type = payload.type
    let callback = EVENT_CALLBACKS[type]
    if (this[callback]) {
      return this[callback](payload.data.object)
    }
  }

  // Callbacks
  ping (payload) {
    return { references: ['pong'] }
  }

  charge_failed (payload) {
    var { amount, currency, customer } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A charge of ${converted_amount} has failed`)

    return {
      references: [customer],
      subject: 'Transfer created',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  charge_refunded (payload) {
    var { amount, amount_refunded, currency, customer, refunded } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var converted_amount_refunded = this.convert_currency(amount, currency)
    var text

    if (refunded) {
      text = this.sanitize(() => `A charge of ${converted_amount} has been fully refunded`)
    } else {
      text = this.sanitize(() => `A charge of ${converted_amount} has been partially refunded`)
    }

    return {
      references: [customer],
      subject: 'Transfer created',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  charge_succeeded (payload) {
    var { amount, currency, customer } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A charge of ${converted_amount} has been successfully completed`)

    return {
      references: [customer],
      subject: 'Transfer created',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  transfer_created (payload) {
    var { amount, currency, destination } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A transfer of ${converted_amount} has been created`)

    return {
      references: [destination],
      subject: 'Transfer created',
      notification: text.sanitized,
      text: text.toString()
    }
  }
  // Callbacks

  // Helpers
  convert_currency (amount, currency) {
    var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency })
    return formatter.format(amount)
  }
  // Helpers
}

module.exports = Stripe
