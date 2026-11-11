# Chips de filtro que rehacen `innerHTML` en cada click: hay que tocar dos veces

- Repo: [`lucabaello1998/mlbb-draft`](https://github.com/lucabaello1998/mlbb-draft)
- Commit: [`1d81052`](https://github.com/lucabaello1998/mlbb-draft/commit/1d81052a48d79ed2d6df4b70c3f9b6b1f0a2d39f)
- Tags: `frontend`, `mobile`, `touch`, `accesibilidad`

## Síntoma

En desktop los chips de filtro funcionaban perfecto. En el celular, al tocar un chip la primera vez no hacía nada; la segunda vez sí. Parecía un bug de estado, pero el `aria-pressed` se actualizaba bien.

## Causa

Había dos problemas superpuestos:

1. **Recreación del DOM en cada click**. El handler regeneraba todo el `innerHTML` de los chips al cambiar el filtro, así que el botón que el dedo acababa de tocar desaparecía y se reemplazaba por otro idéntico en el mismo lugar. El evento se perdía en la reconstrucción.
2. **Doble tap del navegador móvil**. Sin `touch-action: manipulation`, el navegador espera un posible segundo toque para hacer zoom, retrasando o consumiendo el primer toque.

## Arreglo

Pintar los chips una sola vez y solo cambiar el atributo `aria-pressed`:

```javascript
function montarChips(contenedor, obtener, setter, repintar) {
  const roles = ["", ...new Set(estado.heroes.map((h) => h.rol).filter(Boolean))];
  contenedor.innerHTML = roles.map((rol) =>
    `<button class="chip" type="button" data-rol="${escapar(rol)}" aria-pressed="false">${rol || "Todos"}</button>`
  ).join("");

  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-rol]");
    if (!boton) return;
    setter(boton.dataset.rol);
    for (const chip of contenedor.querySelectorAll("[data-rol]")) {
      chip.setAttribute("aria-pressed", String(chip.dataset.rol === obtener()));
    }
    repintar();
  });
}
```

Y en CSS:

```css
.chip {
  /* Sin esto, el primer toque en el celular se lo come el zoom por doble tap. */
  touch-action: manipulation;
}
```

## Cómo lo detectás la próxima vez

- Probar siempre los controles en un dispositivo real o en el emulador con touch.
- Si un botón necesita dos toques, revisar si rehacés su contenedor en el handler del click.
- Usar `touch-action: manipulation` en botones interactivos que no requieran zoom por doble tap.
