import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const NOTAS_DIR = join(RAIZ, "notas");
const README = join(RAIZ, "README.md");

const SECCIONES = [
  "## Síntoma",
  "## Causa",
  "## Arreglo",
  "## Cómo lo detectás la próxima vez",
];

let errores = 0;
let pasos = 0;

function ok(mensaje, condicion, detalle = "") {
  pasos++;
  if (condicion) {
    console.log(`✓ ${mensaje}`);
    return;
  }
  errores++;
  console.error(`✗ ${mensaje}${detalle ? `: ${detalle}` : ""}`);
}

function fatal(mensaje) {
  console.error(`✗ ${mensaje}`);
  process.exit(1);
}

let notas;
try {
  notas = readdirSync(NOTAS_DIR)
    .filter((n) => n.endsWith(".md"))
    .map((n) => ({ archivo: n, ruta: join(NOTAS_DIR, n) }));
} catch (error) {
  fatal(`No pude leer ${NOTAS_DIR}: ${error.message}`);
}

let readme;
try {
  readme = readFileSync(README, "utf8");
} catch (error) {
  fatal(`No pude leer ${README}: ${error.message}`);
}

const linksDelIndice = [...readme.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
  .map((m) => m[2])
  .filter((link) => link.startsWith("notas/") && link.endsWith(".md"))
  .map((link) => link.replace("notas/", ""));

const nombresNotas = new Set(notas.map((n) => n.archivo));
const linksUnicos = [...new Set(linksDelIndice)];

ok("hay notas", notas.length > 0, String(notas.length));

for (const { archivo, ruta } of notas) {
  const contenido = readFileSync(ruta, "utf8");
  const lineas = contenido.split(/\r?\n/);

  ok(
    `${archivo} tiene título (# )`,
    /^# \S/.test(lineas[0] ?? ""),
    lineas[0] || "(vacío)",
  );

  for (const seccion of SECCIONES) {
    ok(
      `${archivo} tiene la sección ${seccion}`,
      contenido.includes(seccion),
    );
  }

  ok(
    `${archivo} está en el índice del README`,
    linksDelIndice.includes(archivo),
  );
}

for (const link of linksUnicos) {
  ok(`el índice apunta a un archivo que existe (${link})`, nombresNotas.has(link));
}

console.log(`\n${pasos - errores}/${pasos} chequeos pasaron`);

if (errores > 0) {
  process.exit(1);
}
