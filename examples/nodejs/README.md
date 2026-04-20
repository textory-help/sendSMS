# Node.js examples

Requires Node.js ≥ 18 (ES modules, top-level `await`).

```bash
cd examples/nodejs
npm install
export TEXTORY_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxx

npm run phone     # send via paired phone (global)
npm run web       # send via Korean web gateway (requires TEXTORY_SENDER)
npm run balance   # check credit balance
```

## Files

- `client.js` — reusable client with automatic idempotent retries.
- `send-phone.js` — global Phone channel example.
- `send-web.js` — Korean Web channel example.
- `get-balance.js` — account balance query.

## Using the client in your app

```js
import { TextoryClient } from 'textory-sendsms-nodejs-examples/client.js';

const tx = new TextoryClient(process.env.TEXTORY_API_KEY);

// Idempotent — safe to retry with the same clientId.
const result = await tx.sendPhone({
  recipients: [{ phoneNumber: '+447911123456', name: 'Alice' }],
  contents: 'Hi {{name}}!',
  clientId: 'stable-request-id-from-your-app',
});
```

The client automatically adds a UUID `clientId` if you don't provide one, handles
`429 Retry-After` backoff, and retries `5xx` errors with exponential backoff while
preserving the `clientId` for server-side deduplication.
