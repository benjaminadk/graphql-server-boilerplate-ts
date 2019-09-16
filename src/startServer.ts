require('dotenv-safe').config()
import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import RateLimit from 'express-rate-limit'
import RateLimitRedisStore from 'rate-limit-redis'

import { connectTypeorm } from './utils/connectTypeorm'
import { genSchema } from './utils/genSchema'
import { redis } from './redis'
import { sessionPrefix, fifteenMinutes, oneWeek } from './constants'
import { confirmEmail } from './routes/confirmEmail'
import { connectTest } from './testUtils/connectTest'

const RedisStore = connectRedis(session as any)

export const startServer = async () => {
  if (process.env.NODE_ENV === 'test') {
    await redis.flushall()
  }

  const app = express()

  const server = new ApolloServer({
    schema: genSchema() as any,
    context: ({ req, res }) => ({
      redis,
      url: req ? req.protocol + '://' + req.get('host') : '',
      session: req.session,
      req,
      res
    })
  })

  app.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: fifteenMinutes,
      max: 100
    })
  )

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: sessionPrefix
      }),
      name: 'gsbp',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: oneWeek
      }
    } as any)
  )

  app.get('/confirm/:id', confirmEmail)

  if (process.env.NODE_ENV === 'test') {
    await connectTest(true)
  } else {
    await connectTypeorm()
  }

  const port = process.env.NODE_ENV === 'test' ? 0 : process.env.PORT
  const path = '/'
  const cors = {
    origin: process.env.NODE_ENV === 'test' ? '*' : (process.env.FRONTEND as string),
    credentials: true
  }

  server.applyMiddleware({ app, cors, path })

  return app.listen(port, () => console.log(`Server listening at http://localhost:${port}`))
}
