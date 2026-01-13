resumen ejecutivo y técnico de tu Sistema de Gestión de Medidores v14.0.

Esta aplicación es una Web App progresiva (PWA) construida sobre Google Apps Script, utilizando Google Sheets como base de datos y Google Drive como almacenamiento de evidencias fotográficas.

1. Panel de Administración (Gerencia)
Archivo: Admin.html Es el centro de control para supervisar el avance y gestionar permisos.

Dashboard Visual: Muestra barras de progreso con el porcentaje de avance de lecturas por comunidad.

Control de Acceso (Candado): Interruptor para Bloquear/Desbloquear el mes. Si está bloqueado, nadie puede ingresar nuevas lecturas.

Control de Carga PC: Interruptor para habilitar o deshabilitar el botón de "Subir Archivo" en la vista móvil (para evitar que los conserjes suban fotos antiguas desde la galería si no es deseado).

Monitor de Anomalías: Lista filtrable de todos los medidores reportados como "Malo" o "Averiado" con sus comentarios.

Accesos Directos: Botones para ir directamente al formulario de cada comunidad.

2. Ingreso Individual (Conserjes / Terreno)
Archivo: Index.html Diseñado para uso en celular, enfocado en la rapidez y la estabilidad en terreno.

Modo Offline (Sin Señal): Si se pierde internet, guarda las lecturas en la memoria del teléfono. Al recuperar conexión, muestra un botón para Sincronizar todo de golpe.

Validación de Historial: Al seleccionar una unidad, muestra la lectura del mes anterior para evitar errores groseros (ej: ingresar una lectura menor a la anterior).

Evidencia Fotográfica: Permite tomar foto directa (cámara) o subir archivo (si el Admin lo permite). Comprime las imágenes automáticamente antes de subir para ahorrar datos y espacio.

Geolocalización: Captura coordenadas GPS (Latitud/Longitud) si el usuario da permiso, generando un link a Google Maps.

Lista Inteligente: Las unidades ya registradas desaparecen o se marcan en la lista desplegable.

3. Carga Masiva Inteligente (Oficina)
Archivo: Masivo.html Herramienta de escritorio para procesar cientos de fotos rápidamente sin IA (más robusto y gratis).

Drag & Drop: Arrastrar 50+ fotos a la zona de carga.

Detector de Duplicados: Calcula una "huella digital" (Hash MD5) de cada foto. Si intentas subir la misma foto dos veces (incluso con otro nombre), el sistema te alerta.

Buscador Dinámico: La lista de unidades no es un simple menú, es un buscador.

Descuento Automático: Al asignar una unidad a una foto, esa unidad desaparece de la lista para las siguientes fotos, evitando repetir departamentos.

Carga Parcial: Botón "Subir Datos Listos". Solo envía las filas completas y las borra de la pantalla, dejando las pendientes.

Barra de Progreso: Animación visual (%) durante la subida de datos.

4. Historial y Edición (Reportes)
Archivo: Lecturas.html Para revisar datos ingresados y corregir errores.

Buscador y Filtros: Filtrado por Mes y búsqueda instantánea por número de unidad.

Edición: Permite modificar la Lectura y la Unidad si hubo un error de dedo, actualizando tanto la hoja de la comunidad como la base de datos histórica.

Visualización: Muestra estado (Bueno/Malo), foto, mapa y comentarios.

5. Backend y Base de Datos (Motor)
Archivo: Codigo.gs y Google Sheets.

Enrutamiento: Un solo script gestiona múltiples vistas (?page=admin, ?page=masivo, etc.).

Estructura de Datos:

DB_HISTORICO: Base de datos plana (tipo Excel) con todo el historial acumulado.

DB_HASHES: Registro de huellas digitales de fotos para evitar duplicados.

CONFIG_UNIDADES: Lista maestra de departamentos por comunidad.

CONFIG_ESTADO: Guarda el estado de los interruptores (Bloqueo/Carga PC).

Hojas por Comunidad: Hojas visuales formateadas por bloques mensuales para fácil lectura humana.

Gestión de Drive: Crea automáticamente carpetas por Año > Mes y guarda las fotos renombradas como Unidad-Mes.jpg.

Flujo de Trabajo Ideal:
Admin: Abre el mes en Admin.html.

Conserje: Toma lecturas con Index.html (funciona en subterráneos sin señal).

Oficina: Si faltaron fotos o enviaron por WhatsApp, usa Masivo.html para cargarlas rápido.

Admin: Revisa el avance en Admin.html y corrige errores en Lecturas.html.

Cierre: Admin bloquea el mes en Admin.html.