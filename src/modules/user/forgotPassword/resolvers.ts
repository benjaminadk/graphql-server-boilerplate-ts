import * as bcrypt from 'bcryptjs'
import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { forgotPasswordLockAccount } from '../../../utils/forgotPasswordLockAccount'
import { EmailService } from '../../../services/EmailService'
import { forgotPasswordPrefix } from '../../../constants'
import { validator } from './validator'
import { expiredKey, userNotFound } from './errorMessages'
import { formatYupError } from '../../../utils/formatYupError'

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (_, { email }, { url, redis }) => {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return [{ path: 'email', message: userNotFound }]
      }

      await forgotPasswordLockAccount(user.id, redis)
      // TODO add frontend url

      const emailService = new EmailService()
      const link = await emailService.createForgotPasswordLink(url, user.id, redis)
      await emailService.sendMail('change password', user.email, link)

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
        await validator.validate({ newPassword }, { abortEarly: false })
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
