import * as yup from 'yup'

import { emailNotLongEnough, passwordNotLongEnough, invalidEmail } from './errorMessages'

export const validator = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(8, passwordNotLongEnough)
    .max(255)
})
