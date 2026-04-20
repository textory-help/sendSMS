// Send an SMS through Textory's Korean web gateway. Sender must be pre-registered.
//   export TEXTORY_SENDER=+821098765432
//   node send-web.js

import { TextoryClient } from './client.js';

const apiKey = process.env.TEXTORY_API_KEY;
const sender = process.env.TEXTORY_SENDER;
if (!apiKey || !sender) {
  console.error('Set TEXTORY_API_KEY and TEXTORY_SENDER.');
  process.exit(1);
}

const tx = new TextoryClient(apiKey);

try {
  const result = await tx.sendWeb({
    sender,
    recipients: [{ phoneNumber: '+821012345678' }],
    contents: '배송이 시작되었습니다. 감사합니다.',
  });

  console.log('✅ Sent:', JSON.stringify(result, null, 2));
} catch (err) {
  if (err.response) {
    console.error(`❌ ${err.response.status}:`, JSON.stringify(err.response.data, null, 2));
  } else {
    console.error('❌ Network error:', err.message);
  }
  process.exit(1);
}
