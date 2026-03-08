import 'dotenv/config'
import { sendPasswordResetEmail } from '../src/utils/mailer.js'

async function run() {
  try {
    const res = await sendPasswordResetEmail('test@example.com', 'dev-token-123', new Date(Date.now() + 3600 * 1000))
    console.log('Result:', res)
    if (res && res.previewUrl) console.log('Preview URL:', res.previewUrl)
  } catch (err) {
    console.error('Error sending test email', err)
    process.exit(1)
  }
}

run()
