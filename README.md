# Nexus LED — Cotizador de Avisos

Herramienta interna de cotización para el negocio **Nexus LED**. Permite calcular el precio de avisos en acrílico iluminado y Neon Flex, guardar cotizaciones con datos del cliente, y consultarlas en cualquier momento.

---

## Acceso

La herramienta está protegida con contraseña. Al abrir la página se muestra una pantalla de login.

- **Contraseña por defecto:** `nexus2025`
- Para cambiarla, busca en el `<script>` la línea:
  ```js
  const _PW = btoa('nexus2025');
  ```
  y reemplaza `nexus2025` por la contraseña nueva.

La sesión dura mientras el navegador esté abierto (sessionStorage). Al cerrar el navegador se requiere ingresar la contraseña de nuevo.

---

## Navegación

La aplicación tiene dos vistas accesibles desde la barra de navegación fija en la parte superior:

| Vista | Descripción |
|---|---|
| **Cotizador** | Calculadora de precios para acrílico y Neon Flex |
| **Mis Cotizaciones** | Historial de cotizaciones guardadas con datos del cliente |

La pestaña "Mis Cotizaciones" muestra un badge con el número de cotizaciones guardadas.

---

## Tipos de aviso

La calculadora maneja tres tipos seleccionables desde la parte superior:

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

### Colores de apliques disponibles

| Color | Precio/cm² |
|---|---|
| Rojo, Verde, Amarillo, Naranja, Azul, Blanco, Aguamarina, Marrón, Morado | $18 |
| Dorado espejo, Plata espejo, Rosa espejo | $30 |

---

## Vista del cliente vs. vista interna

- **Precio público:** se muestra grande y destacado en la caja principal.
- **Botón "Ver cotización detallada":** despliega el desglose interno con todos los costos individuales, costo de fabricación y ganancia. Solo para uso interno.

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

## Guardar cotizaciones

Al terminar de calcular, el botón **"Guardar cotización"** (disponible en acrílico y Neon Flex) abre un formulario con:

| Campo | Descripción |
|---|---|
| Vista previa | Captura automática del cotizador (precio del acrílico o preview del Neon) |
| Subir imagen | Permite subir una foto del aviso desde el PC (reemplaza la captura automática) |
| Nombre del cliente | Nombre para identificar la cotización |
| Contacto | WhatsApp o teléfono del cliente |
| Descripción | Detalle libre de lo que se cotizó |

Los datos se guardan en el navegador con **localStorage** — persisten aunque se cierre y vuelva a abrir la página.

---

## Mis Cotizaciones

Vista accesible desde la barra de navegación. Muestra todas las cotizaciones guardadas como tarjetas con:

- Imagen del aviso cotizado
- Tipo de aviso (Nube / Letra a letra / Neon Flex)
- Fecha de guardado
- Nombre y contacto del cliente
- Descripción
- Precio cotizado
- Botón **WhatsApp** — abre WhatsApp con el número del cliente
- Botón **Eliminar** — elimina la cotización con confirmación

---

## Diseño y tecnología

- **Un solo archivo:** `index.html` — sin frameworks, sin dependencias locales de JS
- **Fuentes:** Rajdhani (títulos y botones) + Exo 2 (cuerpo) vía Google Fonts
- **Tema:** Negro/blanco — fondo `#080808`, tarjetas `#111111`, texto `#f0f0f0`
- **Animaciones CSS:** entrada del logo, scanline en el hero, aparición escalonada de elementos, pulso del logo
- **html2canvas** (CDN) para captura de imagen del cotizador
- **localStorage** para persistencia de cotizaciones guardadas
- **sessionStorage** para mantener la sesión del login
- **Responsive:** adaptado para móvil desde 320px

---

## Archivos del proyecto

```
/
├── index.html              # Aplicación completa
├── README.md               # Esta documentación
├── Recursos/
│   ├── NEXUS.png           # Logo blanco con fondo transparente
│   ├── NEXUS.ico           # Favicon
│   └── NEXUS.jpg           # Logo original
└── fonts/
    ├── Allanis (DEMO).ttf
    ├── Barcelony.ttf
    ├── Barokah Signature by Alifinart Studio.ttf
    ├── CosmopolitanScriptRegular.otf
    ├── Elegant DEMO.ttf
    ├── HanleyPro-Monoline.ttf
    ├── Hattinand.otf
    └── Sacramento-Regular.ttf
```

---

## Contacto del negocio

- **WhatsApp:** +57 320 458 7531
- **Instagram:** [@nexusled.co](https://instagram.com/nexusled.co)
