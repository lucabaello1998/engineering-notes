# engineering-notes

Cuaderno público de notas de ingeniería de [Luca Baello](https://github.com/lucabaello1998).
Cada nota viene de un caso concreto: un síntoma, una causa, un arreglo y una forma de detectarlo
la próxima vez. No es un blog de opinión; es memoria de trabajo respaldada por repos reales.

Stack de fondo: React/Next.js, C#/.NET, Python, Dart/Flutter, Node, CI/CD, APIs públicas y
auditoría de sistemas legacy.

## Índice

- [`dos-puntos-en-name-de-github-actions.md`](notas/dos-puntos-en-name-de-github-actions.md) — Un `:` dentro del `name:` de un paso de GitHub Actions rompe el YAML y no crea jobs.
- [`mcp-stdio-sin-console-log.md`](notas/mcp-stdio-sin-console-log.md) — Un `console.log` en stdout rompe el protocolo MCP por stdio; los diagnósticos van a stderr.
- [`nominatim-cache-lru-y-cola.md`](notas/nominatim-cache-lru-y-cola.md) — Nominatim público: 1 req/s, caché LRU y cola para no comerse el rate limit.
- [`wiki-infobox-vs-categories.md`](notas/wiki-infobox-vs-categories.md) - La wiki de Mobile Legends no expone rol/carril en el wikitext; hay que leer `prop=categories`.
- [`mediawiki-500-categorias.md`](notas/mediawiki-500-categorias.md) - MediaWiki corta en 500 categorías por request: sin seguir el `continue`, 18 héroes desaparecen en silencio.
- [`chips-de-filtro-touch-action.md`](notas/chips-de-filtro-touch-action.md) — Chips de filtro que rehacían el `innerHTML` en cada click: en el celular había que tocar dos veces.
- [`npm-audit-en-ci.md`](notas/npm-audit-en-ci.md) — `npm audit --omit=dev --audit-level=high` en CI para no mergear dependencias vulnerables.
- [`secretos-en-informes-html.md`](notas/secretos-en-informes-html.md) — Un informe HTML de auditoría publicado en Pages filtraba contraseñas.
- [`direccion-corta-barrio-localidad.md`](notas/direccion-corta-barrio-localidad.md) — `direccionCorta` debe preferir el barrio antes que la localidad.
- [`parser-dumps-mysql-utf16-comentarios.md`](notas/parser-dumps-mysql-utf16-comentarios.md) — Parser de dumps MySQL: UTF-16 y comentarios escapados.
- [`cli-windows-cp1252-unicode.md`](notas/cli-windows-cp1252-unicode.md) — CLI en Windows: `UnicodeEncodeError` en consola cp1252.

## Cómo uso esto

Uso este repo como memoria de trabajo. Cuando me encuentro con un problema que ya resolví, busco
la nota en el índice. Cuando estoy por repetir un patrón, leo la sección *Cómo lo detectás la
próxima vez* para no volver a caer.

Para agregar una nota nueva:

1. Copiá [`plantilla.md`](plantilla.md) a `notas/`.
2. Completá las cuatro secciones con un caso real.
3. Agregala al índice de este README.
4. Corré `node scripts/check.mjs` para validar estructura y links.

## Validación

```bash
node scripts/check.mjs
```

El script revisa que cada nota tenga las cuatro secciones, que esté en el índice y que el índice
no apunte a archivos que no existen. El mismo chequeo corre en GitHub Actions en cada push.

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
