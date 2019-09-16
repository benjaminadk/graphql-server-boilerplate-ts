import { Connection } from 'typeorm'
import Redis from 'ioredis'
import faker from 'faker'

import { User } from '../../../entity/User'
import { TestClient } from '../../../utils/TestClient'
import { createForgotPasswordLink } from './createForgotPasswordLink'
import { lockAccount } from './lockAccount'
import { passwordMin } from '../signup/errorMessages'
import { expiredKey } from './errorMessages'
import { lockedAccount } from '../signin/errorMessages'
import { connectTest } from '../../../testUtils/connectTest'

export const redis = new Redis()

faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()
const newPassword = faker.internet.password()
let userId: string
let conn: Connection

beforeAll(async () => {
  conn = await connectTest()
  const user = await User.create({
    email,
    name,
    password,
    confirmed: true
  }).save()
  userId = user.id
})

afterAll(async () => {
  conn.close()
})

describe('forgot password', () => {
  test('make sure it works', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    await lockAccount(userId, redis)

    const url = await createForgotPasswordLink(process.env.TEST_HOST as string, userId, redis)
    const parts = url.split('/')
    const key = parts[parts.length - 1]

    expect(await client.signin(email, password)).toEqual({
      data: {
        signin: [
          {
            path: 'email',
            message: lockedAccount
          }
        ]
      }
    })

    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: passwordMin
          }
        ]
      }
    })

    const response = await client.forgotPasswordChange(newPassword, key)

    expect(response.data).toEqual({
      forgotPasswordChange: null
    })

    expect(await client.forgotPasswordChange(faker.internet.password(), key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKey
          }
        ]
      }
    })

    expect(await client.signin(email, newPassword)).toEqual({
      data: {
        signin: null
      }
    })
  })
})
