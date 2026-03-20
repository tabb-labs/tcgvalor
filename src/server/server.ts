import express from 'express'
import path from 'path'
import ControllerRegistry from './ControllerRegistry'
import { auth } from 'express-openid-connect'
import { auth0Config } from './clients/Auth0/auth0Config'
import bodyParser from 'body-parser'
import Store from './StoreRegistry'
import CronJobs from './CronJobRegistry'
import Logger from './logger'
import Honeybadger from '@honeybadger-io/js'
import { ENV } from './env'
import { exceptionMiddleware } from './http/exceptionMiddleware'
import { responseExtensions } from './http/responseExtensions'
import { currentUserMiddleware } from './http/currentUserMiddleware'

const app = express()
const port = process.env.PORT || 3000

Honeybadger.configure({
  apiKey: ENV.HONEY_BADGER(),
  environment: ENV.ID,
})

app.use(auth(auth0Config))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(responseExtensions)
app.use(express.static(`${__dirname}/public`))
app.use('/api', currentUserMiddleware, ControllerRegistry)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get('/signup', async (req, res) => {
  await res.oidc.login({ authorizationParams: { screen_hint: 'signup' } })
})

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.use(exceptionMiddleware)

app.listen(port, () => {
  Logger.info(`Server is listening on port ${port}`)
})

Store.init()
  .then(() => Logger.info('Stores data loaded'))
  .catch((e) => {
    Logger.info('Error in initialize stores')
    Logger.error(e)
  })

CronJobs.initialLoad()
CronJobs.start()
