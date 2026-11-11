# Nominatim público: 1 req/s, caché LRU y cola

- Repo: [`lucabaello1998/direcciones_ar`](https://github.com/lucabaello1998/direcciones_ar) / [`lucabaello1998/mcp-direcciones-ar`](https://github.com/lucabaello1998/mcp-direcciones-ar)
- Commit: [`27dbe33`](https://github.com/lucabaello1998/direcciones_ar/commit/27dbe335f05048ed46a70a5ab758b3d96db21e9b) / [`49350c3`](https://github.com/lucabaello1998/mcp-direcciones-ar/commit/49350c3a418c8b874be1a670f148ad257a0d012d)
- Tags: `api-publica`, `rate-limit`, `cache`, `dart`, `node`

## Síntoma

Al autocompletar direcciones argentinas, después de varios caracteres seguidos Nominatim devolvía `429 Too Many Requests` y el campo quedaba colgado. En el MCP server el problema era peor: varias herramientas podían pedir direcciones al mismo tiempo.

## Causa

La política de uso de Nominatim público pide **una request por segundo** y un `User-Agent` identificable. Sin control, el debounce del campo de texto no alcanza: el usuario tipea, borra y vuelve a tipear; dos componentes distintos llaman en paralelo.

## Arreglo

Tres mecanismos juntos:

1. **Serializar** las llamadas con una cola de promesas y un intervalo mínimo (1,1 s por defecto).
2. **Cachear** búsquedas y reversas en memoria con LRU.
3. **Identificar la app** con un `User-Agent` propio.

En Dart (`direcciones_ar`):

```dart
final _cacheBusquedas = LinkedHashMap<String, List<DireccionSugerida>>();
Future<void> _cola = Future.value();
DateTime _ultimaLlamada = DateTime.fromMillisecondsSinceEpoch(0);

Future<Object?> _pedir(Uri uri) async {
  await _esperarTurno();
  // ... request con headers['User-Agent']
}
```

En Node (`mcp-direcciones-ar`):

```javascript
async #pedir(url) {
  const turno = this.#cola.then(async () => {
    const desdeLaUltima = Date.now() - this.#ultimaLlamada;
    if (desdeLaUltima < this.intervaloMs) {
      await new Promise((listo) => setTimeout(listo, this.intervaloMs - desdeLaUltima));
    }
    this.#ultimaLlamada = Date.now();
  });
  this.#cola = turno.catch(() => {});
  await turno;
  // ... fetch
}
```

## Cómo lo detectás la próxima vez

- El test de intervalo mide que dos llamadas simultáneas estén separadas por al menos el tiempo configurado.
- Un test de cacheo verifica que la segunda búsqueda idéntica no salga a la red.
- Si ves `429` en producción, revisá que no haya dos instancias del cliente o que el intervalo no sea menor a 1 s.
