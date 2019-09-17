import open from 'open'

import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { signupSchema } from './signupSchema'
import { formatYupError } from '../../../utils/formatYupError'
import { duplicateEmail } from './errorMessages'
import { sendEmail } from '../../../utils/sendEmail'
import { createConfirmLink } from './createConfirmLink'

export const resolvers: ResolverMap = {
  Mutation: {
    signup: async (_, args, { redis, url }) => {
      try {
        await signupSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }

      const { email, name, password } = args

      const userExists = await User.findOne({
        where: { email },
        select: ['id']
      })

      if (userExists) {
        return [
          {
            path: 'email',
            message: duplicateEmail
          }
        ]
      }

      const user = User.create({ email, name, password })

      await user.save()

      if (process.env.NODE_ENV !== 'test') {
        await sendEmail(user.email, 'Confirm Email', await createConfirmLink(url, user.id, redis))
      }

      if (process.env.NODE_ENV === 'development') {
        await open(process.env.EMAIL_INBOX as string)
      }

      return null
    }
  }
}
