import * as yup from 'yup'

import { emailMin, nameMin, passwordMin, invalidEmail } from './errorMessages'

export const signupSchema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailMin)
    .max(255)
    .email(invalidEmail),
  name: yup
    .string()
    .min(3, nameMin)
    .max(255),
  password: yup
    .string()
    .min(8, passwordMin)
    .max(255)
})
