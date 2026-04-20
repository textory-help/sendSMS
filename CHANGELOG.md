# Changelog

All notable changes to the Textory Open API and its sample code are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). API versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Documentation for `/openapi/v1/messages/kakao` (Phase 2, Korea only).

## [v1.0.0] — 2026-04-20

### Added
- `POST /openapi/v1/messages/phone` — send via paired Textory phone app (any region).
- `POST /openapi/v1/messages/web` — web gateway SMS/LMS/MMS (Korea only, credit-deducted).
- `GET  /openapi/v1/messages/{id}` — retrieve a message and its delivery state.
- `GET  /openapi/v1/senders` — list registered sender numbers.
- `GET  /openapi/v1/account/balance` — current credit balance and monthly usage.
- OpenAPI 3.0 spec (`openapi.yaml`) and Postman collection.
- Language samples: cURL, Node.js, Python, Java, PHP, Go, Ruby.
