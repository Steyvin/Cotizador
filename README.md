# Nexus LED — Cotizador de Avisos

Herramienta interna de cotización para el negocio **Nexus LED**. Permite calcular el precio de avisos en acrílico iluminado, Neon Flex y vinilo; armar un carrito con múltiples productos; guardar cotizaciones con datos del cliente; convertirlas en pedidos; y llevar el control financiero de abonos y saldos.

---

## Acceso

La herramienta está protegida con contraseña. Al abrir la página se muestra una pantalla de login.

- **Contraseña por defecto:** `nexus2025`
- Para cambiarla, busca en `assets/js/app.js` la línea:
  ```js
  const _PW = btoa('nexus2025');
  ```
  y reemplaza `nexus2025` por la contraseña nueva.

La sesión dura mientras el navegador esté abierto (sessionStorage). Al cerrar el navegador se requiere ingresar la contraseña de nuevo.

---

## Navegación

La aplicación tiene cinco vistas accesibles desde la barra de navegación fija en la parte superior:

| Vista | Descripción |
|---|---|
| **Cotizador** | Calculadora de precios para todos los tipos de aviso |
| **Cotizaciones** | Historial de cotizaciones guardadas con datos del cliente |
| **Pedidos** | Gestión de pedidos convertidos desde cotizaciones, con pipeline de estados |
| **Dashboard** | Resumen del negocio: totales, pedidos recientes y cotizaciones recientes |
| **Finanzas** | Control financiero: abonos, saldos pendientes y estado de pago por pedido |

Las pestañas "Cotizaciones" y "Pedidos" muestran un badge con el número de registros activos.

---

## Tipos de aviso

La calculadora maneja cinco tipos seleccionables desde la parte superior:

### 1. Nube
Aviso en acrílico con forma rectangular continua (una sola pieza).

- La faja/cantonera se calcula automáticamente a partir del perímetro.
- La cinta LED se calcula con fórmula de serpentina (pasadas × ancho + curvas × margen 5%).
- Ancho de faja automático: 7 cm (avisos normales) u 8 cm (si alguna dimensión supera 120 cm).

### 2. Letra a letra
Letras o piezas individuales de acrílico.

- La faja se ingresa manualmente como perímetro total en cm.
- Opción de faja más gruesa con ancho personalizable (mínimo 6 cm).
- La cinta LED se calcula como: `perímetro (m) × $5.000`.

### 3. Neon Flex
Letrero luminoso de tubo neon flexible. Tiene su propia sección de configuración visual.

### 4. Vinilo
Aviso en vinilo adhesivo. El precio es **directo** (sin margen aplicado).

- Se ingresan las piezas con ancho y alto en cm.
- El precio base es `$50.000/m²`.
- Opción de instalación: `$60.000` — automáticamente gratis si el área total supera 3 m².

### 5. Acrílico
Aviso en acrílico sin faja (tapa plana con apliques y LED opcional).

**Modo regular:**
- Base acrílico, apliques de color, cinta LED opcional (`$12.000/m`), y vinilo opcional.
- Se aplica margen del 40%: `precio_público = costo / 0.60`.

**Modo circular** (toggle):
- Precios fijos por diámetro (sin desglose de costos):

| Diámetro | Precio |
|---|---|
| 40 cm | $180.000 |
| 50 cm | $220.000 |
| 60 cm | $240.000 |
| 70 cm | $280.000 |
| 80 cm | $350.000 |

- En modo circular, vinilo y luz LED son opciones descriptivas (no modifican el precio).

---

## Calculadora de acrílico (Nube y Letra a letra)

### Campos de entrada

| Campo | Descripción |
|---|---|
| Ancho (cm) | Ancho del aviso |
| Alto (cm) | Alto del aviso |
| Apliques de acrílico | Cantidad de colores adicionales sobre el aviso |
| Perimetro total (cm) | Solo en Letra a letra — para faja y cinta LED |
| ¿Requiere instalación? | Toggle — incluye transporte y montaje |
| ¿Lleva vinilo? | Toggle — abre campos de ancho y alto del vinilo |
| ¿Necesita estructura? | Toggle — soporte metálico fijo ($100.000) o precio manual |
| Modificar mano de obra | Toggle — activa input para casos especiales |

### Cálculo de costos

| Componente | Fórmula |
|---|---|
| Tapa acrílico | `ancho × alto × $18/cm²` |
| Apliques acrílico | `ancho × alto × precio_color/cm²` por cada aplique |
| Faja / Cantonera | `ceil(perímetro / 120) × ancho_faja × $1.500` |
| Tapa PVC | `ancho × alto × $3/cm²` (automático, oculto) |
| Cinta LED (Nube) | Fórmula serpentina — pasadas de 7 cm, `$5.000/m` |
| Cinta LED (Letra) | `perímetro_cm / 100 × $5.000` |
| Mano de obra | Escalonada por dimensión máxima (ver tabla abajo) |
| Estructura | $100.000 fija o precio manual |
| Transporte | $10.000 sin instalación / $60.000 con instalación |
| Vinilo | `ancho × alto / 10.000 × $45.000/m²` |

