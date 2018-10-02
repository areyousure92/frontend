import { Ok } from '@es2/option-result'

import { userRegister, userLogin, userSessionDrop } from '../../commands/user'
import { validate } from '../middlewares/validate'
import { authenticated } from '../middlewares/auth'
import { authScheme, sessionDropSchema } from '../schemes/account'


const register = (ctx) => userRegister(ctx.request.body)
const login = (ctx) => userLogin(ctx.request.body)
const me = (ctx) => Ok({ id: ctx.user.$loki, email: ctx.user.email, token: ctx.auth.token })
const drop = (ctx) => userSessionDrop(ctx.user, ctx.request.body.token)

export const accountApi = (account) => {
  account.post(validate(authScheme), register)

  account.scope('session', (session) => {
    session.get(authenticated(), me)
    session.post(validate(authScheme), login)
    session.delete(authenticated(), validate(sessionDropSchema), drop)
  })
}
