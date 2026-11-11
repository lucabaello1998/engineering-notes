# `npm audit` en CI para no mergear dependencias vulnerables

- Repo: [`lucabaello1998/OpenCockpit`](https://github.com/lucabaello1998/OpenCockpit) / [`lucabaello1998/claude-cockpit`](https://github.com/lucabaello1998/claude-cockpit)
- Commit: [`45f8292`](https://github.com/lucabaello1998/OpenCockpit/commit/45f82921c5f75f929aa6ad2ebd2ec01b064445bf) / [`cdf108a`](https://github.com/lucabaello1998/claude-cockpit/commit/cdf108a)
- Tags: `ci-cd`, `seguridad`, `npm`, `electron`

## Síntoma

`npm audit` local avisaba de vulnerabilidades altas en dependencias de producción, pero el CI seguía pasando y esas dependencias llegaban a `main`. En una app Electron, una librería rota en runtime es tan grave como una librería de build.

## Causa

El CI corría `npm ci`, lint, tests y build, pero nunca auditaba. `npm audit` sin flags incluye devDependencies, que suelen tener avisos inevitables; por eso muchos equipos lo ignoran. Lo que importa son las vulnerabilidades **altas** en dependencias de **producción**.

## Arreglo

Agregar un paso en el workflow que falle solo ante vulnerabilidades altas en deps de producción:

```yaml
- name: Dependencias de producción sin vulnerabilidades altas
  run: npm audit --omit=dev --audit-level=high
```

Esto se corrió tanto en OpenCockpit como en Claude Cockpit con el mismo criterio.

## Cómo lo detectás la próxima vez

- Corré `npm audit --omit=dev --audit-level=high` antes de cada PR.
- Si audit devuelve 0, agregá el paso al CI para que lo mantenga.
- Revisá periódicamente si `npm audit` reporta falsos positivos y ajustá el nivel (`moderate`, `high`, `critical`).