#### Mano de obra escalonada

| Dimensión máxima | Precio |
|---|---|
| ≤ 80 cm | $100.000 |
| ≤ 100 cm | $150.000 |
| > 100 cm | $220.000 |

### Margen de ganancia

El precio público se calcula dividiendo el costo total entre 0.60, lo que aplica un margen del **40%**:

```
precio_público = costo_total / 0.60
```

> **Nota:** Este margen aplica a Nube, Letra a letra y Acrílico (modo regular). Vinilo y Acrílico circular tienen precio directo.

### Colores de apliques disponibles

| Color | Precio/cm² |
|---|---|
| Rojo, Verde, Amarillo, Naranja, Azul, Blanco, Aguamarina, Marrón, Morado | $18 |
| Dorado espejo, Plata espejo, Rosa espejo | $30 |

---

## Vista del cliente vs. vista interna

- **Precio público:** se muestra grande y destacado en la caja principal.
- **Botón "Ver cotización detallada":** despliega el desglose interno con todos los costos individuales, costo de fabricación y ganancia. Solo para uso interno.
  - Disponible en: Nube, Letra a letra, Acrílico (modo regular).
  - **No disponible** en: Vinilo y Acrílico circular (precio directo, sin desglose).

---

## Neon Flex

### Configuración disponible

| Opción | Descripción |
|---|---|
| Texto | Campo de texto con soporte de saltos de línea (Enter) |
| Alineación | Izquierda / Centro / Derecha |
| Tamaño | Pequeño (60×45 cm / $180.000), Mediano (80×50 cm / $250.000), Grande (100×60 cm / $340.000), Personalizado (cotizar por WhatsApp) |
| Tipografía | 8 fuentes decorativas locales (ver lista abajo) |
| Color del neón | 8 colores: Rosa, Cyan, Verde, Amarillo, Naranja, Morado, Blanco, Rojo |
| Color de fondo | 6 opciones: Negro, Azul oscuro, Verde oscuro, Vino, Gris, Blanco |
| Instalación | Toggle — agrega $50.000 al precio |

### Fuentes disponibles

- Allanis · Barcelony · Barokah · Cosmopolitan · Elegant · Hanley Pro · Hattinand · Sacramento

### Preview interactivo

El texto se renderiza en tiempo real con efecto de brillo neon y parpadeo sutil. El acrílico trasero se simula mediante un filtro SVG (`feMorphology`) que genera la silueta dilatada alrededor del texto con el color del neón seleccionado.

### Captura de imagen

Dos botones debajo del preview:

- **Copiar imagen** — captura el preview y lo copia al portapapeles (requiere HTTPS o Chrome)
- **Descargar** — descarga el preview como archivo `.png` a doble resolución (2×)

---

## Carrito de cotización

Permite acumular múltiples productos antes de generar una sola cotización.

### Flujo

1. Cotizar un producto en cualquiera de las cinco calculadoras.
2. Pulsar **"+ Agregar al carrito"** — se muestra un toast de confirmación.
3. El botón flotante del carrito aparece en la esquina inferior derecha con el conteo de ítems.
4. Pulsar el botón flotante para abrir el modal del carrito.

### Modal del carrito

- Lista de ítems con tipo, descripción, precio y botón para eliminar individualmente.
- **Subtotal** calculado automáticamente.
- **Precio final editable** — se pre-llena con el subtotal pero puede modificarse manualmente para aplicar descuentos.
- Botón **Vaciar** — elimina todos los ítems con confirmación.
- Botón **Guardar cotización** — abre el modal de guardado con el precio del carrito y la descripción pre-llenada con los ítems.

### Al guardar desde el carrito

- Se guarda como tipo `"Varios"` en la base de datos.
- La descripción incluye el resumen de todos los productos del carrito.
- El precio guardado es el precio final editado (con posibles descuentos).
- El carrito se vacía automáticamente después de guardar.

---

## Guardar cotizaciones

Al terminar de calcular, el botón **"Guardar cotización"** (disponible en todas las calculadoras y en el carrito) abre un formulario con:

| Campo | Descripción |
|---|---|
| Vista previa | Captura automática del cotizador (precio del acrílico o preview del Neon) |
| Subir imagen | Permite subir una foto del aviso desde el PC (reemplaza la captura automática) |
| Nombre del cliente | Nombre para identificar la cotización |
| Contacto | WhatsApp o teléfono del cliente |
| Descripción | Detalle libre de lo que se cotizó |

Los datos se guardan en **Supabase** (nube) y persisten aunque se cierre y vuelva a abrir la página.

---

## Mis Cotizaciones

Vista accesible desde la barra de navegación. Muestra todas las cotizaciones guardadas **que aún no han sido convertidas en pedido**, como tarjetas con:

