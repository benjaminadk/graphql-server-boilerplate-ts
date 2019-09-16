import bcrypt from 'bcryptjs'

import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { invalidCredentials, confirmEmail, lockedAccount } from './errorMessages'
import { userSessionIdPrefix } from '../../../constants'

const errorResponse = [
  {
    path: 'email',
    message: invalidCredentials
  }
]

export const resolvers: ResolverMap = {
  Mutation: {
    signin: async (_, { email, password }, { session, redis, req }) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return [
          {
            path: 'email',
            message: confirmEmail
          }
        ]
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: 'email',
            message: lockedAccount
          }
        ]
      }

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return errorResponse
      }

      session.userId = user.id
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
      }

      return null
    }
  }
}
