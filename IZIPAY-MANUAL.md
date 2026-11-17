# Cobro manual con Izipay

Este flujo no crea enlaces ni verifica pagos automáticamente. Primero Izipay debe aprobar la afiliación y habilitar enlaces y tarjetas internacionales para la actividad del comercio. Confirma con Izipay el mínimo, los costos y si se permite cobrar la tarifa por reservas de proveedores terceros.

## Preparación

1. El cambio `backend/prisma/izipay_manual.sql` ya se aplicó a la base de datos local configurada durante la implementación. Para otra base existente, haz una copia de seguridad y aplica el SQL una sola vez; para una base nueva usa el flujo habitual de creación del esquema. No vuelvas a ejecutar el SQL si las columnas ya existen.
2. Desde `backend`, ejecuta `npm run generate` y reinicia el servidor.
3. Solo después de habilitar el servicio real en Izipay, configura `IZIPAY_MANUAL_ENABLED=true` en el `.env` del backend. Desactiva `PAYMENT_DEMO_ENABLED` y `CULQI_TEST_ENABLED` para usar el flujo manual. Reinicia el backend.

## Operación

1. El cliente registra su solicitud; queda pendiente y se muestra la tarifa del 5 % y el saldo a coordinar. El sitio no envía correos ni enlaces por sí mismo.
2. En Administración → Reservas, abre la solicitud. Crea en el panel de Izipay un enlace individual de monto fijo por la tarifa exacta mostrada, en soles, y relaciona el código de reserva. Pega el enlace en el detalle y guárdalo.
3. Comparte manualmente el enlace guardado con el cliente por el canal acordado. Asegúrate de que el enlace pertenece a tu cuenta de Izipay y de que el importe y la moneda son correctos.
4. Comprueba directamente en Izipay que el pago se completó por el monto y moneda correctos y corresponde a esa reserva. Introduce la referencia real y selecciona «Registrar pago verificado». Esta marca es manual: no es una confirmación automática de Izipay.
5. La confirmación de la reserva es independiente y queda a cargo del administrador. El saldo se coordina por separado con el proveedor.

La reserva y el pago son estados distintos. Si se requiere corregir un pago ya marcado como verificado, se necesita un procedimiento administrativo; la interfaz no permite modificarlo. Las credenciales de Izipay no se necesitan para este flujo y no deben compartirse con clientes.
