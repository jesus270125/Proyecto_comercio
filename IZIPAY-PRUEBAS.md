# Izipay: integración de pruebas

La implementación usa exclusivamente `https://sandbox-api-pw.izipay.pe`. No procesa cobros reales. Requiere afiliación y credenciales sandbox de Izipay habilitadas para la API de enlaces, además de una URL pública HTTPS que pueda recibir notificaciones.

## Funcionamiento

La reserva calcula el 5 % en el backend. Se crea un enlace individual de monto fijo en soles, y los datos de facturación se solicitan únicamente durante la prueba. La operación queda pendiente hasta que Izipay informe del pago. El cliente puede consultar el estado mientras conserva la pantalla de confirmación y el administrador puede consultar el estado desde el detalle de la reserva.

El webhook valida HMAC-SHA256 sobre `payloadHttp` y consulta directamente el enlace en la API de Izipay. Antes de marcarlo pagado en pruebas, contrasta el identificador de enlace, comercio, importe, moneda, referencia, tipo de importe y uso individual. Una notificación desconocida devuelve error temporal para permitir su reintento. El sistema no guarda los datos de la tarjeta ni las claves en la base de datos.

## Configuración de pruebas

1. Solicitar a Izipay las credenciales sandbox para la API de enlaces: código de comercio, clave API y clave Hash para notificaciones. Confirmar también la URL de sus enlaces sandbox y las tarjetas de prueba.
2. Configurar en el backend `IZIPAY_SANDBOX_MERCHANT_CODE`, `IZIPAY_SANDBOX_API_KEY`, `IZIPAY_SANDBOX_HASH_KEY` e `IZIPAY_SANDBOX_IPN_URL` como variables privadas. En Render la URL para notificaciones sería `https://apurimac-turismo-api.onrender.com/api/v1/izipay-test/webhook`.
3. Desactivar `CULQI_TEST_ENABLED` y `PAYMENT_DEMO_ENABLED`. Solo entonces activar `IZIPAY_SANDBOX_ENABLED=true` y desplegar. La aplicación rechaza crear órdenes si Culqi e Izipay están activados simultáneamente.
4. Usar únicamente datos y tarjetas de prueba. Validar creación, redirección, rechazo, pago exitoso, notificación, consulta posterior y duplicados con las credenciales del comercio. La documentación de Izipay indica un importe fijo mayor a S/ 1; la aplicación valida ese límite para la tarifa.

No se ha realizado una prueba completa contra Izipay sin credenciales. Antes de cobros reales es necesario obtener autorización, implementar y probar la configuración de producción, confirmar requisitos de facturación e IPN, y revisar el tratamiento de cancelaciones, devoluciones, disponibilidad y conciliación. No habilitar cobros reales solo cambiando variables: el código fija el endpoint de sandbox.
