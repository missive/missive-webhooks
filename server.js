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
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))

app.post('/:provider', (req, res) => {
  let { provider } = req.params
  let integration, base64JSON = req.query.t

  let { token, options } = JSON.parse(Atob(base64JSON))

  if (integration = Integrations[provider]) {
    let { references, subject, update_existing_conversation_subject, attachment, attachments, text, markdown, notification } = integration.process(req.body, req) || {}
    if (attachment) attachments = [attachment]

    let meta = {
      username: integration.name || integration.constructor.name,
      username_icon: integration.avatar || `https://raw.githubusercontent.com/missive/missive-integrations/master/assets/integrations/${provider}.png`,
      text, markdown, attachments,
      notification: { title: subject, body: notification },
    }

    if (references && meta.text || meta.markdown || meta.attachments) {
      options.references = references.map((ref) => `<${provider}/${ref}@missive-integrations>`)
      options.conversation_subject = subject
      options.update_existing_conversation_subject = update_existing_conversation_subject || false
      options.meta = meta

      return Request.post({
        baseUrl: process.env.MISSIVE_API_BASE_URL,
        uri: '/posts',
        json: { post: options },
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

app.listen(Port, () => {
  console.log(`Missive Integrations listening on port ${Port}`)
})
