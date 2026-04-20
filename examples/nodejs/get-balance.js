import { TextoryClient } from './client.js';

const apiKey = process.env.TEXTORY_API_KEY;
if (!apiKey) { console.error('export TEXTORY_API_KEY=sk_live_...'); process.exit(1); }

const tx = new TextoryClient(apiKey);
const { data } = await tx.getBalance();
console.log(`Credit balance: ₩${data.balanceKrw.toLocaleString()}`);
console.log(`This month — SMS: ${data.monthlySentSms}, LMS: ${data.monthlySentLms}, MMS: ${data.monthlySentMms}, Kakao: ${data.monthlySentKakao}`);
