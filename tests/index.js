import TemporaryMail from '../src'

async function test () {
  const tmpMail = new TemporaryMail()
  const address = await tmpMail.getAddress()
  console.log('Address: ' + address)
  console.log('Waiting for mail with subject "TESTING"')
  const mail = await tmpMail.pollTillSubject('TESTING')
  console.log(mail)
}

test()
