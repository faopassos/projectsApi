'use strict'

const crypto = require('crypto')
const Mail = use('Mail')
const User = use('App/Models/User')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('staff@gonode.io', 'Staff | GoNode')
            .subject('Password Recovery')
        }
      )
    } catch (err) {
      return response.status(err.status).send({ error: { message: 'Something wrong, email exists?' } })
    }
  }
}

module.exports = ForgotPasswordController
