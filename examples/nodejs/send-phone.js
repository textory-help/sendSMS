// Send an SMS through the paired phone — works anywhere in the world.
//   node send-phone.js

import { TextoryClient } from './client.js';

const apiKey = process.env.TEXTORY_API_KEY;
if (!apiKey) {
  console.error('Missing TEXTORY_API_KEY. export TEXTORY_API_KEY=sk_live_...');
  process.exit(1);
}

const tx = new TextoryClient(apiKey);

try {
  const result = await tx.sendPhone({
    recipients: [
      { phoneNumber: '+14155551234', name: 'Alice' },
    ],
    contents: 'Hi {{name}}, your verification code is 917043.',
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
