# Liz Care — Plataforma y sistema gestor de pacientes

Prototipo de interfaz (solo frontend) para Liz Care, desarrollado por Summit AI SA de CV.
Los datos son de prueba y viven en memoria: se reinician al recargar la página. La persistencia
definitiva será Supabase (PostgreSQL, Auth y Storage privado) y está pendiente.

Proyecto de la materia Desarrollo de Aplicaciones y Servicios Virtuales, Universidad Iberoamericana León.
Equipo: Cristóbal Arellano Carranza y Adrei Blanco Márquez.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Pruebas

```bash
npm test
```

## Módulos implementados

| Módulo | Requerimiento | Código | Pruebas y evidencia |
| --- | --- | --- | --- |
| M02 Pacientes: alta | RF-01, HU-01, CA-01, CA-13 | `src/modules/pacientes/` | `tests/pacientes.test.ts`, `docs/evidencias/m02-alta-pacientes/` |

Regla de duplicados: un correo ya registrado (sin distinguir mayúsculas ni espacios) bloquea el alta; mismo nombre y
fecha de nacimiento solo muestra una advertencia que la administradora puede confirmar.

## Cuentas de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administradora | liz@lizcare.mx | admin123 |
| Administradora | daniela@lizcare.mx | admin123 |
| Paciente con historial y tratamiento | emily@demo.com | demo123 |
| Paciente nuevo (historial pendiente) | hans@demo.com | demo123 |

## Pantallas

**Pública:** página de inicio (`/`) e inicio de sesión (`/login`).

**Administradora (`/admin`):** panel del día, pacientes, registro de paciente con detección de duplicados (RF-01),
expediente del paciente con historial y consultas cronológicas (RF-03), registro de consulta, tratamiento y foto de receta
(RF-02, RF-07, RF-08), agenda semanal y directorio de especialistas.

**Paciente (`/portal`, español/inglés):** inicio, próximas citas (RF-05), tratamiento de la última consulta con receta (RF-09),
expediente (RF-06) y formulario de historial médico inicial con alergias obligatorias (RF-10, CA-08).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · Lucide icons.
Fotografías de [Unsplash](https://unsplash.com) (licencia Unsplash). Los nombres de médicos y pacientes son ficticios.
