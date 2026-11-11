# CLI en Windows: `UnicodeEncodeError` en consola cp1252

- Repo: [`lucabaello1998/cvfit`](https://github.com/lucabaello1998/cvfit)
- Commit: [`05526a1`](https://github.com/lucabaello1998/cvfit/commit/05526a12fb2ebbaf5dafb9e207cbbe71ee1dc8d7)
- Tags: `python`, `cli`, `windows`, `encoding`

## Síntoma

Después de hacer instalable el paquete con `pipx install`, corrí `cvfit --help` en una consola de Windows normal (`cmd` con código de página cp1252) y explotó con:

```
UnicodeEncodeError: 'charmap' codec can't encode character '\u2194' in position...
```

El `↔` de la descripción del programa (`"Encaje CV ↔ aviso"`) no se podía imprimir.

## Causa

Python usa la codificación de la consola para escribir en `stdout`. En Windows con configuración regional latinoamericana, cp1252 no tiene el glifo `↔`. Como `argparse` imprime la descripción al mostrar `--help`, el error ocurría antes de que el programa hiciera nada útil.

## Arreglo

Reconfigurar `stdout` y `stderr` para que reemplacen caracteres no imprimibles en vez de romper:

```python
import sys
from contextlib import suppress

def _consola_tolerante() -> None:
    for flujo in (sys.stdout, sys.stderr):
        with suppress(AttributeError, ValueError):
            flujo.reconfigure(errors="replace")

def main(argv: list[str] | None = None) -> int:
    _consola_tolerante()
    parser = argparse.ArgumentParser(prog="cvfit", description="Encaje CV ↔ aviso y CV adaptado")
    # ...
```

Con `errors="replace"`, el `↔` se muestra como `?` en lugar de tirar la excepción.

## Cómo lo detectás la próxima vez

- Probar `--help` y `--version` en `cmd` de Windows sin configuración especial (`chcp` suele dar 850 o 1252).
- Incluir caracteres no ASCII en la descripción de argparse y correr la CLI en un entorno cp1252.
- Si tu CLI se instala por pipx/pip, testeala en una consola real; no alcanza con WSL o PowerShell con UTF-8 forzado.
