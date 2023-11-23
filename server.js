process.env.NODE_ENV || (process.env.NODE_ENV = 'development')
if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

const Atob = require('atob')
const BodyParser = require('body-parser')
const Express = require('express')
const Port = process.env.PORT || 8080
const Request = require('request')
const Rollbar = require('rollbar')
const Cors = require('cors')

const Integrations = require('.')

let app = Express()
app.disable('x-powered-by')
app.use(BodyParser.json({ limit: '10mb' }))
app.use(BodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(Cors())

app.use((req, res, next) => {
  res.header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'")
  res.header('X-Content-Type-Options', 'nosniff')
  res.header('X-Frame-Options', 'SAMEORIGIN')
  res.header('X-XSS-Protection', '1; mode=block')

  // Force HTTPS
  if (req.secure || req.header('X-Forwarded-Proto') == 'https') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    return next()
  }
  res.redirect(`https://${req.hostname}${req.url}`)
})

app.post('/:provider', (req, res) => {
  let { provider } = req.params
  let integration, base64JSON = req.query.t

  let notFound = () => {
    res.status(404).send(`Integration not found: ${provider}`)
  }

  if (!base64JSON) {
    return notFound()
  }

  let data = null
  try {
    data = JSON.parse(Atob(base64JSON))
  } catch (e) {
    return notFound()
  }

  let { token, options } = data
  options || (options = {})

  if (integration = Integrations[provider]) {
    let { references, subject, color, update_existing_conversation_subject, attachment, attachments, text, markdown, notification } = integration.process(req.body, req, data[provider]) || {}
    if (attachment) attachments = [attachment]

    if (references && (text || markdown || attachments)) {
      options.references = references.map((ref) => `<${provider}/${ref}@missive-integrations>`)
      options.conversation_subject = subject
      options.conversation_color = color
      options.update_existing_conversation_subject = update_existing_conversation_subject || false
      options.username = integration.name
      options.username_icon = integration.avatar
      options.conversation_icon = integration.icon
      options.text = text
      options.markdown = markdown
      options.attachments = attachments
      options.notification = {
        title: subject,
        body: notification,
      }

      return Request.post({
        baseUrl: process.env.MISSIVE_API_BASE_URL,
        uri: '/posts',
        json: { posts: options },
        auth: { bearer: token }
      }).pipe(res)
    }

    return res.status(200).send('Event type not implemented')
  }

  notFound()
})

app.post('/', (req, res) => {
  res.send('Pong')
})

app.get('/', (req, res) => {
  res.send(`
    <style>
      * {
        margin: 0; padding: 0;
        box-sizing: border-box;
      }

      body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      span {
        font-size: 10em;
      }
    </style>

    <body>
      <span>🖖</span>
    </body>
  `)
})

app.get('/integrations', (req, res) => {
  let integrations = {}

  for (let provider in Integrations) {
    let integration = Integrations[provider]
    if (integration.deprecated) continue

    integrations[provider] = integration.toJSON()
  }

  res.send(integrations)
})

app.get('*', (req, res) => {
  res.status(404).send('Not Found')
})

// Rollbar
// Must be added after all routes are registered
if (process.env.ROLLBAR_SERVER_ACCESS_TOKEN) {
  let rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

  app.use(rollbar.errorHandler())
  rollbar.handleUncaughtExceptions()
}

app.listen(Port, () => {
  console.log(`Missive Webhooks listening on port ${Port}`)
})
