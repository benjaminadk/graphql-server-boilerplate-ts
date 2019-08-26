import { ResolverMap } from '../../../types/graphql-utils'
import { User } from '../../../entity/User'
import { validator } from './validator'
import { formatYupError } from '../../../utils/formatYupError'
import { duplicateEmail } from './errorMessages'
import { EmailService } from '../../../services/EmailService'

export const resolvers: ResolverMap = {
  Mutation: {
    signup: async (_, args: GQL.ISignupOnMutationArguments, { redis, url }) => {
      try {
        await validator.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }

      const { email, password } = args

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

      const user = User.create({ email, password })

      await user.save()

      const emailService = new EmailService()
      const link = await emailService.createConfirmLink(url, user.id, redis)
      await emailService.sendMail('confirm', user.email, link)

      return null
    }
  }
}
