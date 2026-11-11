# Dos puntos en el `name:` de un paso de GitHub Actions rompen el YAML

- Repo: [`lucabaello1998/mcp-direcciones-ar`](https://github.com/lucabaello1998/mcp-direcciones-ar)
- Commit: [`057e830`](https://github.com/lucabaello1998/mcp-direcciones-ar/commit/057e83026250ab0f2dbc4d23bdf11b0ad6a79c14)
- Tags: `ci-cd`, `yaml`, `github-actions`

## Síntoma

Pusheé un workflow de CI con dos jobs de prueba y GitHub no creó ningún job. La pestaña *Actions* mostraba el workflow en gris, sin runs, y el mensaje de error solo aparecía al abrir el editor visual: "Invalid workflow file". El workflow entero quedaba inútil.

## Causa

En YAML, `:` indica un par clave-valor. Si escribís `name: Tests (sin red: fetch inyectado)`, el parser lee el primer `:` como separador y el resto como un valor que no es un escalar válido. GitHub Actions entonces no puede construir la matriz de jobs y falla en silencio antes de correr nada.

## Arreglo

Poner el nombre entre comillas para que el `:` interno sea texto plano:

```yaml
# antes (roto)
- name: Tests (sin red: fetch inyectado)
  run: npm test

# después
- name: "Tests (sin red: fetch inyectado)"
  run: npm test
```

El commit solo cambió esa línea y el workflow volvió a correr.

## Cómo lo detectás la próxima vez

- Si GitHub no crea jobs, abrí el workflow en la UI de Actions: el editor visual muestra el error de parseo.
- Corré `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` antes de pushear.
- Regla mnemotécnica: cualquier `name:` que contenga `:` va entre comillas.
