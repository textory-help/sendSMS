<?php
// Send an SMS via paired phone (global).
//   TEXTORY_API_KEY=sk_live_... php send_phone.php

declare(strict_types=1);

$apiKey = getenv('TEXTORY_API_KEY');
if (!$apiKey) {
    fwrite(STDERR, "export TEXTORY_API_KEY=sk_live_...\n");
    exit(1);
}

$payload = [
    'clientId'   => vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4)),
    'contents'   => 'Hi {{name}}, your verification code is 917043.',
    'recipients' => [
        ['phoneNumber' => '+14155551234', 'name' => 'Alice'],
    ],
];

$ch = curl_init('https://openapi.textory.io/openapi/v1/messages/phone');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 400 && $status !== 409) {
    fwrite(STDERR, "❌ HTTP $status\n$response\n");
    exit(1);
}

echo "✅ $response\n";
