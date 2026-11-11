# Título corto y concreto

- Repo: `usuario/repo`
- Commit: `abc1234`
- Tags: `ci-cd`, `javascript`, `seguridad`, etc.

## Síntoma

Contá qué se veía. Error, comportamiento raro, métrica rota.

## Causa

Por qué pasaba. Una sola causa raíz si se puede; si hubo varias, listalas en orden.

## Arreglo

Código mínimo que muestra el problema y el cambio. No pongas el archivo entero.

```yaml
# antes
- name: Paso: con dos puntos
  run: echo roto

# después
- name: "Paso: con dos puntos"
  run: echo funciona
```

## Cómo lo detectás la próxima vez

- Comando o test que lo encuentra antes de mergear.
- Señal de alerta para revisar.
