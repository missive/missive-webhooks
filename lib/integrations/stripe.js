const Integration = require('../integration')

const EVENT_CALLBACKS = {
  'ping': 'ping',
  'charge.failed': 'charge_failed',
  'charge.refunded': 'charge_refunded',
  'charge.succeeded': 'charge_succeeded',
  'charge.dispute.closed': 'charge_dispute_closed',
  'charge.dispute.created': 'charge_dispute_created',
  'charge.dispute.updated': 'charge_dispute_updated',
  'customer.created': 'customer_created',
  'customer.deleted': 'customer_deleted',
  'customer.subscription.created': 'customer_subscription_created',
  'customer.subscription.deleted': 'customer_subscription_deleted',
  'customer.subscription.updated': 'customer_subscription_updated',
  'invoice.created': 'invoice_created',
  'invoice.payment_failed': 'invoice_payment_failed',
  'invoice.payment_succeeded': 'invoice_payment_succeeded',
  'transfer.created': 'transfer_created'
}

class Stripe extends Integration {
  get id() { return 'stripe' }
  // Temporary
  get avatar() { return `https://raw.githubusercontent.com/flehoux/missive-webhooks/stripe/assets/integrations/stripe.png` }
  get icon() { return `https://raw.githubusercontent.com/flehoux/missive-webhooks/stripe/assets/integrations/stripe.png` }
  // Temporary

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
    var { amount, currency, customer, id } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A charge of ${converted_amount} has failed`)

    return {
      references: [customer, id],
      subject: 'Charge failed',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  charge_refunded (payload) {
    var { amount, amount_refunded, currency, customer, id, refunded } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var converted_amount_refunded = this.convert_currency(amount_refunded, currency)
    var text

    if (refunded) {
      text = this.sanitize(() => `A charge of ${converted_amount} has been fully refunded`)
    } else {
      text = this.sanitize(() => `A charge of ${converted_amount} has been partially refunded`)
    }

    return {
      references: [customer, id],
      subject: 'Charge refunded',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Refunded_: **${converted_amount_refunded}**`
      }
    }
  }

  charge_succeeded (payload) {
    var { amount, currency, customer, id } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A charge of ${converted_amount} was successful`)

    return {
      references: [customer, id],
      subject: 'Charge succeeded',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  charge_dispute_closed (payload) {
    var { amount, currency, charge, reason, status } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A dispute of ${converted_amount} has been closed`)

    return {
      references: [charge],
      subject: 'Dispute closed',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Reason_: **${reason}**, _Status_: **${status}**`
      }
    }
  }

  charge_dispute_created (payload) {
    var { amount, currency, charge, reason, status } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A dispute of ${converted_amount} has created`)

    return {
      references: [charge],
      subject: 'Dispute created',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Reason_: **${reason}**, _Status_: **${status}**`
      }
    }
  }

  charge_dispute_updated (payload) {
    var { amount, currency, charge, reason, status } = payload
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `A dispute of ${converted_amount} has been updated`)

    return {
      references: [charge],
      subject: 'Dispute updated',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Reason_: **${reason}**, _Status_: **${status}**`
      }
    }
  }

  customer_created (payload) {
    var { id, email } = payload
    var text = this.sanitize(() => `A customer has been created for ${email}`)

    return {
      references: [id, email],
      subject: 'Customer created',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  customer_deleted (payload) {
    var { id, email } = payload
    var text = this.sanitize(() => `Customer ${email} has been deleted`)

    return {
      references: [id, email],
      subject: 'Customer deleted',
      notification: text.sanitized,
      text: text.toString()
    }
  }

  customer_subscription_created (payload) {
    var { customer, plan, quantity, status } = payload
    var { nickname, amount, billing_scheme, currency } = plan
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `Customer's has subscribed to a plan`)

    if (billing_scheme === 'per_unit') {
      converted_amount = `${converted_amount} * ${quantity}`
    }

    return {
      references: [customer],
      subject: 'Subscription created',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Plan_: **${nickname}**, _Amount_: **${converted_amount}**, _Status_: **${status}**`
      }
    }
  }

  customer_subscription_deleted (payload) {
    var { customer, plan, quantity, status } = payload
    var { nickname, amount, billing_scheme, currency } = plan
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `Customer's subscription has ended`)

    if (billing_scheme === 'per_unit') {
      converted_amount = `${converted_amount} * ${quantity}`
    }

    return {
      references: [customer],
      subject: 'Subscription ended',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Plan_: **${nickname}**, _Amount_: **${converted_amount}**, _Status_: **${status}**`
      }
    }
  }

  customer_subscription_updated (payload) {
    var { customer, plan, quantity, status } = payload
    var { nickname, amount, billing_scheme, currency } = plan
    var converted_amount = this.convert_currency(amount, currency)
    var text = this.sanitize(() => `Customer's subscription has been updated`)

    if (billing_scheme === 'per_unit') {
      converted_amount = `${converted_amount} * ${quantity}`
    }

    return {
      references: [customer],
      subject: 'Subscription updated',
      notification: text.sanitized,
      attachment: {
        pretext: text.toString(),
        markdown: `_Plan_: **${nickname}**, _Amount_: **${converted_amount}**, _Status_: **${status}**`
      }
    }
  }

  invoice_created (payload) {
    var { customer, amount_due, currency, paid, invoice_pdf } = payload
    var converted_amount_due = this.convert_currency(amount_due, currency)
    var text = this.sanitize(() => `An invoice has been created`)

    var attachment = {
      pretext: text.toString(),
      markdown: `_Amount_: **${converted_amount_due}**, _Status_: **${paid ? 'Paid': 'Unpaid'}**`
    }

    if (invoice_pdf) {
      attachment['title'] = 'Invoice PDF'
      attachment['title_link'] = invoice_pdf
    }

    return {
      references: [customer],
      subject: 'Invoice created',
      notification: text.sanitized,
      attachment: attachment
    }
  }

  invoice_payment_failed (payload) {
    var { customer, amount_due, currency, paid, attempt_count, invoice_pdf } = payload
    var converted_amount_due = this.convert_currency(amount_due, currency)
    var text = this.sanitize(() => `An invoice payment attempt failed`)

    var attachment = {
      pretext: text.toString(),
      markdown: `_Amount_: **${converted_amount_due}**, _Status_: **${paid ? 'Paid': 'Unpaid'}**, _Attempts_: **${attempt_count}**`
    }

    if (invoice_pdf) {
      attachment['title'] = 'Invoice PDF'
      attachment['title_link'] = invoice_pdf
    }

    return {
      references: [customer],
      subject: 'Invoice paymend failed',
      notification: text.sanitized,
      attachment: attachment
    }
  }

  invoice_payment_succeeded (payload) {
    var { customer, amount_due, currency, paid, attempt_count, invoice_pdf } = payload
    var converted_amount_due = this.convert_currency(amount_due, currency)
    var text = this.sanitize(() => `An invoice payment attempt succeeded`)

    var attachment = {
      pretext: text.toString(),
      markdown: `_Amount_: **${converted_amount_due}**, _Status_: **${paid ? 'Paid': 'Unpaid'}**, _Attempts_: **${attempt_count}**`
    }

    if (invoice_pdf) {
      attachment['title'] = 'Invoice PDF'
      attachment['title_link'] = invoice_pdf
    }

    return {
      references: [customer],
      subject: 'Invoice paymend succeeded',
      notification: text.sanitized,
      attachment: attachment
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

  // Helpers
  convert_currency (amount, currency) {
    var formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency })
    return formatter.format(amount)
  }
}

module.exports = Stripe
