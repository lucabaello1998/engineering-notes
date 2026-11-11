# MediaWiki corta en 500 categorías y no te dice que faltan

- Repo: [`lucabaello1998/mlbb-draft`](https://github.com/lucabaello1998/mlbb-draft)
- Commit: [`dc62586`](https://github.com/lucabaello1998/mlbb-draft/commit/dc62586)
- Tags: `api`, `paginacion`, `scraping`, `mediawiki`

## Síntoma

El importador del roster decía "fichas de héroe: 114" y la página mostraba 116 héroes. Se veía
razonable… hasta que alguien buscó Aamon y no estaba. Tampoco Gloo, Julian, Kalea, Ixia, Lukas,
Sora, Suyou ni otros once. Todos héroes reales, todos con su ficha en la wiki.

## Causa

La consulta pedía 50 títulos por request con `prop=categories|pageimages` y `cllimit=500`. Cada
héroe tiene entre 12 y 40 categorías, así que 50 × ~15 = **750 categorías**, más de las 500 que
devuelve la API por request. MediaWiki no falla: **pagina**. Devuelve las primeras 500 y un
`continue`, y las últimas páginas del lote vuelven con **cero categorías** (o con la mitad).

`fichaDe()` exigía rol y carril: si no venían, descartaba la página como "no es una ficha de
héroe". El resultado fue silencioso y prolijo: 22 "descartados", 18 de ellos héroes de verdad.

El bug empeoraba al final de la lista, que es donde están los héroes nuevos — justo los que más
se notan cuando faltan.

## Arreglo

Si la respuesta trae `continue`, el lote se parte al medio y se pide de nuevo, recursivamente,
hasta que entra sin paginar:

```javascript
async function fichasDeLote(titulos, fichas, descartados) {
  const datos = await api({
    action: "query",
    prop: "categories|pageimages",
    cllimit: "500",
    titles: titulos.join("|"),
  });

  if (datos.continue && titulos.length > 1) {
    const mitad = Math.ceil(titulos.length / 2);
    await fichasDeLote(titulos.slice(0, mitad), fichas, descartados);
    await fichasDeLote(titulos.slice(mitad), fichas, descartados);
    return;
  }

  for (const pagina of Object.values(datos.query?.pages ?? {})) {
    const ficha = fichaDe(pagina);
    if (ficha) fichas.push(ficha);
    else descartados.push(pagina.title);
  }
}
```

Resultado: 134 héroes en vez de 116. Noctis sigue afuera **a propósito**: la wiki lo marca
`Category:Unfinished` y no tiene rol publicado, así que no se le inventa un carril.

## Cómo lo detectás la próxima vez

- Si una API paginada devuelve `continue`, **nunca** lo ignores: significa que la respuesta está
  incompleta, aunque el JSON se vea bien.
- Desconfiá de los descartes silenciosos. Un contador de "descartados: 22" sin la lista al lado
  esconde el bug; imprimí los nombres o contá por categoría.
- Sumá un chequeo de total: `páginas de la categoría` vs `fichas obtenidas` vs `héroes en el
  dataset`. Si los tres no cierran, falla el import, no el dataset.
- Cruzá el resultado con una fuente independiente (acá: buscar tres héroes nuevos a mano).
