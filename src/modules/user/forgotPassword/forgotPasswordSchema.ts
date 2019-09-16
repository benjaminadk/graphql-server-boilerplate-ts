import * as yup from 'yup'
import { passwordMin } from './errorMessages'

export const forgotPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, passwordMin)
    .max(128)
})
