# Parser de dumps MySQL: UTF-16 y comentarios escapados

- Repo: [`lucabaello1998/legacy-lens`](https://github.com/lucabaello1998/legacy-lens)
- Commit: [`7a78f17`](https://github.com/lucabaello1998/legacy-lens/commit/7a78f1743524df91621f8ea902ed2329102df7a7)
- Tags: `python`, `parser`, `mysql`, `legacy`, `sql`

## Síntoma

Un dump generado en Windows con `>` desde PowerShell 5.1 se leía como si tuviera cero tablas, sin error. Además, un comentario como `COMMENT 'apellido\'s, nombre'` hacía que el parser se perdiera y omitiera columnas enteras.

## Causa

Dos suposiciones rotas:

1. **Codificación UTF-16.** PowerShell 5.1 guarda UTF-16 cuando redirige con `>`. Leerlo como UTF-8 produce caracteres nulos o basura y el regex de `CREATE TABLE` no matchea.
2. **Comentarios dentro de literales.** El parser sacaba comentarios con regex globales, así que `/*` o `--` dentro de un string `DEFAULT 'a/*b'` borraba desde el string hasta el próximo `*/`, perdiendo tablas.

## Arreglo

1. Detectar el BOM y decodificar según corresponda:

```python
def _decodificar(datos: bytes) -> str:
    if datos.startswith((b"\xff\xfe", b"\xfe\xff")):
        return datos.decode("utf-16", "replace")
    if datos.startswith(b"\xef\xbb\xbf"):
        return datos[3:].decode("utf-8", "replace")
    return datos.decode("utf-8", "replace")
```

2. Parser manual que recorre el SQL respetando comillas y escapes:

```python
def _limpiar(sql: str) -> str:
    salida = []
    i, n = 0, len(sql)
    while i < n:
        caracter = sql[i]
        if caracter in "'\"":
            # copiar literal completo sin tocarlo
            j = i + 1
            while j < n:
                if sql[j] == "\\":
                    j += 2
                    continue
                if sql[j] == caracter:
                    j += 1
                    break
                j += 1
            salida.append(sql[i:j])
            i = j
            continue
        if caracter == "/" and i + 1 < n and sql[i + 1] == "*":
            # comentario /* */ reemplazado por saltos para conservar números de línea
            fin = sql.find("*/", i + 2)
            fin = n if fin < 0 else fin + 2
            salida.append("\n" * sql.count("\n", i, fin))
            i = fin
            continue
        # ... lo mismo para -- y #
```

## Cómo lo detectás la próxima vez

- Test de regresión: guardar un dump UTF-16 y verificar que se parsean las tablas.
- Test con comentarios escapados dentro de strings.
- Si el parser es regex-based, sospechá siempre que aparezcan literales con escapes o comentarios anidados.
