import * as bcrypt from 'bcryptjs'
import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { invalidCredentials, confirmEmailError, forgotPasswordLockedError } from './errorMessages'
import { userSessionIdPrefix } from '../../../services/redis'

const errorResponse = [
  {
    path: 'email',
    message: invalidCredentials
  }
]

export const resolvers: ResolverMap = {
  Mutation: {
    signin: async (
      _,
      { email, password }: GQL.ISigninOnMutationArguments,
      { session, redis, request }
    ) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return [
          {
            path: 'email',
            message: confirmEmailError
          }
        ]
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: 'email',
            message: forgotPasswordLockedError
          }
        ]
      }

      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return errorResponse
      }

      session.userId = user.id
      if (request.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, request.sessionID)
      }

      return null
    }
  }
}
