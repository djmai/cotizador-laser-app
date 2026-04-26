# PRD — Cortex Láser · Calculadora de Corte y Grabado

## Original Problem Statement
> "Create a website that allows me to calculate laser cutting and engraving for any type of product, by entering measurements and time."

## User Choices (from clarification)
- Idioma: Español
- Materiales: Madera, Acrílico, MDF, Cuero, Cartón, Metal
- Cálculos: material + tiempo de máquina + margen + costos adicionales
- Persistencia: guardar cotizaciones con historial y exportar (PDF / impresión)
- Moneda por defecto: USD

## Architecture
- **Backend**: FastAPI + MongoDB (Motor). All routes under `/api`. Auto-seeds 9 materials + default settings on startup.
- **Frontend**: React 19 + React Router 7 + Shadcn UI + Tailwind. Spanish UI. IBM Plex Sans / Mono fonts. Industrial Swiss design (white + red `#FF3333`, no shadows, sharp 1px borders).
- **No auth** — single-user productivity tool.
- **PDF export** via browser print (`window.print()`) on a dedicated print preview route.

## User Personas
- **Maker / fabricante láser**: cotiza proyectos a clientes, necesita rapidez y precisión.
- **Pequeño taller**: configura materiales y tarifas una vez, reutiliza para cada cotización.

## Core Requirements (static)
1. Formulario de cotización con medidas (mm), cantidad y tiempos (min).
2. Catálogo de materiales con precio por lámina, dimensiones, espesor, % desperdicio.
3. Tarifas globales: corte/h, grabado/h, electricidad/h, mano de obra/h.
4. Cálculo en tiempo real: material + corte + grabado + electricidad + mano de obra + extras + margen.
5. Guardar cotizaciones con historial buscable.
6. Vista imprimible / exportable a PDF.

## Implemented (2026-04-26)
- ✅ Backend `/api/materials` (GET/POST/PUT/DELETE) — testeado 100%
- ✅ Backend `/api/settings` (GET/PUT) — testeado 100%
- ✅ Backend `/api/quotes` (GET/GET-id/POST/DELETE), ordenadas desc por fecha — testeado 100%
- ✅ Auto-seed de 9 materiales y configuración global al inicio
- ✅ Frontend: Cotizador con resumen sticky en tiempo real (slider de margen, costos extras dinámicos)
- ✅ Frontend: Historial con búsqueda + estadísticas (count, total, promedio)
- ✅ Frontend: Materiales con CRUD vía Dialog
- ✅ Frontend: Configuración (tarifas, moneda, nombre del negocio)
- ✅ Frontend: Imprimir cotización (folio, especificaciones, desglose, total) — print-friendly
- ✅ Diseño industrial Swiss (rojo #FF3333, IBM Plex), sidebar + nav móvil
- ✅ Exclusión de `_id` de Mongo en todas las respuestas
- ✅ Toaster con sonner

## Backlog (next iterations)
### P0
- Validación servidor-side de los totales en POST /api/quotes (actualmente confía en el cliente)
### P1
- Editar cotización guardada y duplicarla
- Exportar a PDF real (servidor-side, no solo print) y enviar por email
- Logo personalizado del negocio en la cotización impresa
- Códigos QR / link público de cotización para compartir
### P2
- Múltiples piezas distintas en una sola cotización
- Cálculo de anidado real (nesting) para mejor aprovechamiento de lámina
- Multi-usuario con autenticación (Google Auth)
- Migrar `@app.on_event` a lifespan handler de FastAPI

## Tech Notes
- Frontend env: `REACT_APP_BACKEND_URL`
- Backend env: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`
- Test report: `/app/test_reports/iteration_1.json` (100% pass rate)
