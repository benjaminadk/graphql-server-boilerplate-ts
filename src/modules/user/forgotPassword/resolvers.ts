import bcrypt from 'bcryptjs'

import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { lockAccount } from './lockAccount'
import { sendEmail } from '../../../utils/sendEmail'
import { createForgotPasswordLink } from './createForgotPasswordLink'
import { forgotPasswordPrefix } from '../../../constants'
import { forgotPasswordSchema } from './forgotPasswordSchema'
import { expiredKey, userNotFound } from './errorMessages'
import { formatYupError } from '../../../utils/formatYupError'

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }, { url, redis }) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return [{ path: 'email', message: userNotFound }]
      }

      await lockAccount(user.id, redis)
      // TODO add frontend url

      await sendEmail(
        user.email,
        'Change Password',
        await createForgotPasswordLink(url, user.id, redis)
      )

      return true
    },

    forgotPasswordChange: async (_, { newPassword, key }, { redis }) => {
      const redisKey = `${forgotPasswordPrefix}${key}`

      const userId = await redis.get(redisKey)

      if (!userId) {
        return [
          {
            path: 'key',
            message: expiredKey
          }
        ]
      }

      try {
        await forgotPasswordSchema.validate({ newPassword }, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      const updatePromise = User.update(
        { id: userId },
        { forgotPasswordLocked: false, password: hashedPassword }
      )

      const deletePromise = redis.del(redisKey)

      await Promise.all([updatePromise, deletePromise])

      return null
    }
  }
}
