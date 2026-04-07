const PDFDocument = require('/tmp/pdf_gen/node_modules/pdfkit')
const fs = require('fs')

const OUTPUT = 'C:\\Users\\steyv\\OneDrive\\Documentos\\PROYECTOS\\Cotizador\\Cotizador\\Plan_Migracion_NexusLED.pdf'

const doc = new PDFDocument({ margin: 50, size: 'A4' })
doc.pipe(fs.createWriteStream(OUTPUT))

const C = {
  negro:      '#0a0a0a',
  verde:      '#2d7a2d',
  verdeClaro: '#4da74d',
  gris:       '#555555',
  grisClaro:  '#888888',
  linea:      '#cccccc',
  texto:      '#1a1a1a',
  naranja:    '#e88c3a',
}

function titulo(t) {
  doc.moveDown(0.6)
  doc.fontSize(16).fillColor(C.verde).font('Helvetica-Bold').text(t)
  doc.moveDown(0.2)
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(C.verdeClaro).lineWidth(1.5).stroke()
  doc.moveDown(0.5)
}

function subtitulo(t) {
  doc.moveDown(0.5)
  doc.fontSize(12).fillColor(C.negro).font('Helvetica-Bold').text(t)
  doc.moveDown(0.25)
}

function parrafo(t) {
  doc.fontSize(10).fillColor(C.texto).font('Helvetica').text(t, { lineGap: 2 })
  doc.moveDown(0.3)
}

function bullet(label, value) {
  doc.fontSize(10)
  doc.fillColor(C.verde).font('Helvetica-Bold').text('• ' + label, { continued: !!value })
  if (value) doc.fillColor(C.texto).font('Helvetica').text('  —  ' + value)
  doc.moveDown(0.2)
}

function caja(texto, bg) {
  const y = doc.y
  const h = 36
  doc.rect(50, y, 495, h).fill(bg || '#edf7ed')
  doc.fontSize(9.5).fillColor(C.negro).font('Helvetica-Bold').text(texto, 62, y + 12, { width: 471 })
  doc.y = y + h + 8
}

function tabla(headers, rows) {
  const widths = [185, 130, 180]
  let x0 = 50, y = doc.y
  // header
  doc.rect(x0, y, 495, 22).fill(C.verde)
  headers.forEach((h, i) => {
    const x = x0 + widths.slice(0,i).reduce((a,b)=>a+b,0)
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold').text(h, x+5, y+7, { width: widths[i]-6 })
  })
  y += 22
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#ffffff' : '#f2faf2'
    doc.rect(x0, y, 495, 20).fill(bg)
    row.forEach((cell, i) => {
      const x = x0 + widths.slice(0,i).reduce((a,b)=>a+b,0)
      const isBold = (ri === rows.length - 1)
      doc.fontSize(9).fillColor(isBold ? C.verde : C.texto)
        .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
        .text(cell, x+5, y+6, { width: widths[i]-6 })
    })
    y += 20
  })
  doc.rect(x0, doc.y - (rows.length*20+22), 495, rows.length*20+22)
    .strokeColor(C.linea).lineWidth(0.5).stroke()
  doc.y = y + 12
}

// ══ PORTADA ══════════════════════════════════════════
doc.rect(0, 0, 595, 190).fill(C.negro)
doc.fontSize(30).fillColor('#ffffff').font('Helvetica-Bold').text('NEXUS LED', 50, 50, { align: 'center' })
doc.fontSize(15).fillColor(C.verdeClaro).font('Helvetica').text('Plan de Migración y Escalabilidad', { align: 'center' })
doc.fontSize(10).fillColor(C.grisClaro).text('Sistema de Gestión Empresarial — v2.0', { align: 'center' })
doc.y = 200
doc.fontSize(9).fillColor(C.grisClaro).font('Helvetica')
  .text(`Generado el ${new Date().toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}`, { align: 'right' })
doc.moveDown(0.8)
caja('Este documento describe el plan técnico para convertir el cotizador actual en un sistema de gestión multi-rol, seguro y escalable para Nexus LED.', '#edf7ed')

