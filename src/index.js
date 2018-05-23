const debug = require('debug')('temporary-mail')
import TenMinuteMailProvider from './providers/10minutemail'
import MailSuckerProvider from './providers/mailsucker'

const PROVIDERS = {
  '10minutemail': TenMinuteMailProvider,
  'mailsucker': MailSuckerProvider
}

const DEFAULT_OPTIONS = {
  provider: 'mailsucker',
  pollTimeout: 1000
}

class TemporaryMail {
  constructor (options) {
    options = {...DEFAULT_OPTIONS, ...options}

    this.provider = options.provider
    this.providerInstance = new PROVIDERS[options.provider]()
    this.pollTimeout = options.pollTimeout
  }

  getAddress () {
    debug(`Getting address from ${this.provider}`)
    return this.providerInstance.getAddress()
  }

  getMails () {
    debug(`Getting mail from ${this.provider}`)
    return this.providerInstance.getMails()
  }

  async pollTillSubject (subject) {
    while (true) {
      const messages = await this.getMails()
      debug(`Checking ${messages.length} messages for subject ${subject.toString()}`)

      const match = messages.find(x => x.subject.match(subject))

      if (match) {
        debug(`Matching message found`, match)
        return match
      }

      debug(`No matching message found, waiting for ${this.pollTimeout}ms`)
      await this._sleep(this.pollTimeout)
    }
  }

  _sleep (time) {
    return new Promise(resolve => setTimeout(() => resolve(), time))
  }
}

export default TemporaryMail
