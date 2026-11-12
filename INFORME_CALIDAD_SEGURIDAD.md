# Informe de pruebas de calidad y seguridad

Proyecto: Apurímac Turismo. Estudiante: Jesús Alejandro Morón Luna. Fecha: 12 de noviembre de 2026.

## Actualización tras las correcciones

- Las validaciones rechazan datos mal formados y precios negativos al crear o editar. Las operaciones administrativas solo admiten campos explícitamente permitidos.
- Hay pruebas automatizadas ejecutables con `cd backend` y `npm test`. Se probaron además contra la API real la creación, edición y consulta de experiencias y hospedajes, y la creación y cálculo de una reserva temporal; se eliminaron los registros de prueba.
- `npm audit` terminó con cero vulnerabilidades conocidas en ambos proyectos. Prisma 6 usa una sobreescritura de `deepmerge-ts` 8 y nodemon se fijó en 3.1.11; se verificaron la conexión real y `prisma validate`, pero cualquier actualización futura debe volver a probarse.
- El frontend compila y el análisis estático finaliza sin advertencias. CORS solo acepta los orígenes configurados y el servidor exige configuración segura al arrancar en producción.
- Pendientes externos: cambiar la contraseña actual de demostración antes de publicar, decidir la estrategia de sesiones revocables, y preparar y publicar los cambios de Git junto con el hosting si se desea la versión 4. Las imágenes requieren almacenamiento persistente.

## Resultados de la auditoría inicial

## Alcance

Revisión local de código y Git, compilación del frontend, análisis estático, auditoría de dependencias mediante npm y pruebas puntuales de la API local. Se creó y eliminó una experiencia de prueba. No es una auditoría de seguridad exhaustiva ni una garantía de ausencia de vulnerabilidades.

## Resultados

- El frontend compiló correctamente; el analizador de código finalizó sin errores y con 19 advertencias.
- La API respondió y las rutas administrativas probadas rechazaron el acceso sin token o con token inválido (401). Una prueba con token firmado de rol USER recibió 403.
- El login y la reserva sin datos recibieron 400. Un nombre de reserva de tipo numérico causó un error 500, debido a que la validación intenta aplicar `trim` sin verificar el tipo.
- Se creó una experiencia temporal y se intentó editarla con precio negativo: la API respondió 200 y el valor quedó guardado. El registro temporal fue eliminado después de la prueba. Las rutas de actualización no aplican los validadores de creación.
- Se verificaron las cabeceras X-Content-Type-Options, X-Frame-Options y Content-Security-Policy en el endpoint de salud.
- `npm audit` informó 6 paquetes afectados en backend (4 de severidad alta y 2 moderada) y 2 en frontend (ambos de severidad alta). Estas cifras incluyen dependencias transitivas y de desarrollo, y no indican por sí solas que todas sean explotables en producción. El informe de npm identifica, entre otros, body-parser, Prisma y Vite. Algunas soluciones propuestas cambian la versión principal y requieren pruebas de compatibilidad.
- El script de revisión del proyecto informó 29 correctos, 4 observaciones y 1 problema. Sus resultados completos están en `reporte-preparacion.txt`; son comprobaciones orientativas, no una evaluación de seguridad completa.
- El repositorio local tiene un commit y la etiqueta `v1.0`; hay cambios sin commit, incluidos archivos nuevos, que no forman parte del historial. La consulta de ramas remotas de GitHub no devolvió ninguna rama visible. Es necesario comprobar el repositorio en GitHub antes de presentar.

## Aclaraciones sobre el script

El script señala que `localhost` está fijo, aunque el cliente usa `VITE_API_URL` y deja localhost como valor de desarrollo. También detecta CORS porque en desarrollo acepta el origen de prueba; eso no demuestra que la política sea adecuada para producción. La ausencia de una biblioteca de validación no significa que no existan validaciones manuales, pero las pruebas demostraron que son incompletas. Su verificación de secretos no detecta todas las credenciales de demostración.

## Prioridades antes de presentar

1. Validar tipos, rangos y campos permitidos tanto en creación como en actualización; rechazar precios negativos y solicitudes mal formadas con 400.
2. Revisar y actualizar dependencias vulnerables, probando compatibilidad después de cada actualización. Evitar `npm audit fix --force` sin revisar sus cambios.
3. Cambiar la contraseña de demostración antes de cualquier publicación real y definir un secreto JWT fuerte. El token se guarda en localStorage y su cierre de sesión solo lo elimina del navegador; se debe evaluar la revocación y la protección frente a XSS para un entorno real.
4. Revisar CORS en producción y preparar hosting, HTTPS, dominio y almacenamiento persistente de imágenes si se busca la versión 4.
5. Preparar commits reales con los cambios y verificar su presencia en GitHub. La cantidad de commits no demuestra por sí sola la calidad del trabajo; no inventar historial.
6. Completar pruebas de creación, edición y visualización de experiencias, hospedajes, galerías y reservas; luego corregir las advertencias de código relevantes.

La copia de seguridad de MySQL está en `backups/`. Las imágenes cargadas se guardan por separado en `backend/uploads/`; respaldar también esa carpeta.