// ══ 1. DIAGNÓSTICO ═══════════════════════════════════
titulo('1. Diagnóstico del Estado Actual')
parrafo('El cotizador actual funciona correctamente como herramienta individual, pero presenta señales de estrés arquitectónico claras:')
bullet('app.js supera 1,400 líneas', 'todo en un solo scope global sin modularidad')
bullet('index.html monolítico', 'modales, vistas y lógica mezclados en un archivo')
bullet('Sin autenticación real', 'cualquiera con el link puede acceder y modificar datos')
bullet('Sin roles de usuario', 'no hay separación entre operativo, diseño y finanzas')
bullet('Sin reportes', 'no hay visibilidad histórica de ventas ni rentabilidad')
doc.moveDown(0.3)
caja('⚠   Lo que describes no es una mejora — es un producto diferente: un ERP pequeño con multi-rol, reportes y control de acceso total.', '#fff8ed')

// ══ 2. STACK ══════════════════════════════════════════
titulo('2. Stack Tecnológico Recomendado')
tabla(
  ['Capa', 'Tecnología', 'Razón'],
  [
    ['Frontend', 'SvelteKit', 'Routing por páginas, fácil de aprender, liviano'],
    ['Estilos', 'Tailwind CSS', 'Consistencia entre vistas, desarrollo rápido'],
    ['Backend / BD', 'Supabase (mantener)', 'Auth, BD, RLS, tiempo real, storage incluidos'],
    ['Reportes', 'Chart.js', 'Simple, sin dependencias pesadas'],
    ['Hosting', 'Vercel + dominio privado', 'Deploy automático, HTTPS, sin servidores propios'],
  ]
)
parrafo('Supabase ya provee el 60% de lo necesario. No hay razón para reemplazarlo — se migra solo el frontend.')

// ══ 3. FASES ══════════════════════════════════════════
titulo('3. Plan de Implementación por Fases')

subtitulo('Fase 1 — Base sólida: autenticación y roles (2-3 semanas)')
parrafo('El paso más crítico. Una base correcta evita reescribir todo más adelante.')
bullet('Crear proyecto SvelteKit con Vite', 'estructura modular desde el inicio')
bullet('Configurar Supabase Auth', 'login con email/contraseña, sesiones JWT seguras')
bullet('Definir roles en la BD', 'admin · fabricador · diseñador · finanzas')
bullet('Configurar RLS (Row Level Security)', 'cada rol solo consulta y modifica lo que le corresponde')
bullet('Página de login obligatoria', 'nadie accede sin credenciales válidas')

subtitulo('Fase 2 — Páginas independientes (2-3 semanas)')
parrafo('Migrar la lógica actual a rutas reales. Cada sección vive en su propia página:')
const rutas = [
  ['/login', 'Autenticación — entrada al sistema'],
  ['/dashboard', 'Resumen general (solo admin)'],
  ['/cotizaciones', 'Gestión completa de cotizaciones'],
  ['/pedidos', 'Cola de producción con estados por producto'],
  ['/clientes', 'Historial y ficha por cliente'],
  ['/catalogo', 'Gestión de productos y precios'],
  ['/reportes', 'Panel de finanzas y ventas'],
  ['/configuracion', 'Usuarios, roles y ajustes del sistema'],
]
rutas.forEach(([ruta, desc]) => {
  doc.fontSize(9.5)
  doc.fillColor(C.verdeClaro).font('Courier-Bold').text(ruta, 70, doc.y, { continued: true, width: 140 })
  doc.fillColor(C.texto).font('Helvetica').text('  →  ' + desc)
  doc.moveDown(0.15)
})
doc.moveDown(0.3)

subtitulo('Fase 3 — Roles operativos (1-2 semanas)')
bullet('Fabricador', 've cola de producción por prioridad. Cambia estado por producto. No ve precios')
bullet('Diseñador', 've pedidos que requieren arte. Puede subir archivos de diseño')
bullet('Finanzas', 'dashboard de solo lectura: ventas, costos, ganancias. Puede exportar reportes')
bullet('Admin', 'acceso total. Gestiona usuarios, roles y configuración del sistema')

subtitulo('Fase 4 — Reportes (1-2 semanas)')
bullet('Ventas semana a semana', 'gráfico de barras comparativo por período')
bullet('Ganancia bruta vs costo de fabricación', 'margen real por semana y por mes')
bullet('Productos más vendidos', 'ranking por tipo de aviso')
bullet('Comparativo mensual', 'evolución del negocio en el tiempo')
bullet('Exportar a PDF / Excel', 'para presentar al equipo o a contabilidad')

