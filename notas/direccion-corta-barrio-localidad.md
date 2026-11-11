# `direccionCorta`: el barrio tiene que ir antes que la localidad

- Repo: [`lucabaello1998/direcciones_ar`](https://github.com/lucabaello1998/direcciones_ar)
- Commit: [`f1698b5`](https://github.com/lucabaello1998/direcciones_ar/commit/f1698b5249d5d6df9bc4e77f39f5c3a3a5bb8dce)
- Tags: `api-publica`, `dart`, `geocoding`, `ux`

## Síntoma

Las sugerencias de dirección en CABA salían como `"Italia 2274, Ciudad Autónoma de Buenos Aires"` o `"Avenida Rivadavia 5000, Buenos Aires"`. Técnicamente correcto, pero inútil: no distinguía si la dirección era de Caballito, Palermo o Recoleta.

## Causa

El getter `direccionCorta` elegía `localidad ?? barrio`. En CABA la localidad es `"Ciudad Autónoma de Buenos Aires"` para las 15 comunas, así que se perdía la referencia de barrio que sí devolvía Nominatim (`suburb: Caballito`).

## Arreglo

Invertir la prioridad para que el barrio gane cuando existe:

```dart
// antes
final lugar = (localidad ?? barrio)?.trim() ?? '';

// después
final lugar = (barrio ?? localidad)?.trim() ?? '';
```

Ahora `"Avenida Rivadavia 5000, Caballito"` es la salida esperada. Si el resultado no trae barrio, cae a la localidad (`"Avenida Colón 100, Córdoba"`).

El test agregado usa una respuesta real de Nominatim:

```dart
final direccion = DireccionSugerida.desdeNominatim({
  'address': {
    'road': 'Avenida Rivadavia',
    'house_number': '5000',
    'suburb': 'Caballito',
    'city': 'Buenos Aires',
    'state': 'Ciudad Autónoma de Buenos Aires',
  },
});
expect(direccion.direccionCorta, 'Avenida Rivadavia 5000, Caballito');
```

## Cómo lo detectás la próxima vez

- Mirá las direcciones de ejemplo del README: si todas terminan en el nombre de la ciudad, revisá si hay un campo más granular disponible.
- Testeá con direcciones reales de distintas ciudades y barrios.
- Cuando integres una API de geocodificación, listá todos los campos de `address` antes de decidir cuál mostrar.
