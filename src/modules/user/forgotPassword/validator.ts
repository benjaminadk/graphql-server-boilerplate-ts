import * as yup from 'yup'
import { passwordNotLongEnough } from './errorMessages'

export const validator = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, passwordNotLongEnough)
    .max(255)
})