subtitulo('Fase 5 — Catálogo ampliado (continuo)')
bullet('Nuevos tipos de productos', 'sin tocar código — configuración desde la BD')
bullet('Calculadora parametrizable', 'costos editables por producto sin redeployar')
bullet('Historial de precios', 'rastrear cambios de precios en el tiempo')

// ══ 4. SEGURIDAD ══════════════════════════════════════
titulo('4. Seguridad — Cómo Proteger el Sistema')
parrafo('Con el nuevo stack se implementan múltiples capas de seguridad que el sistema actual no tiene:')
const segItems = [
  ['Supabase Auth', 'Nadie ve nada sin login válido. Sesiones con JWT firmados.'],
  ['RLS en cada tabla', 'Aunque alguien obtenga las credenciales de Supabase, solo ve lo que su rol permite.'],
  ['Variables de entorno', 'Las API keys nunca van en el código visible ni en el repositorio.'],
  ['Dominio privado', 'No indexado en Google. Sin acceso público conocido.'],
  ['Lista blanca de IPs (opcional)', 'Si el equipo trabaja desde la misma red o ubicación.'],
  ['Logs de actividad', 'Registro de quién hizo qué y cuándo — auditoría completa.'],
]
segItems.forEach(([label, desc]) => {
  doc.fontSize(10).fillColor(C.verdeClaro).font('Helvetica-Bold').text('✓  ' + label, { continued: true })
  doc.fillColor(C.texto).font('Helvetica').text('  —  ' + desc)
  doc.moveDown(0.2)
})

// ══ 5. MIGRACIÓN ══════════════════════════════════════
titulo('5. Estrategia de Migración Sin Pérdida de Datos')
caja('✅  La app actual sigue funcionando mientras se construye la nueva. Comparten la misma BD Supabase — no se pierde nada.', '#edf7ed')
doc.moveDown(0.4)
bullet('Paso 1', 'Construir el nuevo proyecto SvelteKit en paralelo')
bullet('Paso 2', 'Conectar a la misma base de datos Supabase existente')
bullet('Paso 3', 'Probar con usuarios reales antes de migrar completamente')
bullet('Paso 4', 'Apuntar el dominio a la nueva app — migración transparente')
bullet('Paso 5', 'Archivar la app anterior (no eliminar hasta confirmar estabilidad)')

// ══ 6. CRONOGRAMA ═════════════════════════════════════
titulo('6. Cronograma Estimado')
tabla(
  ['Fase', 'Duración', 'Entregable principal'],
  [
    ['Fase 1 — Base + Auth + Roles', '2-3 semanas', 'Login funcional, roles definidos y RLS activo'],
    ['Fase 2 — Páginas migradas', '2-3 semanas', 'App navegable con todas las secciones'],
    ['Fase 3 — Roles operativos', '1-2 semanas', 'Cada usuario ve solo lo que le corresponde'],
    ['Fase 4 — Reportes', '1-2 semanas', 'Dashboard de finanzas con gráficos'],
    ['Fase 5 — Catálogo ampliado', 'Continuo', 'Nuevos productos sin fricción técnica'],
    ['TOTAL ESTIMADO', '6-10 semanas', 'Sistema de gestión empresarial completo'],
  ]
)

// ══ 7. RECOMENDACIÓN FINAL ════════════════════════════
titulo('7. Recomendación Final')
parrafo('Empezar por la Fase 1, no por las features nuevas. Una base con autenticación y roles correcta evita reescribir todo cuando el sistema sea más grande.')
parrafo('El momento óptimo para esta migración es ahora — con ~2,000 líneas de código es manejable. Con 6,000 líneas, será costoso y arriesgado.')
doc.moveDown(0.4)
caja('Con esta arquitectura, Nexus LED tendrá un sistema de gestión propio, seguro y adaptado exactamente a cómo funciona el negocio — sin depender de software genérico como Alegra.', '#edf7ed')

// ── Pie ──
doc.moveDown(1.5)
doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(C.linea).lineWidth(0.5).stroke()
doc.moveDown(0.4)
doc.fontSize(8).fillColor(C.grisClaro).font('Helvetica')
  .text('Nexus LED  •  Plan de Migración v1.0  •  Documento generado automáticamente', { align: 'center' })

doc.end()
console.log('PDF generado:', OUTPUT)
