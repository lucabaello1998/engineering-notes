# La wiki de Mobile Legends no expone rol/carril en el wikitext

- Repo: [`lucabaello1998/mlbb-draft`](https://github.com/lucabaello1998/mlbb-draft)
- Commit: [`1d81052`](https://github.com/lucabaello1998/mlbb-draft/commit/1d81052a48d79ed2d6df4b70c3f9b6b1f0a2d39f)
- Tags: `scraping`, `api`, `wikitext`, `mobile-legends`

## Síntoma

Quería importar el roster completo desde la wiki oficial. Pedí el wikitext de cada página esperando leer `|role=` y `|lane=`, pero esos campos no estaban. El importador me dejaba héroes sin rol y sin carril, inútiles para el drafter.

## Causa

El infobox de la wiki se arma con una plantilla (`{{Hero}}`) que renderiza el HTML, pero el wikitext no trae los valores normalizados. El rol y el carril sí están disponibles como **categorías** de la página: `Category:Assassin heroes`, `Category:Jungle heroes`, etc.

## Arreglo

Cambiar la API de `prop=revisions` a `prop=categories|pageimages` y mapear las categorías a los valores del dataset:

```javascript
const ROLES = {
  "assassin heroes": "Assassin",
  "marksman heroes": "Marksman",
  "mage heroes": "Mage",
  "fighter heroes": "Fighter",
  "tank heroes": "Tank",
  "support heroes": "Support",
};

const CARRILES = {
  "gold lane heroes": "Oro",
  "mid lane heroes": "Medio",
  "exp lane heroes": "Exp",
  "jungle heroes": "Jungla",
  "roaming heroes": "Roam",
};

function fichaDe(pagina) {
  const categorias = (pagina.categories ?? [])
    .map((c) => c.title.replace("Category:", "").toLowerCase());
  const rol = categorias.map((c) => ROLES[c]).find(Boolean);
  const carriles = categorias.map((c) => CARRILES[c]).filter(Boolean);
  // ...
}
```

Si un héroe no tenía categorías de carril, se descartaba (eran páginas que no eran fichas de héroe).

## Cómo lo detectás la próxima vez

- Nunca asumir que el wikitext contiene lo que se ve en la página renderizada.
- Antes de scrapear, consultar `prop=categories` para ver qué metadatos estructurados expone la wiki.
- Validar el dataset: `scripts/check.mjs` exige que cada héroe tenga `rol` y `carril` conocidos.
