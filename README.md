# Cortex Láser · Calculadora de Corte y Grabado

App **100% frontend** (React + Tailwind + Shadcn UI) para cotizar trabajos de corte y grabado láser. Toda la información (materiales, configuración y cotizaciones) se guarda **localmente en el navegador del usuario** mediante `localStorage`. No requiere backend ni base de datos.

## Stack
- React 19 + Create React App
- Tailwind CSS + Shadcn UI
- React Router 7
- IBM Plex Sans / IBM Plex Mono
- Persistencia: `localStorage`

## Desarrollo local

```bash
cd frontend
yarn install
yarn start
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

La app se despliega como un sitio estático puro (CRA build). No hay variables de entorno obligatorias.

### Opción 1 — Dashboard de Vercel
1. Sube este repositorio a GitHub (o GitLab/Bitbucket).
2. En [vercel.com](https://vercel.com), haz **New Project → Import** y elige el repo.
3. Configuración del proyecto:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App` (auto-detectado)
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
   - **Install Command**: `yarn install --frozen-lockfile`
4. Haz **Deploy**. Vercel leerá `frontend/vercel.json` y aplicará los rewrites para que React Router funcione en todas las rutas (`/historial`, `/materiales`, `/cotizacion/:id/imprimir`, etc.).

### Opción 2 — Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
# Acepta los defaults: framework CRA, build = yarn build, output = build
```

### ¿Por qué `frontend/vercel.json`?
Sin los `rewrites`, al recargar una ruta como `/historial` Vercel devolvería 404 (porque no existe ese archivo estático). El rewrite `/(.*) → /index.html` redirige todo a la SPA y deja que React Router resuelva la ruta.

## Estructura

```
frontend/
├── src/
│   ├── App.js                  # Router
│   ├── components/Layout.jsx   # Sidebar + nav móvil
│   ├── lib/
│   │   ├── api.js              # Persistencia localStorage (MaterialsAPI, SettingsAPI, QuotesAPI)
│   │   └── calc.js             # Lógica de cálculo de cotización
│   └── pages/
│       ├── Cotizador.jsx
│       ├── Historial.jsx
│       ├── Materiales.jsx
│       ├── Configuracion.jsx
│       └── Imprimir.jsx
├── vercel.json                 # Config de despliegue
└── package.json
```

## Datos locales

Los datos se almacenan bajo estas claves en `localStorage`:
- `cortex.materials.v1` — catálogo de materiales (auto-seed con 9 materiales la primera vez)
- `cortex.settings.v1` — tarifas, moneda y nombre del negocio
- `cortex.quotes.v1` — historial de cotizaciones
- `cortex.seeded.v1` — flag interno

Para resetear todo: abre la consola del navegador y ejecuta:
```js
localStorage.clear(); location.reload();
```

## Notas
- La carpeta `/backend` se conserva como referencia pero **no se usa ni se despliega**. Puedes eliminarla si quieres mantener el repo más limpio.
