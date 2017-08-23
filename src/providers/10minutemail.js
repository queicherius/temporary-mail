const debug = require('debug')('temporary-mail/10minutemail.net')
import fetch from 'node-fetch'
import execall from 'execall'
import cheerio from 'cheerio'

const BASE_URL = 'https://10minutemail.net'

async function request (url, session) {
  let headers = {}

  if (session) {
    headers = {
      cookie: `PHPSESSID=${session}; lang=en`
    }
  }

  const response = await fetch(url, {headers})
  return response.text()
}

class TenMinuteMailProvider {
  constructor () {
    this.cache = {}
  }

  async getAddress () {
    debug(`Requesting address`)
    const response = await fetch(`${BASE_URL}`)

    // Get the session id
    const cookies = response.headers._headers['set-cookie']
    const session = cookies.join('').match(/PHPSESSID=([^;]*);/)[1]

    this.session = session
    debug(`Parsed session id`, session)

    // Parse out the address
    const content = await response.text()
    let permalink = content.match(/var permalink = '([^']*)'/)[1]
    permalink = JSON.parse(new Buffer(permalink, 'base64').toString('binary'))

    this.address = permalink.mail
    debug(`Parsed address`, permalink.mail)

    return this.address
  }

  async getMails () {
    debug(`Requesting mail overview`)
    let content = await request(`${BASE_URL}/mailbox.ajax.php`, this.session)

    let messageIds = execall(/"readmail\.html\?mid=([^"]*)"/g, content)
      .map(x => x.sub[0])
      .filter(x => x !== 'welcome')

    debug(`Requesting mail content for ${messageIds.length} message ids`)
    return Promise.all(messageIds.map((x) => this.getMail(x)))
  }

  async getMail (messageId) {
    if (this.cache[messageId]) {
      return this.cache[messageId]
    }

    debug(`Requesting mail content for ${messageId}`)
    const content = await request(`${BASE_URL}/readmail.html?mid=${messageId}`, this.session)

    const $ = cheerio.load(content, {decodeEntities: false})
    const subject = $('.tab_container .mail_header h2').text()
    const from = $('.tab_container .mail_header .mail_from').text().replace(/ \(.*\)/, '')
    const body = $('.tab_container #tab1 .mailinhtml').html()

    debug(`Parsed mail ${messageId}`, {subject, from, body})
    this.cache[messageId] = {subject, from, body}
    return this.cache[messageId]
  }
}

export default TenMinuteMailProvider
