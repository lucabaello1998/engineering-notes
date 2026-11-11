# Un informe HTML de auditoría que filtraba contraseñas

- Repo: [`lucabaello1998/legacy-lens`](https://github.com/lucabaello1998/legacy-lens)
- Commit: [`7a78f17`](https://github.com/lucabaello1998/legacy-lens/commit/7a78f1743524df91621f8ea902ed2329102df7a7)
- Tags: `seguridad`, `python`, `auditoría`, `legacy`

## Síntoma

El informe HTML de ejemplo se publicaba en GitHub Pages. Al revisarlo encontré líneas como `mysql_connect("localhost", "root", "Pa55w0rd!")` en los snippets del código analizado. El informe mostraba contraseñas reales (del sistema de ejemplo, pero iguales de graves como patrón).

## Causa

Las reglas de escaneo detectaban secretos, pero solo enmascaraban el último literal en algunos casos (`$pass = '...'`) o dejaban ver otros literales de la misma línea. Una línea con varios parámetros, como `mysql_connect`, seguía mostrando la contraseña.

## Arreglo

Cambiar la máscara por defecto a "tapar todos los literales" y agregar un parser de literales que respete escapes:

```python
MASCARA_POR_DEFECTO = "ninguno"

def _enmascarar(texto: str, conservar: str = "ninguno") -> str:
    tramos = _literales(texto)
    if not tramos:
        return "***"
    salida = []
    cursor = 0
    for i, (inicio, fin) in enumerate(tramos):
        salida.append(texto[cursor:inicio])
        salida.append(texto[inicio:fin] if i in visibles else "***")
        cursor = fin
    salida.append(texto[cursor:])
    return "".join(salida)
```

Ahora `mysql_connect("localhost", "root", "Pa55w0rd!")` se publica como `mysql_connect("***", "***", "***")`.

El mismo commit agregó `tests/test_revision.py` con:

```python
def test_ningun_secreto_sobrevive_en_el_snippet(tmp_path):
    snippets = _escanear(tmp_path, ...)
    for secreto in ("Pa55w0rd", "Sup3rS3cretDB", "AKIAIOSFODNN7EXAMPLE"):
        assert secreto not in "\n".join(snippets)
```

## Cómo lo detectás la próxima vez

- Si publicás un informe generado a partir de código ajeno, agregá un test que meta contraseñas de ejemplo y verifique que no aparezcan.
- Nunca mostrás el valor de un literal sin enmascarar, aunque pienses que "solo es un snippet".
- Revisá los informes generados con `grep -i pass` o `grep -i secret` antes de subirlos.
