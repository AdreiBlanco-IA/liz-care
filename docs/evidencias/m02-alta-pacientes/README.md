# Evidencia · M02 Pacientes (RF-01, HU-01, CA-01)

Práctica de implementación del primer módulo. Fecha de ejecución: 3 de noviembre de 2026. Todos los datos son ficticios.

## Cómo ejecutar

```bash
npm install
npm test        # pruebas automatizadas (Vitest)
npm run dev     # prueba manual en http://localhost:5173 con la cuenta demo liz@lizcare.mx
```

## Resultados

| Caso | CA | Forma | Resultado esperado | Resultado real | Estado |
|---|---|---|---|---|---|
| PT01-N | CA-01 normal | Automática y manual | Un paciente con identificador; datos y contacto de emergencia conservados | Se creó Alex Luna, se abrió su ficha con Sam Luna (Hermano(a), 4770000102) y aparece una vez en el listado | Pasa |
| PT01-L | CA-01 límite | Automática y manual | Alta válida sin segundo apellido | Alta aceptada con segundo apellido vacío | Pasa |
| PT01-E | CA-01 error | Automática y manual | Correo existente bloquea el alta | « Emily@Demo.com » (con mayúsculas y espacios) se bloqueó: « No se registró: el correo ya existe »; los datos se conservaron | Pasa |
| PT01-E2 | CA-01 error | Automática y manual | Faltantes señalados; no se guarda | Formulario vacío: 12 campos marcados; segundo apellido no exigido | Pasa |
| PT01-E3 | CA-13 | Automática | Alta sin sesión o como paciente denegada | `sin-permiso`, sin registros | Pasa |
| PT01-E4 | CA-01 | Automática | Fallo de guardado sin confirmar éxito; reintento sin duplicar | `error-guardado`, 0 registros; el reintento crea 1 | Pasa |

Salida completa: [`salida-npm-test.txt`](salida-npm-test.txt) y [`detalle-pruebas.txt`](detalle-pruebas.txt) (21 pruebas aprobadas).

Capturas: [`pt01-n-alta-valida-ficha.jpg`](pt01-n-alta-valida-ficha.jpg) · [`pt01-e-correo-duplicado.jpg`](pt01-e-correo-duplicado.jpg) · [`pt01-e2-obligatorios.jpg`](pt01-e2-obligatorios.jpg).

## Límites conocidos

- **Persistencia pendiente:** los pacientes se guardan en la memoria del navegador del prototipo y se pierden al recargar. La conservación se comprobó al salir de la ficha y volver a abrirla en la misma sesión. La persistencia definitiva será Supabase (plan de implementación, T-02); `registrarPaciente` recibe la función `guardar` para cambiarla sin tocar el formulario.
- **Permisos:** CA-13 se aplica en la operación de alta, pero las rutas del prototipo siguen protegidas solo en la interfaz. El control en datos llegará con Supabase Auth y RLS (T-03).
- En la prueba manual, el envío del formulario se hizo con `requestSubmit()` desde la consola de la página porque la automatización del navegador no registraba los clics; el flujo de validación y guardado es el mismo que con el botón.
