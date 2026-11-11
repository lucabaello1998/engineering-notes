# Un `console.log` en stdout rompe un servidor MCP por stdio

- Repo: [`lucabaello1998/mcp-direcciones-ar`](https://github.com/lucabaello1998/mcp-direcciones-ar)
- Commit: [`49350c3`](https://github.com/lucabaello1998/mcp-direcciones-ar/commit/49350c3a418c8b874be1a670f148ad257a0d012d)
- Tags: `mcp`, `node`, `stdio`, `json-rpc`

## Síntoma

Mientras armaba el servidor MCP, el cliente se quedaba esperando respuesta o recibía JSON inválido. A veces funcionaba, a veces no, dependiendo de si alguna ruta imprimía algo para "debuguear". El problema era imposible de ver en tests unitarios porque estos llamaban funciones sueltas, no el transporte.

## Causa

MCP sobre stdio habla JSON-RPC 2.0, un mensaje por línea, por `stdout`. Cualquier `console.log` intercala una línea que no es JSON y el cliente del otro lado falla al parsear. `stderr` existe exactamente para esto: diagnósticos que no contaminen el protocolo.

## Arreglo

Usar `console.error` para todo log y nunca `console.log` en el proceso servidor:

```javascript
// antes (rompe el protocolo)
console.log(`[${NOMBRE}] v${VERSION} escuchando por stdio`);

// después
console.error(`[${NOMBRE}] v${VERSION} escuchando por stdio`);
```

Además, el CI del mismo commit valida que `stdout` solo tenga las respuestas del protocolo:

```yaml
- name: "El servidor arranca y contesta el handshake"
  run: |
    printf '%s\n' \
      '{"jsonrpc":"2.0","id":1,"method":"initialize"...}' \
      '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
      | node server.js > salida.jsonl
    test "$(wc -l < salida.jsonl)" -eq 2
```

## Cómo lo detectás la próxima vez

- Levantar el servidor a mano por stdin y contar las líneas de stdout: tiene que haber una por respuesta y ninguna más.
- Agregar un test de transporte que compare `stdout` contra JSON válido.
- Nunca debuguear MCP con `console.log`; usar `console.error` o un log a archivo.
