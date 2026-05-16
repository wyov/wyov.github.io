---
title: Curl CheatSheet
date: 
tags:
  - linux
  - windows
  - web
description: none
---


`curl` es una herramienta de línea de comandos para realizar peticiones HTTP/HTTPS y transferir datos.

Disponible por defecto en:
- Linux
- macOS
- Windows 10/11 recientes

---

## Sintaxis Básica

```bash
curl [flags] URL
```

Ejemplo:

```bash
curl https://google.com
```

---

## Entendiendo Flags Comunes

`-I`

Realiza una petición `HEAD`.

Solo devuelve headers HTTP, no el body.

```bash
curl -I https://google.com
```

Útil para:
- verificar status code
- revisar redirects
- ver headers de seguridad
- fingerprinting básico

---

`-i`

Muestra headers + body.

```bash
curl -i https://google.com
```

Diferencia importante:

```bash
-I != -i
```

| Flag | Resultado |
|---|---|
| `-I` | Solo headers |
| `-i` | Headers + contenido |

---

`-v`

Verbose mode.

Muestra:
- handshake TLS
- resolución DNS
- request completa
- response headers
- detalles de conexión

```bash
curl -v https://google.com
```

Muy usado para debugging.

---

`-k`

Ignora errores SSL/TLS.

```bash
curl -k https://google.com
```

Útil en:
- laboratorios
- debugging TLS
- entornos internos

---

`-L`

Sigue redirects automáticamente.

```bash
curl -L https://google.com
```

Sin `-L`, curl NO sigue redirects por defecto.

---

`-s`

Silent mode.

Oculta:
- barra de progreso
- errores visuales innecesarios

```bash
curl -s https://google.com
```

Muy usado en scripting.

---

## Flags Sensibles a Mayúsculas

Curl distingue mayúsculas y minúsculas.

```bash
-I != -i
-O != -o
-X != -x
```

---

`-O`

Guarda archivo usando el nombre remoto.

```bash
curl -O https://google.com
```

Resultado:
- se descarga usando el nombre remoto si existe

---

`-o`

Guarda usando un nombre custom.

```bash
curl -o output.html https://google.com
```

---

`-X`

Especifica método HTTP.

```bash
curl -X POST https://google.com
```

---

`-x`

Usa un proxy.

```bash
curl -x http://127.0.0.1:8080 https://google.com
```

SOCKS5:

```bash
curl --socks5 127.0.0.1:9050 https://google.com
```

---

## Combinaciones Comunes

### Recon rápido

```bash
curl -IvkLs https://google.com
```

### Explicación

| Flag | Significado |
|---|---|
| `-I` | Solo headers |
| `-v` | Verbose |
| `-k` | Ignorar SSL |
| `-L` | Follow redirects |
| `-s` | Silent |

Muy útil para:
- revisar redirects
- ver headers
- debugging HTTP/TLS
- entender respuestas web

---

### Debug Web

```bash
curl -kvL https://google.com
```

---

### Ver Headers Rápidamente

```bash
curl -sk https://google.com -D -
```

`-D -` imprime headers en stdout.

---

## Requests POST

### POST Simple

```bash
curl -X POST https://google.com
```

---

### POST JSON

```bash
curl -X POST https://google.com \
  -H "Content-Type: application/json" \
  -d '{"user":"admin","pass":"test"}'
```

---

## Headers HTTP

Agregar headers custom:

```bash
curl -H "Authorization: Bearer TOKEN" \
     -H "X-Test: value" \
     https://google.com
```

---

## Cookies

Guardar cookies:

```bash
curl -c cookies.txt https://google.com
```

Usar cookies:

```bash
curl -b cookies.txt https://google.com
```

---

## Basic Authentication

```bash
curl -u admin:password https://google.com
```

---

## User-Agent

```bash
curl -A "Mozilla/5.0" https://google.com
```

---

## Upload de Archivos

```bash
curl -F "file=@test.txt" https://google.com
```

---

## Descargar Contenido

```bash
curl -O https://google.com
```

---

## Obtener Solo Status Code

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://google.com
```

---

## Windows

En PowerShell puede ser mejor usar:

```powershell
curl.exe https://google.com
```

Porque `curl` puede estar aliasado a `Invoke-WebRequest`.

---

## Quick Testing

Request básica:

```bash
curl https://google.com
```

Ver headers:

```bash
curl -I https://google.com
```

Verbose mode:

```bash
curl -v https://google.com
```

Test TCP simple:

```bash
curl -v telnet://google.com:443
```

---

## Flags Más Utilizadas

| Flag | Uso |
|---|---|
| `-I` | Headers only |
| `-i` | Headers + body |
| `-v` | Verbose |
| `-k` | Ignore SSL |
| `-L` | Follow redirects |
| `-s` | Silent |
| `-H` | Add header |
| `-d` | Send data |
| `-X` | HTTP method |
| `-u` | Basic auth |
| `-A` | User-Agent |
| `-O` | Save remote filename |
| `-o` | Save custom filename |
| `-x` | HTTP proxy |