- Imagen del aviso cotizado
- Tipo de aviso (Nube / Letra a letra / Neon Flex / Vinilo / Acrílico / Varios)
- Fecha de guardado
- Nombre y contacto del cliente
- Descripción
- Precio cotizado
- Botón **WhatsApp** — abre WhatsApp con el número del cliente
- Botón **Convertir en pedido** — abre un modal para ingresar abono y fecha estimada de entrega, luego registra el pedido
- Botón **Eliminar** — elimina la cotización con confirmación

Incluye **barra de búsqueda** para filtrar por nombre o contacto del cliente.

---

## Pedidos

Vista para gestionar los pedidos confirmados. Cada cotización puede convertirse en pedido desde la vista Cotizaciones.

Cada tarjeta de pedido muestra:

- Datos del cliente (nombre y contacto)
- Detalle de la cotización (tipo, descripción, precio)
- Indicador visual del paso actual en el pipeline
- Dropdown para actualizar el estado
- Fecha estimada de entrega
- Botón **Eliminar** — elimina el pedido con confirmación

Incluye **barra de búsqueda** para filtrar por nombre o contacto del cliente.

### Pipeline de estados

Los pedidos siguen un flujo de seis etapas en orden:

| # | Estado |
|---|---|
| 1 | Pedido realizado |
| 2 | En proceso |
| 3 | Enviado a proveedor |
| 4 | En fabricación |
| 5 | Terminado |
| 6 | Entregado |

---

## Control Financiero

Vista accesible desde la pestaña **Finanzas**. Muestra el estado de pago de cada pedido con:

- Nombre y contacto del cliente
- Precio total cotizado
- Abono pagado al momento de convertir en pedido
- Saldo pendiente
- Badge **"Saldado"** cuando el abono cubre el total

Incluye **barra de búsqueda** para filtrar por nombre o contacto.

---

## Dashboard

Vista de resumen del negocio. Muestra cuatro métricas principales:

| Métrica | Descripción |
|---|---|
| Total Cotizaciones | Número total de cotizaciones guardadas |
| Total Pedidos | Número total de pedidos registrados |
| Cotizaciones Pendientes | Cotizaciones que aún no han sido convertidas en pedido |
| Pedidos Entregados | Pedidos en estado "Entregado" |

También muestra listas de los pedidos recientes y cotizaciones recientes con acceso directo a cada vista.

---

## Diseño y tecnología

- **Estructura separada:** `index.html` (solo HTML) + `assets/css/styles.css` + `assets/js/app.js`
- **Fuentes:** Rajdhani (títulos y botones) + Exo 2 (cuerpo) vía Google Fonts; 8 fuentes decorativas locales para Neon Flex
- **Tema:** Negro/blanco — fondo `#080808`, tarjetas `#111111`, texto `#f0f0f0`
- **Animaciones CSS:** entrada del logo, scanline en el hero, aparición escalonada de elementos, pulso del logo
- **html2canvas** (CDN) para captura de imagen del cotizador
- **Supabase** (CDN) como base de datos en la nube — tablas `Cotizacion` y `Pedido`
- **sessionStorage** para mantener la sesión del login
- **Responsive:** adaptado para móvil desde 320px

### Tablas en Supabase

| Tabla | Campos principales |
|---|---|
| `Cotizacion` | `id`, `tipo`, `cliente`, `contacto`, `descripcion`, `precio`, `imagen`, `estado`, `fechaCreacion` |
| `Pedido` | `id`, `cotizacion_id`, `cliente`, `contacto`, `tipo`, `descripcion`, `precio`, `estado`, `fechaEntrega`, `abono`, `fechaPedido` |

> **Nota:** El campo `abono` (numeric, default 0) debe existir en la tabla `Pedido` de Supabase para que el Control Financiero funcione correctamente.

---

## Estructura de archivos

```
/
├── index.html                  # HTML de la aplicación
├── README.md                   # Esta documentación
├── assets/
│   ├── css/
│   │   └── styles.css          # Todos los estilos
│   ├── js/
│   │   └── app.js              # Toda la lógica JavaScript
│   ├── fonts/
│   │   ├── Allanis (DEMO).ttf
│   │   ├── Barcelony.ttf
│   │   ├── Barokah Signature by Alifinart Studio.ttf
│   │   ├── CosmopolitanScriptRegular.otf
│   │   ├── Elegant DEMO.ttf
│   │   ├── HanleyPro-Monoline.ttf
│   │   ├── Hattinand.otf
│   │   └── Sacramento-Regular.ttf
│   └── img/
│       ├── NEXUS.png           # Logo blanco con fondo transparente
│       ├── NEXUS.ico           # Favicon
│       └── NEXUS.jpg           # Logo original
├── manifest.json               # Configuración PWA
└── sw.js                       # Service Worker (PWA offline)
```

---

## Contacto del negocio

- **WhatsApp:** +57 320 458 7531
- **Instagram:** [@nexusled.co](https://instagram.com/nexusled.co)
