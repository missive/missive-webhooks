process.env.NODE_ENV || (process.env.NODE_ENV = 'development')
if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

const Atob = require('atob')
const BodyParser = require('body-parser')
const Express = require('express')
const Port = process.env.PORT || 8080
const Request = require('request')

const Integrations = require('.')

let app = Express()
app.use(BodyParser.json({ limit: '10mb' }))
app.use(BodyParser.urlencoded({ extended: true, limit: '10mb' }))

app.post('/:provider', (req, res) => {
  let { provider } = req.params
  let integration, base64JSON = req.query.t

  let data = JSON.parse(Atob(base64JSON))
  let { token, options } = data
  options || (options = {})

  if (integration = Integrations[provider]) {
    let { references, subject, update_existing_conversation_subject, attachment, attachments, text, markdown, notification } = integration.process(req.body, req, data[provider]) || {}
    if (attachment) attachments = [attachment]

    if (references && (text || markdown || attachments)) {
      options.references = references.map((ref) => `<${provider}/${ref}@missive-integrations>`)
      options.conversation_subject = subject
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

  res.status(404).send(`Integration not found: ${provider}`)
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
    integrations[provider] = integration.toJSON()
  }

  res.send(integrations)
})

app.listen(Port, () => {
  console.log(`Missive Integrations listening on port ${Port}`)
})
