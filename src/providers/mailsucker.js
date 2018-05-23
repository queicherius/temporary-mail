const debug = require('debug')('temporary-mail/mailsucker.net')
import fetch from 'node-fetch'

const BASE_URL = 'https://api.mailsucker.net'

async function request (url) {
  const response = await fetch(url)
  return response.json()
}

class MailSuckerProvider {
  constructor () {
    this.address = Math.round(Math.random() * 1000000) + '@mailsucker.net'
  }

  async getAddress () {
    return this.address
  }

  async getMails () {
    debug(`Requesting mails`)
    let content = await request(`${BASE_URL}/inbox/get/${this.address}`)

    return content.data.map(email => {
      const subject = email.subject
      const from = email.from[0].value[0].address
      const body = email.html

      return {subject, from, body}
    })
  }
}

export default MailSuckerProvider
