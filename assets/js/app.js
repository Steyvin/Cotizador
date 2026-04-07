  /* ══════════════ SUPABASE ══════════════ */
  const sb = window.supabase.createClient(
    'https://bpjxfkdndacrqbhuoyzu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwanhma2RuZGFjcnFiaHVveXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDk3MjQsImV4cCI6MjA5MDkyNTcyNH0.j_Y9Q-LSowfdW5iEcC2sdkxvMDed2fLQbiMEErekSFw'
  )

  /* ══════════════ UTILIDADES ══════════════ */
  const fmt = n => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(n)

  const val = id => parseFloat(document.getElementById(id).value) || 0

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }
  function escAttr(s) {
    return String(s).replace(/'/g,"\\'")
  }
  function fmtFecha(iso) {
    return new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })
  }
  function fmtFechaCorta(iso) {
    return new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short' })
  }

  const TIPO_LABEL = { nube: 'Nube', letra: 'Letra a letra', neon: 'Neon Flex', vinilo: 'Vinilo', acrilio: 'Acrílico', carrito: 'Varios' }

  /* ══════════════ COTIZADOR ══════════════ */
  let tipoActivo = 'nube'

  function setTipo(tipo) {
    tipoActivo = tipo
    ;['nube','letra','neon','vinilo','acrilio'].forEach(t =>
      document.getElementById('btn_' + t).classList.toggle('active', t === tipo)
    )
    const esNeon    = tipo === 'neon'
    const esVinilo  = tipo === 'vinilo'
    const esAcrilio = tipo === 'acrilio'
    const esRegular = !esNeon && !esVinilo && !esAcrilio

    document.getElementById('calc-regular').style.display = esRegular ? '' : 'none'
    document.getElementById('calc-neon').style.display    = esNeon    ? '' : 'none'
    document.getElementById('calc-vinilo').style.display  = esVinilo  ? '' : 'none'
    document.getElementById('calc-acrilio').style.display = esAcrilio ? '' : 'none'

    if (esRegular) {
      document.getElementById('faja_manual').style.display = tipo === 'letra' ? '' : 'none'
      document.getElementById('faja_auto').style.display   = 'none'
      document.getElementById('card_faja').style.display   = tipo === 'letra' ? '' : 'none'
      calcular()
    }
  }

  function calcularFajaNube(ancho, alto) {
    if (!ancho || !alto) return 0
    const perimetro = 2 * (ancho + alto)
    const numFajas  = Math.ceil(perimetro / 120)
    const anchoFaja = (ancho >= 120 || alto >= 120) ? 8 : 7
    document.getElementById('nube_perimetro').textContent  = perimetro + ' cm'
    document.getElementById('nube_fajas').textContent      = numFajas
    document.getElementById('nube_ancho_faja').textContent = anchoFaja + ' cm'
    return anchoFaja * 1500 * numFajas
  }

  function calcular() {
    const ancho = val('tapa_ancho')
    const alto  = val('tapa_alto')
    const tapa  = ancho * alto * 18

    let faja
    if (tipoActivo === 'nube') {
      faja = calcularFajaNube(ancho, alto)
    } else {
      const perimetro = val('faja_perimetro')
      const numFajas  = perimetro ? Math.ceil(perimetro / 120) : 0
      const anchoFaja = document.getElementById('faja_gruesa').checked
                          ? (val('faja_ancho_custom') || 6) : 6
      faja = numFajas * anchoFaja * 1500
    }

    const areaCm2 = ancho * alto
    const pvc     = areaCm2 * 3
    document.getElementById('pvc_area').textContent  = areaCm2 ? areaCm2.toLocaleString('es-CO') + ' cm²' : '—'
    document.getElementById('pvc_costo').textContent = areaCm2 ? fmt(pvc) : '—'

    const preciom = 5000
    let luz = 0
    if (tipoActivo === 'letra') {
      const perimetroM = val('faja_perimetro') / 100
      luz = perimetroM * preciom
    } else if (ancho && alto) {
      const separacion = 7
      const pasadas    = alto / separacion
      const rectoCm    = pasadas * ancho
      const curvasCm   = pasadas * (separacion * Math.PI / 2)
      const totalCm    = (rectoCm + curvasCm) * 1.05
      const totalM     = totalCm / 100
      luz = totalM * preciom
      document.getElementById('led_pasadas').textContent  = pasadas.toFixed(1)
      document.getElementById('led_rectos').textContent   = (rectoCm / 100).toFixed(2) + ' m'
      document.getElementById('led_curvas').textContent   = (curvasCm / 100).toFixed(2) + ' m'
      document.getElementById('led_total_m').textContent  = totalM.toFixed(2) + ' m'
    } else {
      ;['led_pasadas','led_rectos','led_curvas','led_total_m'].forEach(id =>
        document.getElementById(id).textContent = '—'
      )
    }

    const instalacion = document.getElementById('transporte').checked
    const grande      = ancho > 150 || alto > 150
    const transporte  = instalacion ? 60000 : 10000
    document.getElementById('transporte_desc').textContent = instalacion
      ? (grande ? 'Con instalacion — aviso grande' : 'Con instalacion')
      : 'Sin instalacion'

    const vinilo   = document.getElementById('vinilo_check').checked
                       ? (val('vinilo_ancho') * val('vinilo_alto') / 10000) * 45000 : 0
    const apliques = calcularApliques()
    const mdo      = calcularMdo(ancho, alto)
    const necesitaEstructura = document.getElementById('estructura_check').checked
    const estructura = necesitaEstructura
      ? (document.getElementById('estructura_override').checked
          ? (parseFloat(document.getElementById('estructura_manual').value) || 0)
          : 100000)
      : 0

    const items = { tapa, apliques, faja, pvc, luz, mdo, estructura, transporte, vinilo }

    for (const [key, monto] of Object.entries(items)) {
      document.getElementById('v_' + key).textContent = fmt(monto)
      document.getElementById('r_' + key).classList.toggle('zero', monto === 0)
    }

    const total   = Object.values(items).reduce((a, b) => a + b, 0)
    const publico = total / 0.60
    const ganancia = publico - total
    document.getElementById('v_total').textContent    = fmt(total)
    document.getElementById('v_ganancia').textContent = fmt(ganancia)
    document.getElementById('v_publico').textContent  = fmt(publico)
  }

  const COLORES = [
    { nombre: 'Rojo',          precio: 18 },
    { nombre: 'Verde',         precio: 18 },
    { nombre: 'Amarillo',      precio: 18 },
    { nombre: 'Naranja',       precio: 18 },
    { nombre: 'Azul',          precio: 18 },
    { nombre: 'Blanco',        precio: 18 },
    { nombre: 'Aguamarina',    precio: 18 },
    { nombre: 'Marron',        precio: 18 },
    { nombre: 'Morado',        precio: 18 },
    { nombre: 'Dorado espejo', precio: 30 },
    { nombre: 'Plata espejo',  precio: 30 },
    { nombre: 'Rosa espejo',   precio: 30 },
  ]

  function generarApliques() {
    const n = Math.min(parseInt(document.getElementById('apliques_cantidad').value) || 0, 10)
    const container = document.getElementById('apliques_container')
    const prev = [...container.querySelectorAll('.aplique-row')].map(r => ({
      color: r.querySelector('select').value,
      ancho: r.querySelector('.apl-ancho').value,
      alto:  r.querySelector('.apl-alto').value,
    }))
    container.innerHTML = ''
    for (let i = 0; i < n; i++) {
      const opts = COLORES.map(c =>
        `<option value="${c.precio}">${c.nombre}</option>`
      ).join('')
      const row = document.createElement('div')
      row.className = 'aplique-row'
      row.innerHTML = `
        <div class="aplique-num">Aplique ${i + 1}</div>
        <div class="field" style="margin:0">
          <label>Color</label>
          <select onchange="calcular()">${opts}</select>
        </div>
        <div class="field" style="margin:0">
          <label>Ancho (cm)</label>
          <input type="number" class="apl-ancho" min="0" step="0.5" placeholder="Ej: 30" oninput="calcular()" value="${prev[i]?.ancho || ''}" />
        </div>
        <div class="field" style="margin:0">
          <label>Alto (cm)</label>
          <input type="number" class="apl-alto" min="0" step="0.5" placeholder="Ej: 20" oninput="calcular()" value="${prev[i]?.alto || ''}" />
        </div>
        <div class="aplique-subtotal">Subtotal: <span id="apl_sub_${i}">$0</span></div>
      `
      container.appendChild(row)
    }
    calcular()
  }

  function calcularApliques() {
    let total = 0
    document.querySelectorAll('.aplique-row').forEach((row, i) => {
      const precio = parseFloat(row.querySelector('select').value) || 18
      const ancho  = parseFloat(row.querySelector('.apl-ancho').value) || 0
      const alto   = parseFloat(row.querySelector('.apl-alto').value)  || 0
      const sub    = ancho * alto * precio
      total += sub
      const el = document.getElementById('apl_sub_' + i)
      if (el) el.textContent = fmt(sub)
    })
    return total
  }

  function calcularMdo(ancho, alto) {
    const override = document.getElementById('mdo_override').checked
    if (override) return parseFloat(document.getElementById('mdo_manual').value) || 0
    const max = Math.max(ancho || 0, alto || 0)
    let precio, desc
    if (max <= 80)      { precio = 100000; desc = 'Incluida en el precio' }
    else if (max <= 100){ precio = 150000; desc = 'Incluida en el precio' }
    else                { precio = 220000; desc = 'Incluida en el precio' }
    if (!max) desc = 'Incluida en el precio'
    document.getElementById('mdo_desc').textContent = desc
    return precio
  }

  function toggleEstructura() {
    document.getElementById('estructura_panel').classList.toggle('visible', document.getElementById('estructura_override').checked)
    calcular()
  }
  function toggleFajaGruesa() {
    document.getElementById('faja_gruesa_panel').classList.toggle('visible', document.getElementById('faja_gruesa').checked)
    calcular()
  }
  function toggleMdo() {
    const override = document.getElementById('mdo_override').checked
    document.getElementById('mdo_panel').classList.toggle('visible', override)
    if (override) {
      const ancho = val('tapa_ancho'), alto = val('tapa_alto')
      const max  = Math.max(ancho, alto)
      const auto = max <= 80 ? 100000 : max <= 100 ? 150000 : 220000
      document.getElementById('mdo_manual').value = auto || ''
    }
    calcular()
  }
  function toggleDetalle() {
    const panel   = document.getElementById('detalle-panel')
    const btn     = document.getElementById('btn-detalle-regular')
    const visible = panel.classList.toggle('visible')
    btn.textContent = visible ? 'Ocultar detalle ↑' : 'Ver cotizacion detallada ↓'
  }
  function toggleVinilo() {
    document.getElementById('vinilo_panel').classList.toggle('visible', document.getElementById('vinilo_check').checked)
    calcular()
  }
  function limpiar() {
    ;['tapa_ancho','tapa_alto','faja_perimetro','faja_ancho_custom','vinilo_ancho','vinilo_alto']
      .forEach(id => document.getElementById(id).value = '')
    document.getElementById('apliques_cantidad').value = ''
    document.getElementById('apliques_container').innerHTML = ''
    ;['transporte','faja_gruesa','estructura_check','estructura_override','mdo_override','vinilo_check'].forEach(id =>
      document.getElementById(id).checked = false
    )
    ;['faja_gruesa_panel','estructura_panel','mdo_panel','vinilo_panel'].forEach(id =>
      document.getElementById(id).classList.remove('visible')
    )
    document.getElementById('estructura_manual').value = ''
    document.getElementById('mdo_manual').value = ''
    document.getElementById('detalle-panel').classList.remove('visible')
    document.getElementById('btn-detalle-regular').textContent = 'Ver cotizacion detallada ↓'
    calcular()
  }

  setTipo('nube')

  /* ══════════════ NEON FLEX ══════════════ */
  const NEON_SIZES = {
    small:  { precio: 180000, maxPalabras: 2, nombre: 'Pequeño'  },
    medium: { precio: 250000, maxPalabras: 3, nombre: 'Mediano'  },
    large:  { precio: 340000, maxPalabras: 5, nombre: 'Grande'   },
  }
  const NEON_MEDIDAS = { small: '60 × 45 cm', medium: '80 × 50 cm', large: '100 × 60 cm' }
  let neonTamanoActivo = 'small'
  const WHATSAPP_NUM = '573204587531'

  function neonPalabras() {
    return (document.getElementById('neon-input').value.trim().split(/\s+/).filter(Boolean)).length
  }
  function neonActualizar() {
    const raw    = document.getElementById('neon-input').value
    const texto  = raw.trim() || 'Tu Texto'
    const display = document.getElementById('neon-display')
    display.innerHTML = texto.replace(/\n/g, '<br>')
    const palabras = neonPalabras()
    const size     = NEON_SIZES[neonTamanoActivo]
    const warning  = document.getElementById('neon-warning')
    if (neonTamanoActivo !== 'custom' && size && palabras > size.maxPalabras) {
      warning.textContent = `⚠️ El tamaño ${size.nombre} permite máximo ${size.maxPalabras} palabra${size.maxPalabras > 1 ? 's' : ''}. Actualmente tienes ${palabras}. Elige un tamaño mayor o reduce el texto.`
      warning.classList.add('visible')
    } else {
      warning.classList.remove('visible')
    }
    neonPrecio()
  }
  function neonFont(fuente) {
    document.getElementById('neon-display').style.fontFamily = `'${fuente}', cursive, sans-serif`
    document.querySelectorAll('.font-pill').forEach(p => p.classList.remove('active'))
    event.target.classList.add('active')
  }
  function neonColor(el, color) {
    document.getElementById('neon-display').style.textShadow =
      `0 0 6px #fff, 0 0 12px #fff, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 70px ${color}, 0 0 100px ${color}`
    document.getElementById('acrylic-flood-edge').setAttribute('flood-color', color)
    document.getElementById('acrylic-flood-halo').setAttribute('flood-color', color)
    document.querySelectorAll('#swatches-color .swatch').forEach(s => s.classList.remove('active'))
    el.classList.add('active')
  }
  function neonBg(el, color) {
    document.getElementById('neon-bg').style.background = color
    document.querySelectorAll('#swatches-bg .swatch').forEach(s => s.classList.remove('active'))
    el.classList.add('active')
  }
  function neonTamano(tamano) {
    neonTamanoActivo = tamano
    ;['small','medium','large'].forEach(s =>
      document.getElementById('size-' + s).classList.toggle('active', s === tamano)
    )
    neonActualizar()
  }
  function neonPrecio() {
    if (neonTamanoActivo === 'custom') {
      document.getElementById('neon-overlay-medida').textContent = 'Medida personalizada'
      document.getElementById('neon-overlay-precio').textContent = 'Consultar'
      return
    }
    const base       = NEON_SIZES[neonTamanoActivo].precio
    const instalacion = document.getElementById('neon-instalacion').checked ? 50000 : 0
    const total      = base + instalacion
    document.getElementById('neon-overlay-medida').textContent = NEON_MEDIDAS[neonTamanoActivo]
    document.getElementById('neon-overlay-precio').textContent = fmt(total)
  }
  function neonAlign(dir) {
    document.getElementById('neon-display').style.textAlign = dir
    ;['left','center','right'].forEach(d =>
      document.getElementById('align-' + d).classList.toggle('active', d === dir)
    )
  }
  function neonWhatsapp() {
    const texto = document.getElementById('neon-input').value.trim().replace(/\n/g, ' ')
    const msg   = encodeURIComponent(`Hola, quiero cotizar un Neon Flex de tamaño personalizado${texto ? ' con el texto: ' + texto : ''}.`)
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${msg}`, '_blank')
  }

  /* ══════════════ CAPTURA NEON ══════════════ */
  function _capturarCanvas() {
    const box = document.getElementById('neon-bg')
    return html2canvas(box, {
      backgroundColor: box.style.background || '#0a0a0a',
      scale: 2, useCORS: true, logging: false,
    })
  }
  async function copiarNeon(btn) {
    const original = btn.innerHTML
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Capturando…'
    btn.disabled = true
    try {
      const canvas = await _capturarCanvas()
      canvas.toBlob(async blob => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiada!'
          setTimeout(() => { btn.innerHTML = original; btn.disabled = false }, 2200)
        } catch {
          _descargarBlob(canvas)
          btn.innerHTML = original
          btn.disabled = false
        }
      }, 'image/png')
    } catch {
      btn.innerHTML = original
      btn.disabled = false
    }
  }
  function _descargarBlob(canvas) {
    const texto = (document.getElementById('neon-input').value.trim() || 'neon').replace(/\s+/g, '-').slice(0, 30)
    const link  = document.createElement('a')
    link.download = `nexus-neon-${texto}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  async function descargarNeon() {
    const canvas = await _capturarCanvas()
    _descargarBlob(canvas)
  }

  /* ══════════════ LOGIN ══════════════ */
  const _PW = btoa('nexus2025')

  function loginCheck() {
    const input = document.getElementById('login-input')
    const err   = document.getElementById('login-error')
    if (btoa(input.value) === _PW) {
      sessionStorage.setItem('nx_auth', _PW)
      document.getElementById('login-overlay').classList.add('oculto')
      input.value = ''
      err.textContent = ''
    } else {
      err.textContent = 'Contraseña incorrecta'
      document.getElementById('login-box').classList.add('shake')
      input.value = ''
      input.focus()
      setTimeout(() => document.getElementById('login-box').classList.remove('shake'), 450)
    }
  }

  ;(function initAuth() {
    if (sessionStorage.getItem('nx_auth') === _PW) {
      document.getElementById('login-overlay').classList.add('oculto')
    } else {
      document.getElementById('login-input').focus()
    }
  })()

  /* ══════════════ NAVEGACIÓN ══════════════ */
  function showView(view) {
    ;['cotizador','cotizaciones','pedidos','dashboard','control-financiero'].forEach(v => {
      const el     = document.getElementById('view-' + v)
      const tab    = document.getElementById('tab-' + v)
      const mobTab = document.getElementById('mob-tab-' + v)
      if (el)     el.style.display = v === view ? '' : 'none'
      if (tab)    tab.classList.toggle('active', v === view)
      if (mobTab) mobTab.classList.toggle('active', v === view)
    })
    if (view === 'cotizaciones')       renderCotizaciones()
    if (view === 'pedidos')            renderPedidos()
    if (view === 'dashboard')          renderDashboard()
    if (view === 'control-financiero') renderControlFinanciero()
  }

  /* ── MENÚ MOBILE ── */
  function toggleMobileMenu() {
    const menu = document.getElementById('nav-mobile-menu')
    const btn  = document.getElementById('nav-hamburger')
    const open = menu.classList.toggle('open')
    btn.classList.toggle('open', open)
  }
  function closeMobileMenu() {
    document.getElementById('nav-mobile-menu').classList.remove('open')
    document.getElementById('nav-hamburger').classList.remove('open')
  }
  document.addEventListener('click', e => {
    const menu = document.getElementById('nav-mobile-menu')
    if (!menu || !menu.classList.contains('open')) return
    if (!menu.contains(e.target) && !document.getElementById('nav-hamburger').contains(e.target)) {
      closeMobileMenu()
    }
  })

  /* ══════════════ CARRITO ══════════════ */
  let _carrito = []
  let _precioGuardar = 0
  let _guardarDesdeCarrito = false
  let _carritoItemsGuardar = null
  let _editCotId   = null
  let _editCotItems = []

  function agregarAlCarrito() {
    const precioElMap = { neon: 'neon-overlay-precio', vinilo: 'vinilo_v_publico', acrilio: 'acr_v_publico' }
    const elId = precioElMap[tipoActivo] || 'v_publico'
    const txt  = document.getElementById(elId).textContent
    const precio = parseInt(txt.replace(/\D/g, '')) || 0
    if (!precio) { alert('El precio es $0 — configura el aviso primero.'); return }

    // Capturar costo de fabricación para productos con margen (nube, letra, acrilio)
    const costoElMap = { nube: 'v_total', letra: 'v_total', acrilio: 'acrd_total' }
    const costoElId  = costoElMap[tipoActivo]
    let costo = null
    if (costoElId) {
      const costoEl = document.getElementById(costoElId)
      if (costoEl) costo = parseInt(costoEl.textContent.replace(/\D/g,'')) || null
    }

    let desc = TIPO_LABEL[tipoActivo] || tipoActivo
    if (tipoActivo === 'nube' || tipoActivo === 'letra') {
      const ancho = document.getElementById('tapa_ancho').value
      const alto  = document.getElementById('tapa_alto').value
      if (ancho && alto) desc += ` · ${ancho}×${alto} cm`
    } else if (tipoActivo === 'neon') {
      const tamano = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' }[neonTamanoActivo] || ''
      if (tamano) desc += ` · ${tamano}`
    } else if (tipoActivo === 'acrilio') {
      const esCirc = document.getElementById('acr_circular_check').checked
      if (esCirc) {
        const btn = document.querySelector('.diametro-btn.active')
        if (btn) desc += ` circular Ø${btn.dataset.diametro} cm`
      } else {
        const ancho = document.getElementById('acr_ancho').value
        const alto  = document.getElementById('acr_alto').value
        if (ancho && alto) desc += ` · ${ancho}×${alto} cm`
      }
    }

    _carrito.push({ id: Date.now(), tipoLabel: TIPO_LABEL[tipoActivo] || tipoActivo, desc, precio, costo })
    actualizarCarritoBadge()
    mostrarToastCarrito()
  }

  function actualizarCarritoBadge() {
    const n = _carrito.length
    // badge dentro del modal
    document.getElementById('carrito-badge').textContent = n
    // botón del nav
    const navBtn = document.getElementById('nav-cart-btn')
    document.getElementById('nav-carrito-badge').textContent = n
    navBtn.classList.toggle('visible', n > 0)
    // botón flotante (oculto por CSS, pero actualizamos por si acaso)
    document.getElementById('btn-carrito-flotante').classList.toggle('visible', n > 0)
  }

  let _toastTimer = null
  function mostrarToastCarrito() {
    const toast = document.getElementById('carrito-toast')
    toast.classList.add('visible')
    clearTimeout(_toastTimer)
    _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000)
  }

  function abrirCarrito() {
    renderCarrito()
    document.getElementById('carrito-drawer').classList.add('visible')
    document.getElementById('carrito-backdrop').classList.add('visible')
  }

  function cerrarCarrito() {
    document.getElementById('carrito-drawer').classList.remove('visible')
    document.getElementById('carrito-backdrop').classList.remove('visible')
  }

  function renderCarrito() {
    const lista    = document.getElementById('carrito-lista')
    const subtotal = _carrito.reduce((s, i) => s + i.precio, 0)
    lista.innerHTML = _carrito.length
      ? _carrito.map(item => `
          <div class="carrito-item">
            <div class="carrito-item-top">
              <div class="carrito-item-info">
                <div class="carrito-item-tipo">${item.tipoLabel}</div>
                <div class="carrito-item-desc">${item.desc}</div>
              </div>
              <button class="carrito-item-del" onclick="eliminarDeCarrito(${item.id})">✕</button>
            </div>
            <div class="carrito-item-bottom">
              <span class="carrito-item-precio-label">Precio</span>
              <input class="carrito-item-precio-input" type="number" value="${item.precio}" min="0" step="1000"
                onchange="actualizarPrecioItem(${item.id}, this.value)" />
            </div>
          </div>`).join('')
      : '<p style="color:var(--muted);text-align:center;padding:30px 0;">El carrito está vacío</p>'

    document.getElementById('carrito-subtotal-val').textContent = fmt(subtotal)
    const inp = document.getElementById('carrito-precio-input')
    if (!inp.dataset.editado || !_carrito.length) {
      inp.value = subtotal
      inp.dataset.editado = ''
    }
  }

  function actualizarPrecioItem(id, val) {
    const precio = parseInt(val) || 0
    const item = _carrito.find(i => i.id === id)
    if (item) {
      item.precio = precio
      const subtotal = _carrito.reduce((s, i) => s + i.precio, 0)
      document.getElementById('carrito-subtotal-val').textContent = fmt(subtotal)
      const inp = document.getElementById('carrito-precio-input')
      if (!inp.dataset.editado) {
        inp.value = subtotal
      }
    }
  }

  function eliminarDeCarrito(id) {
    _carrito = _carrito.filter(i => i.id !== id)
    actualizarCarritoBadge()
    document.getElementById('carrito-precio-input').dataset.editado = ''
    renderCarrito()
  }

  function sincronizarPrecioCarrito() {
    document.getElementById('carrito-precio-input').dataset.editado = '1'
  }

  function vaciarCarrito() {
    if (!confirm('¿Vaciar el carrito?')) return
    _carrito = []
    const inp = document.getElementById('carrito-precio-input')
    inp.value = ''
    inp.dataset.editado = ''
    actualizarCarritoBadge()
    cerrarCarrito()
  }

  async function guardarDesdeCarrito() {
    if (!_carrito.length) { alert('El carrito está vacío.'); return }
    const inp = document.getElementById('carrito-precio-input')
    const precio = parseInt(inp.value) || _carrito.reduce((s, i) => s + i.precio, 0)
    _precioGuardar = precio
    _guardarDesdeCarrito = true
    _carritoItemsGuardar = _carrito.map(i => ({ tipoLabel: i.tipoLabel, desc: i.desc, precio: i.precio }))
    cerrarCarrito()
    await abrirModalGuardar()
    document.getElementById('save-desc').value = ''
  }

  /* ══════════════ MODAL GUARDAR ══════════════ */
  let _imgDataGuardar = null

  function onImgUpload(input) {
    if (!input.files || !input.files[0]) return
    const file = input.files[0]
    document.getElementById('upload-label-txt').textContent = file.name
    const reader = new FileReader()
    reader.onload = e => {
      _imgDataGuardar = e.target.result
      document.getElementById('modal-img-preview').innerHTML = `<img src="${_imgDataGuardar}" alt="preview" />`
    }
    reader.readAsDataURL(file)
  }

  async function abrirModalGuardar() {
    _imgDataGuardar = null
    document.getElementById('save-cliente').value  = ''
    document.getElementById('save-contacto').value = ''
    document.getElementById('save-desc').value     = ''
    document.getElementById('save-img-file').value = ''
    document.getElementById('upload-label-txt').textContent = 'Subir imagen desde el PC (opcional)'
    document.getElementById('modal-img-preview').innerHTML = '<span>Capturando vista previa…</span>'

    const descLabel = document.getElementById('save-desc-label')
    const descTA    = document.getElementById('save-desc')
    if (_guardarDesdeCarrito) {
      descLabel.textContent = 'Nota adicional (opcional)'
      descTA.placeholder    = 'Ej: incluye instalación, entrega a domicilio…'
    } else {
      descLabel.textContent = 'Descripción'
      descTA.placeholder    = 'Ej: Aviso nube 80×60 cm, acrílico blanco, vinilo e instalación…'
    }

    document.getElementById('modal-guardar').classList.add('visible')

    try {
      const targetMap = {
        neon:    'neon-preview-wrapper',
        vinilo:  'vinilo-precio',
        acrilio: 'acrilio-precio',
      }
      const target = document.getElementById(targetMap[tipoActivo] || 'precio-cliente')
      const bg = tipoActivo === 'neon' ? '#0a0a0a' : '#0e0e0e'
      const canvas = await html2canvas(target, { backgroundColor: bg, scale: 2, useCORS: true, logging: false })
      _imgDataGuardar = canvas.toDataURL('image/png')
      document.getElementById('modal-img-preview').innerHTML = `<img src="${_imgDataGuardar}" alt="preview" />`
    } catch {
      document.getElementById('modal-img-preview').innerHTML = '<span style="color:#555">Sin vista previa</span>'
    }
    document.getElementById('save-cliente').focus()
  }

  function cerrarModalGuardar() {
    document.getElementById('modal-guardar').classList.remove('visible')
    _imgDataGuardar = null
  }

  async function confirmarGuardar() {
    const cliente     = document.getElementById('save-cliente').value.trim()
    const contacto    = document.getElementById('save-contacto').value.trim()
    const descripcion = document.getElementById('save-desc').value.trim()

    let precioNum
    if (_guardarDesdeCarrito && _precioGuardar) {
      precioNum = _precioGuardar
    } else {
      const precioElMap = {
        neon:    'neon-overlay-precio',
        vinilo:  'vinilo_v_publico',
        acrilio: 'acr_v_publico',
      }
      const precioEl = document.getElementById(precioElMap[tipoActivo] || 'v_publico').textContent
      precioNum = parseInt(precioEl.replace(/\D/g,'')) || 0
    }

    const btnSave = document.querySelector('.btn-modal-save')
    const origTxt = btnSave.innerHTML
    btnSave.disabled = true
    btnSave.textContent = 'Guardando…'

    let descripcionFinal = descripcion || null
    if (_guardarDesdeCarrito && _carritoItemsGuardar?.length) {
      descripcionFinal = JSON.stringify({ items: _carritoItemsGuardar, nota: descripcion || '' })
    }

    const { error } = await sb.from('Cotizacion').insert({
      tipo:        _guardarDesdeCarrito ? 'carrito' : tipoActivo,
      cliente:     cliente || 'Sin nombre',
      contacto:    contacto || null,
      descripcion: descripcionFinal,
      precio:      precioNum,
      imagen:      _imgDataGuardar || null,
      estado:      'pendiente'
    })

    btnSave.disabled = false
    btnSave.innerHTML = origTxt

    if (error) { alert('Error al guardar: ' + error.message); return }

    if (_guardarDesdeCarrito) {
      _carrito = []
      _guardarDesdeCarrito = false
      _precioGuardar = 0
      _carritoItemsGuardar = null
      actualizarCarritoBadge()
    }

    await actualizarBadge()
    cerrarModalGuardar()

    const btn = document.querySelector('.btn-save-cotizacion')
    if (btn) {
      const orig = btn.innerHTML
      btn.innerHTML = '✓ Guardada'
      btn.style.borderColor = 'rgba(110,231,183,.5)'
      btn.style.color = '#6ee7b7'
      setTimeout(() => { btn.innerHTML = orig; btn.style.borderColor = ''; btn.style.color = '' }, 2200)
    }
  }

  /* ══════════════ VINILO ══════════════ */
  function generarViniloPiezas() {
    const n = Math.min(parseInt(document.getElementById('vinilo_cant').value) || 0, 10)
    const box = document.getElementById('vinilo_piezas_box')
    const prev = [...box.querySelectorAll('.vinilo-pieza-row')].map(r => ({
      ancho: r.querySelector('.vp-ancho').value,
      alto:  r.querySelector('.vp-alto').value,
    }))
    box.innerHTML = ''
    for (let i = 0; i < n; i++) {
      const row = document.createElement('div')
      row.className = 'aplique-row vinilo-pieza-row'
      row.innerHTML = `
        <div class="aplique-num">Pieza ${i + 1}</div>
        <div class="field" style="margin:0">
          <label>Ancho (cm)</label>
          <input type="number" class="vp-ancho" min="0" step="0.5" placeholder="Ej: 120" oninput="calcularVinilo()" value="${prev[i]?.ancho || ''}" />
        </div>
        <div class="field" style="margin:0">
          <label>Alto (cm)</label>
          <input type="number" class="vp-alto" min="0" step="0.5" placeholder="Ej: 80" oninput="calcularVinilo()" value="${prev[i]?.alto || ''}" />
        </div>
        <div class="aplique-subtotal">Subtotal: <span id="vp_sub_${i}">$0</span></div>
      `
      box.appendChild(row)
    }
    calcularVinilo()
  }

  function calcularVinilo() {
    let areaTotal = 0
    document.querySelectorAll('.vinilo-pieza-row').forEach((row, i) => {
      const ancho = parseFloat(row.querySelector('.vp-ancho').value) || 0
      const alto  = parseFloat(row.querySelector('.vp-alto').value)  || 0
      const areaPieza = (ancho * alto) / 10000
      areaTotal += areaPieza
      const el = document.getElementById('vp_sub_' + i)
      if (el) el.textContent = fmt(areaPieza * 50000)
    })

    const costoVinilo = areaTotal * 50000
    document.getElementById('vinilo_area_val').textContent  = areaTotal.toFixed(3) + ' m²'
    document.getElementById('vinilo_costo_val').textContent = fmt(costoVinilo)

    const instCheck  = document.getElementById('vinilo_inst_check').checked
    const panel      = document.getElementById('vinilo_inst_panel')
    panel.classList.toggle('visible', instCheck)

    const autoGratis = areaTotal > 3
    const gratisNote = document.getElementById('vinilo_auto_gratis_note')
    const gratisChk  = document.getElementById('vinilo_inst_gratis')
    gratisNote.classList.toggle('visible', autoGratis && instCheck)
    if (autoGratis) { gratisChk.checked = true; gratisChk.disabled = true }
    else            { gratisChk.disabled = false }

    const instGratis = gratisChk.checked
    let costoInst = 0
    if (instCheck) {
      costoInst = instGratis ? 0 : 60000
      document.getElementById('vinilo_inst_desc').textContent = instGratis
        ? 'Con instalación — Gratis' : 'Con instalación — $60.000'
    } else {
      document.getElementById('vinilo_inst_desc').textContent = 'Sin instalación'
    }

    const precioFinal = costoVinilo + costoInst

    document.getElementById('vinilo_v_publico').textContent = fmt(precioFinal)
  }

  function limpiarVinilo() {
    document.getElementById('vinilo_cant').value = ''
    document.getElementById('vinilo_piezas_box').innerHTML = ''
    document.getElementById('vinilo_inst_check').checked = false
    document.getElementById('vinilo_inst_gratis').checked = false
    document.getElementById('vinilo_inst_gratis').disabled = false
    document.getElementById('vinilo_inst_panel').classList.remove('visible')
    document.getElementById('vinilo_auto_gratis_note').classList.remove('visible')
    document.getElementById('vinilo-detalle').classList.remove('visible')
    calcularVinilo()
  }

  /* ══════════════ ACRÍLICO ══════════════ */
  function generarApliquesAcrilio() {
    const n = Math.min(parseInt(document.getElementById('acr_apliques_cant').value) || 0, 10)
    const box = document.getElementById('acr_apliques_box')
    const prev = [...box.querySelectorAll('.aplique-row-acr')].map(r => ({
      color: r.querySelector('select').value,
      ancho: r.querySelector('.acra-ancho').value,
      alto:  r.querySelector('.acra-alto').value,
    }))
    box.innerHTML = ''
    for (let i = 0; i < n; i++) {
      const opts = COLORES.map(c => `<option value="${c.precio}">${c.nombre}</option>`).join('')
      const row = document.createElement('div')
      row.className = 'aplique-row aplique-row-acr'
      row.innerHTML = `
        <div class="aplique-num">Aplique ${i + 1}</div>
        <div class="field" style="margin:0">
          <label>Color</label>
          <select onchange="calcularAcrilio()">${opts}</select>
        </div>
        <div class="field" style="margin:0">
          <label>Ancho (cm)</label>
          <input type="number" class="acra-ancho" min="0" step="0.5" placeholder="Ej: 30" oninput="calcularAcrilio()" value="${prev[i]?.ancho || ''}" />
        </div>
        <div class="field" style="margin:0">
          <label>Alto (cm)</label>
          <input type="number" class="acra-alto" min="0" step="0.5" placeholder="Ej: 20" oninput="calcularAcrilio()" value="${prev[i]?.alto || ''}" />
        </div>
        <div class="aplique-subtotal">Subtotal: <span id="acra_sub_${i}">$0</span></div>
      `
      box.appendChild(row)
    }
    calcularAcrilio()
  }

  function toggleAcrilioVinilo() {
    document.getElementById('acr_vinilo_panel').classList.toggle(
      'visible', document.getElementById('acr_vinilo_check').checked
    )
    calcularAcrilio()
  }

  function calcularAcrilio() {
    const ancho = parseFloat(document.getElementById('acr_ancho').value) || 0
    const alto  = parseFloat(document.getElementById('acr_alto').value)  || 0

    const costoBase = ancho * alto * 18

    let costoApliques = 0
    document.getElementById('acr_apliques_box').querySelectorAll('.aplique-row-acr').forEach((row, i) => {
      const precio = parseFloat(row.querySelector('select').value) || 18
      const aw     = parseFloat(row.querySelector('.acra-ancho').value) || 0
      const ah     = parseFloat(row.querySelector('.acra-alto').value)  || 0
      const sub    = aw * ah * precio
      costoApliques += sub
      const el = document.getElementById('acra_sub_' + i)
      if (el) el.textContent = fmt(sub)
    })

    const tieneLuz = document.getElementById('acr_luz_check').checked
    document.getElementById('acr_luz_panel').classList.toggle('visible', tieneLuz)
    const perimetro = 2 * (ancho + alto)
    const costoLuz  = tieneLuz ? (perimetro / 100) * 12000 : 0
    document.getElementById('acr_perim_val').textContent = perimetro ? perimetro + ' cm' : '—'
    document.getElementById('acr_luz_val').textContent   = costoLuz  ? fmt(costoLuz)     : '—'

    const tieneVinilo = document.getElementById('acr_vinilo_check').checked
    let costoVinilo = 0
    if (tieneVinilo) {
      const vAncho = parseFloat(document.getElementById('acr_vinilo_ancho').value) || 0
      const vAlto  = parseFloat(document.getElementById('acr_vinilo_alto').value)  || 0
      const areaM2 = (vAncho * vAlto) / 10000
      costoVinilo  = areaM2 * 50000
      document.getElementById('acr_vinilo_area_val').textContent  = areaM2.toFixed(3) + ' m²'
      document.getElementById('acr_vinilo_costo_val').textContent = fmt(costoVinilo)
    }
    const filaVinilo = document.getElementById('acrd_r_vinilo')
    if (filaVinilo) filaVinilo.style.display = tieneVinilo ? '' : 'none'

    const costoTotal    = costoBase + costoApliques + costoLuz + costoVinilo
    const precioPublico = costoTotal / 0.60
    const ganancia      = precioPublico - costoTotal

    document.getElementById('acr_v_publico').textContent  = fmt(precioPublico)
    document.getElementById('acrd_base').textContent      = fmt(costoBase)
    document.getElementById('acrd_apliques').textContent  = fmt(costoApliques)
    document.getElementById('acrd_luz').textContent       = fmt(costoLuz)
    document.getElementById('acrd_vinilo').textContent    = fmt(costoVinilo)
    document.getElementById('acrd_total').textContent     = fmt(costoTotal)
    document.getElementById('acrd_ganancia').textContent  = fmt(ganancia)
  }

  function toggleDetalleAcrilio() {
    const panel   = document.getElementById('acrilio-detalle')
    const btn     = document.querySelector('#calc-acrilio .btn-detalle')
    const visible = panel.classList.toggle('visible')
    btn.textContent = visible ? 'Ocultar detalle ↑' : 'Ver cotización detallada ↓'
  }

  function limpiarAcrilio() {
    ;['acr_ancho','acr_alto','acr_vinilo_ancho','acr_vinilo_alto'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('acr_apliques_cant').value = ''
    document.getElementById('acr_apliques_box').innerHTML = ''
    document.getElementById('acr_luz_check').checked   = false
    document.getElementById('acr_luz_panel').classList.remove('visible')
    document.getElementById('acr_vinilo_check').checked = false
    document.getElementById('acr_vinilo_panel').classList.remove('visible')
    document.getElementById('acrilio-detalle').classList.remove('visible')
    document.querySelector('#calc-acrilio .btn-detalle').textContent = 'Ver cotización detallada ↓'
    calcularAcrilio()
  }

  /* ══════════════ COTIZACIONES PAGE ══════════════ */
  let _cotizacionesData = []

  async function renderCotizaciones() {
    const listEl  = document.getElementById('cot-lista')
    const emptyEl = document.getElementById('cot-empty')
    listEl.innerHTML = '<div style="text-align:center;padding:48px;color:#555;">Cargando…</div>'
    emptyEl.style.display = 'none'

    const { data: lista, error } = await sb.from('Cotizacion')
      .select('*')
      .not('estado', 'eq', 'convertida')
      .order('fechaCreacion', { ascending: false })

    if (error) {
      listEl.innerHTML = '<div style="color:#f55;padding:20px;text-align:center;">Error al cargar cotizaciones</div>'
      return
    }

    _cotizacionesData = lista || []
    const q = document.getElementById('cot-search')?.value.trim() || ''
    pintarCotizaciones(q)
  }

  function pintarCotizaciones(filtro) {
    const listEl  = document.getElementById('cot-lista')
    const emptyEl = document.getElementById('cot-empty')
    const term    = filtro.toLowerCase()
    const lista   = term
      ? _cotizacionesData.filter(q =>
          q.cliente?.toLowerCase().includes(term) ||
          q.contacto?.toLowerCase().includes(term))
      : _cotizacionesData

    if (!lista.length) {
      listEl.innerHTML = ''
      emptyEl.style.display = ''
      return
    }
    emptyEl.style.display = 'none'

    listEl.innerHTML = lista.map(q => {
      const fecha = fmtFecha(q.fechaCreacion)

      // Detectar si el campo descripcion contiene items JSON del carrito
      let parsedCart = null
      if (q.tipo === 'carrito' && q.descripcion) {
        try {
          const p = JSON.parse(q.descripcion)
          if (Array.isArray(p.items)) parsedCart = p
        } catch {}
      }

      let descHtml
      if (parsedCart) {
        const n = parsedCart.items.length
        descHtml = `<div class="cot-desc cot-desc-items">${n} producto${n !== 1 ? 's' : ''} · ${parsedCart.items.map(i => i.tipoLabel).join(', ')}</div>`
      } else if (q.descripcion) {
        descHtml = `<div class="cot-desc">${escHtml(q.descripcion)}</div>`
      } else {
        descHtml = `<div class="cot-desc" style="opacity:.35">Sin descripción</div>`
      }

      return `
        <div class="cot-card" id="cot-${q.id}">
          <div class="cot-card-img">
            ${q.imagen ? `<img src="${q.imagen}" alt="preview" />` : `<span class="no-img">Sin imagen</span>`}
          </div>
          <div class="cot-card-body">
            <div class="cot-card-top">
              <span class="cot-badge cot-badge-${q.tipo}">${TIPO_LABEL[q.tipo] || q.tipo}</span>
              <span class="cot-fecha">${fecha}</span>
            </div>
            <div class="cot-cliente">${escHtml(q.cliente)}</div>
            ${q.contacto ? `<div class="cot-contacto">📱 ${escHtml(q.contacto)}</div>` : ''}
            ${descHtml}
            <div class="cot-precio">${fmt(q.precio)}</div>
            <div class="cot-card-actions">
              ${parsedCart ? `
                <button class="cot-btn-detalle" onclick="verDetalleCotizacion(${q.id})">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Ver detalle
                </button>
                <button class="cot-btn-editar" onclick="editarCotizacion(${q.id})">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>` : ''}
              ${q.contacto ? `
                <button class="cot-btn-wa" onclick="contactarCliente('${escAttr(q.contacto)}','${escAttr(q.cliente)}')">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.847L0 24l6.335-1.499A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.5-5.188-1.373l-.371-.22-3.762.89.938-3.65-.242-.381A9.96 9.96 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/></svg>
                  WhatsApp
                </button>` : ''}
              <button class="cot-btn-pedido" onclick="convertirEnPedido(${q.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Convertir en pedido
              </button>
              <button class="cot-btn-del" onclick="eliminarCotizacion(${q.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>`
    }).join('')
  }

  function filtrarCotizaciones() {
    const q = document.getElementById('cot-search').value.trim()
    pintarCotizaciones(q)
  }

  function verDetalleCotizacion(cotId) {
    const cot = _cotizacionesData.find(c => c.id === cotId)
    if (!cot) return
    let parsedCart
    try { parsedCart = JSON.parse(cot.descripcion) } catch { return }
    if (!Array.isArray(parsedCart.items)) return

    const { items, nota } = parsedCart
    const subtotal = items.reduce((s, i) => s + i.precio, 0)

    document.getElementById('detalle-cot-cliente').textContent = cot.cliente || 'Sin nombre'
    document.getElementById('detalle-cot-lista').innerHTML = items.map(item => `
      <div class="detalle-item">
        <div class="detalle-item-info">
          <div class="detalle-item-tipo">${escHtml(item.tipoLabel)}</div>
          <div class="detalle-item-desc">${escHtml(item.desc)}</div>
        </div>
        <div class="detalle-item-precios">
          ${item.costo != null ? `
            <div class="detalle-precio-row">
              <span class="detalle-precio-label">Fabricación</span>
              <span class="detalle-precio-val costo-val">${fmt(item.costo)}</span>
            </div>
            <div class="detalle-precio-row">
              <span class="detalle-precio-label">Al cliente</span>
              <span class="detalle-precio-val pub-val">${fmt(item.precio)}</span>
            </div>` : `
            <div class="detalle-precio-row">
              <span class="detalle-precio-label">Precio fijo</span>
              <span class="detalle-precio-val pub-val">${fmt(item.precio)}</span>
            </div>`}
        </div>
      </div>`).join('')

    const notaEl = document.getElementById('detalle-cot-nota')
    notaEl.textContent = nota || ''
    notaEl.style.display = nota ? '' : 'none'

    document.getElementById('detalle-cot-subtotal').textContent = fmt(subtotal)
    document.getElementById('detalle-cot-final').textContent = fmt(cot.precio)
    const filaDesc = document.getElementById('detalle-cot-fila-descuento')
    filaDesc.style.display = (cot.precio !== subtotal) ? '' : 'none'

    document.getElementById('modal-detalle-carrito').classList.add('visible')
  }

  function cerrarDetalleCarrito() {
    document.getElementById('modal-detalle-carrito').classList.remove('visible')
  }

  // ── Editar cotización ──────────────────────────────
  function editarCotizacion(cotId) {
    const cot = _cotizacionesData.find(c => c.id === cotId)
    if (!cot) return
    let parsedCart
    try { parsedCart = JSON.parse(cot.descripcion) } catch { return }
    if (!Array.isArray(parsedCart.items)) return

    _editCotId    = cotId
    _editCotItems = parsedCart.items.map(i => ({ ...i }))

    document.getElementById('cot-edit-nota').value     = parsedCart.nota || ''
    document.getElementById('cot-edit-precio').value   = cot.precio
    renderEditCotLista()

    document.getElementById('cot-edit-drawer').classList.add('visible')
    document.getElementById('cot-edit-backdrop').classList.add('visible')
  }

  function cerrarEditCotizacion() {
    document.getElementById('cot-edit-drawer').classList.remove('visible')
    document.getElementById('cot-edit-backdrop').classList.remove('visible')
    _editCotId = null
    _editCotItems = []
  }

  function renderEditCotLista() {
    const subtotal = _editCotItems.reduce((s, i) => s + i.precio, 0)
    document.getElementById('cot-edit-subtotal').textContent = fmt(subtotal)

    document.getElementById('cot-edit-lista').innerHTML = _editCotItems.length
      ? _editCotItems.map((item, idx) => `
          <div class="carrito-item">
            <div class="carrito-item-top">
              <div class="carrito-item-info">
                <div class="carrito-item-tipo">${escHtml(item.tipoLabel)}</div>
                <div class="carrito-item-desc">${escHtml(item.desc)}</div>
              </div>
              <button class="carrito-item-del" onclick="eliminarItemCotEdit(${idx})">✕</button>
            </div>
            <div class="carrito-item-bottom">
              <span class="carrito-item-precio-label">Precio al cliente</span>
              <input class="carrito-item-precio-input" type="number" value="${item.precio}" min="0" step="1000"
                onchange="actualizarPrecioCotEdit(${idx}, this.value)" />
            </div>
          </div>`).join('')
      : '<p style="color:var(--muted);text-align:center;padding:30px 0;">Sin productos</p>'
  }

  function eliminarItemCotEdit(idx) {
    _editCotItems.splice(idx, 1)
    renderEditCotLista()
  }

  function actualizarPrecioCotEdit(idx, val) {
    _editCotItems[idx].precio = parseInt(val) || 0
    const subtotal = _editCotItems.reduce((s, i) => s + i.precio, 0)
    document.getElementById('cot-edit-subtotal').textContent = fmt(subtotal)
    const inp = document.getElementById('cot-edit-precio')
    if (!inp.dataset.editado) inp.value = subtotal
  }

  async function guardarEdicionCotizacion() {
    if (!_editCotId) return
    const nota     = document.getElementById('cot-edit-nota').value.trim()
    const precio   = parseInt(document.getElementById('cot-edit-precio').value) || 0
    const newDesc  = JSON.stringify({ items: _editCotItems, nota })
    const { error } = await sb.from('Cotizacion')
      .update({ descripcion: newDesc, precio })
      .eq('id', _editCotId)
    if (error) { alert('Error al guardar: ' + error.message); return }
    cerrarEditCotizacion()
    renderCotizaciones()
  }

  async function eliminarCotizacion(id) {
    if (!confirm('¿Eliminar esta cotización?')) return
    await sb.from('Cotizacion').delete().eq('id', id)
    await actualizarBadge()
    renderCotizaciones()
  }

  function contactarCliente(contacto, nombre) {
    const num  = contacto.replace(/\D/g,'')
    const msg  = encodeURIComponent(`Hola ${nombre}, te contactamos de Nexus LED con información sobre tu cotización.`)
    const link = num.length >= 7
      ? `https://wa.me/57${num.replace(/^57/,'')}?text=${msg}`
      : `tel:${contacto}`
    window.open(link, '_blank')
  }

  async function actualizarBadge() {
    const { count } = await sb.from('Cotizacion')
      .select('*', { count: 'exact', head: true })
      .not('estado', 'eq', 'convertida')
    const n = count || 0
    ;['nav-badge','mob-nav-badge'].forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      el.textContent  = n
      el.style.display = n ? '' : 'none'
    })
  }

  /* ══════════════ PEDIDOS ══════════════ */
  const ESTADOS = [
    'Pedido realizado',
    'En proceso',
    'Enviado a proveedor',
    'En fabricación',
    'Terminado',
    'Entregado'
  ]

  let _cotizacionIdConvertir = null

  function convertirEnPedido(cotizacionId) {
    _cotizacionIdConvertir = cotizacionId
    document.getElementById('conv-abono').value = ''
    document.getElementById('conv-fecha').value = ''
    document.getElementById('modal-convertir').classList.add('visible')
  }

  function cerrarModalConvertir() {
    document.getElementById('modal-convertir').classList.remove('visible')
    _cotizacionIdConvertir = null
  }

  async function confirmarConvertir() {
    const cotizacionId = _cotizacionIdConvertir
    if (!cotizacionId) return

    const abonoVal = parseFloat(document.getElementById('conv-abono').value) || 0
    const fechaVal = document.getElementById('conv-fecha').value

    const { data: cot } = await sb.from('Cotizacion').select('*').eq('id', cotizacionId).single()
    if (!cot) { alert('No se encontró la cotización.'); return }

    const fechaEntrega = fechaVal
      ? new Date(fechaVal + 'T12:00:00').toISOString()
      : (() => { const d = new Date(); d.setDate(d.getDate() + 8); return d.toISOString() })()

    const { error } = await sb.from('Pedido').insert({
      cotizacionId: cotizacionId,
      cliente:      cot.cliente,
      contacto:     cot.contacto || null,
      descripcion:  cot.descripcion || null,
      precio:       cot.precio,
      imagen:       cot.imagen || null,
      tipo:         cot.tipo,
      estado:       'Pedido realizado',
      fechaEntrega: fechaEntrega,
      abono:        abonoVal
    })

    if (error) { alert('Error: ' + error.message); return }

    await sb.from('Cotizacion').update({ estado: 'convertida' }).eq('id', cotizacionId)
    cerrarModalConvertir()
    await actualizarBadgePedidos()
    await actualizarBadge()
    showView('pedidos')
  }

  let _pedidosData = []

  async function renderPedidos() {
    const lista = document.getElementById('ped-lista')
    const empty = document.getElementById('ped-empty')
    lista.innerHTML = '<div style="text-align:center;padding:48px;color:#555;">Cargando…</div>'
    empty.style.display = 'none'

    const { data: pedidos, error } = await sb.from('Pedido')
      .select('*')
      .order('fechaPedido', { ascending: false })

    _pedidosData = pedidos || []
    const q = document.getElementById('ped-search')?.value.trim() || ''
    pintarPedidos(q)
  }

  function filtrarPedidos() {
    const q = document.getElementById('ped-search').value.trim()
    pintarPedidos(q)
  }

  function pintarPedidos(filtro) {
    const lista = document.getElementById('ped-lista')
    const empty = document.getElementById('ped-empty')
    const term  = filtro.toLowerCase()
    const pedidos = term
      ? _pedidosData.filter(p =>
          p.cliente?.toLowerCase().includes(term) ||
          p.contacto?.toLowerCase().includes(term))
      : _pedidosData

    if (!pedidos.length) {
      lista.innerHTML = ''
      empty.style.display = ''
      return
    }
    empty.style.display = 'none'

    lista.innerHTML = pedidos.map(p => {
      const idxActivo = ESTADOS.indexOf(p.estado)
      const fecha     = fmtFecha(p.fechaPedido)

      // Detectar si es pedido de carrito con items JSON
      let parsedPedCart = null
      if (p.tipo === 'carrito' && p.descripcion) {
        try {
          const parsed = JSON.parse(p.descripcion)
          if (Array.isArray(parsed.items)) parsedPedCart = parsed
        } catch {}
      }

      // Descripción visible: si es carrito parseado, mostrar resumen legible
      let descHtmlPed = ''
      if (parsedPedCart) {
        const n = parsedPedCart.items.length
        descHtmlPed = `<div class="cot-desc cot-desc-items">${n} producto${n !== 1 ? 's' : ''} · ${parsedPedCart.items.map(i => i.tipoLabel).join(', ')}</div>`
      } else if (p.descripcion) {
        descHtmlPed = `<div class="cot-desc">${escHtml(p.descripcion)}</div>`
      }

      // Sección inferior: barra de progreso para carrito, stepper para producto único
      let bottomSection
      if (parsedPedCart) {
        const items       = parsedPedCart.items
        const terminados  = items.filter(i => i.pedidoEstado === 'Terminado').length
        const total       = items.length
        const pct         = total ? Math.round(terminados / total * 100) : 0
        bottomSection = `
          <div class="pedido-progreso">
            <div class="pedido-progreso-header">
              <span class="pedido-progreso-text">${terminados}/${total} producto${total !== 1 ? 's' : ''} listo${terminados !== 1 ? 's' : ''}</span>
              <button class="pedido-btn-prod" onclick="verDetallePedido(${p.id})">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Ver producción
              </button>
            </div>
            <div class="pedido-progreso-bar" id="progreso-bar-${p.id}">
              <div class="pedido-progreso-fill" style="width:${pct}%"></div>
            </div>
          </div>`
      } else {
        const steps = ESTADOS.map((e, i) => {
          const cls = i < idxActivo ? 'done' : i === idxActivo ? 'active' : ''
          const dot = i < idxActivo ? '✓'   : i === idxActivo ? '●'      : ''
          return `
            <div class="step-item ${cls}" onclick="actualizarEstado(${p.id},'${escAttr(e)}')" title="${e}">
              <div class="step-dot">${dot}</div>
              <div class="step-label">${e}</div>
            </div>`
        }).join('')
        bottomSection = `<div class="pedido-stepper"><div class="stepper-track">${steps}</div></div>`
      }

      return `
        <div class="pedido-card" id="ped-${p.id}">
          <div class="pedido-card-top">
            <div class="pedido-card-img">
              ${p.imagen ? `<img src="${p.imagen}" alt="preview" />` : `<span class="no-img">Sin imagen</span>`}
            </div>
            <div class="pedido-card-body">
              <div class="pedido-card-top-row">
                <span class="cot-badge cot-badge-${p.tipo}">${TIPO_LABEL[p.tipo] || p.tipo}</span>
                <span class="pedido-estado-badge estado-${idxActivo}">${p.estado}</span>
                <span class="cot-fecha">${fecha}</span>
              </div>
              <div class="cot-cliente">${escHtml(p.cliente)}</div>
              ${p.contacto ? `<div class="cot-contacto">📱 ${escHtml(p.contacto)}</div>` : ''}
              ${descHtmlPed}
              <div class="cot-precio">${fmt(p.precio)}</div>
              <div class="pedido-actions">
                ${p.contacto ? `
                  <button class="cot-btn-wa" onclick="contactarCliente('${escAttr(p.contacto)}','${escAttr(p.cliente)}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.847L0 24l6.335-1.499A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.5-5.188-1.373l-.371-.22-3.762.89.938-3.65-.242-.381A9.96 9.96 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/></svg>
                    WhatsApp
                  </button>` : ''}
                <button class="pedido-btn-del" onclick="eliminarPedido(${p.id})">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          ${bottomSection}
        </div>`
    }).join('')
  }

  async function actualizarEstado(pedidoId, nuevoEstado) {
    await sb.from('Pedido').update({ estado: nuevoEstado }).eq('id', pedidoId)
    renderPedidos()
  }

  // ── Detalle de producción por producto ─────────────
  function verDetallePedido(pedidoId) {
    renderDetallePedidoModal(pedidoId)
    document.getElementById('modal-detalle-pedido').classList.add('visible')
  }

  function cerrarDetallePedido() {
    document.getElementById('modal-detalle-pedido').classList.remove('visible')
  }

  function renderDetallePedidoModal(pedidoId) {
    const pedido = _pedidosData.find(p => p.id === pedidoId)
    if (!pedido) return
    let parsedCart
    try { parsedCart = JSON.parse(pedido.descripcion) } catch { return }
    if (!Array.isArray(parsedCart.items)) return

    document.getElementById('detalle-ped-cliente').textContent = pedido.cliente || 'Sin nombre'

    const PROD_ESTADOS = ['Pendiente', 'En fabricación', 'Terminado']
    document.getElementById('detalle-ped-lista').innerHTML = parsedCart.items.map((item, idx) => {
      const estadoItem = item.pedidoEstado || 'Pendiente'
      return `
        <div class="prod-item" id="prod-item-${pedidoId}-${idx}">
          <div class="prod-item-header">
            <div class="detalle-item-tipo">${escHtml(item.tipoLabel)}</div>
            <div class="detalle-item-desc">${escHtml(item.desc)}</div>
          </div>
          <div class="prod-estado-btns">
            ${PROD_ESTADOS.map(e => `
              <button class="prod-estado-btn ${estadoItem === e ? 'active estado-' + e.split(' ')[0].toLowerCase() : ''}"
                onclick="actualizarEstadoItemPedido(${pedidoId}, ${idx}, '${e}')">
                ${e}
              </button>`).join('')}
          </div>
        </div>`
    }).join('')
  }

  async function actualizarEstadoItemPedido(pedidoId, itemIndex, nuevoEstado) {
    const pedido = _pedidosData.find(p => p.id === pedidoId)
    if (!pedido) return
    const parsedCart = JSON.parse(pedido.descripcion)
    parsedCart.items[itemIndex].pedidoEstado = nuevoEstado
    const newDesc = JSON.stringify(parsedCart)
    await sb.from('Pedido').update({ descripcion: newDesc }).eq('id', pedidoId)
    pedido.descripcion = newDesc

    // Actualizar barra de progreso en la tarjeta
    const items      = parsedCart.items
    const terminados = items.filter(i => i.pedidoEstado === 'Terminado').length
    const total      = items.length
    const pct        = total ? Math.round(terminados / total * 100) : 0
    const barEl      = document.getElementById(`progreso-bar-${pedidoId}`)
    if (barEl) barEl.querySelector('.pedido-progreso-fill').style.width = pct + '%'
    const textEl = barEl?.closest('.pedido-progreso')?.querySelector('.pedido-progreso-text')
    if (textEl) textEl.textContent = `${terminados}/${total} producto${total !== 1 ? 's' : ''} listo${terminados !== 1 ? 's' : ''}`

    // Re-renderizar el modal
    renderDetallePedidoModal(pedidoId)
  }

  async function eliminarPedido(id) {
    if (!confirm('¿Eliminar este pedido?')) return
    await sb.from('Pedido').delete().eq('id', id)
    await actualizarBadgePedidos()
    renderPedidos()
  }

  async function actualizarBadgePedidos() {
    const { count } = await sb.from('Pedido').select('*', { count: 'exact', head: true })
    const n = count || 0
    ;['pedidos-badge','mob-pedidos-badge'].forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      el.textContent  = n
      el.style.display = n ? '' : 'none'
    })
  }

  /* ══════════════ DASHBOARD ══════════════ */
  async function renderDashboard() {
    ;['dash-total-cot','dash-total-ped','dash-pendientes','dash-entregados'].forEach(id =>
      document.getElementById(id).textContent = '—'
    )

    const [
      { count: totalCot },
      { count: totalPed },
      { count: pendientes },
      { count: entregados }
    ] = await Promise.all([
      sb.from('Cotizacion').select('*', { count: 'exact', head: true }),
      sb.from('Pedido').select('*', { count: 'exact', head: true }),
      sb.from('Cotizacion').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      sb.from('Pedido').select('*', { count: 'exact', head: true }).eq('estado', 'Entregado'),
    ])

    document.getElementById('dash-total-cot').textContent  = totalCot  || 0
    document.getElementById('dash-total-ped').textContent  = totalPed  || 0
    document.getElementById('dash-pendientes').textContent = pendientes || 0
    document.getElementById('dash-entregados').textContent = entregados || 0

    const [{ data: recPed }, { data: recCot }] = await Promise.all([
      sb.from('Pedido').select('*').order('fechaPedido', { ascending: false }).limit(5),
      sb.from('Cotizacion').select('*').order('fechaCreacion', { ascending: false }).limit(5),
    ])

    const pedList = document.getElementById('dash-ped-lista')
    pedList.innerHTML = recPed?.length
      ? recPed.map(p => {
          const idx = ESTADOS.indexOf(p.estado)
          return `<div class="dash-item">
            <div class="dash-item-left">
              <span class="cot-badge cot-badge-${p.tipo}" style="font-size:.6rem;">${TIPO_LABEL[p.tipo]||p.tipo}</span>
              <span class="dash-item-nombre">${escHtml(p.cliente)}</span>
            </div>
            <div class="dash-item-right">
              <span class="pedido-estado-badge estado-${idx}" style="font-size:.58rem;padding:2px 7px;">${p.estado}</span>
              <span class="dash-monto">${fmt(p.precio)}</span>
            </div>
          </div>`
        }).join('')
      : '<div style="color:#555;text-align:center;padding:28px;font-size:.85rem;">Sin pedidos</div>'

    const cotList = document.getElementById('dash-cot-lista')
    cotList.innerHTML = recCot?.length
      ? recCot.map(c => `
          <div class="dash-item">
            <div class="dash-item-left">
              <span class="cot-badge cot-badge-${c.tipo}" style="font-size:.6rem;">${TIPO_LABEL[c.tipo]||c.tipo}</span>
              <span class="dash-item-nombre">${escHtml(c.cliente)}</span>
            </div>
            <div class="dash-item-right">
              <span style="color:#555;font-size:.75rem;">${fmtFechaCorta(c.fechaCreacion)}</span>
              <span class="dash-monto">${fmt(c.precio)}</span>
            </div>
          </div>`).join('')
      : '<div style="color:#555;text-align:center;padding:28px;font-size:.85rem;">Sin cotizaciones</div>'
  }

  /* ══════════════ CONTROL FINANCIERO ══════════════ */
  let _cfData = []

  async function renderControlFinanciero() {
    const lista = document.getElementById('cf-lista')
    const empty = document.getElementById('cf-empty')
    lista.innerHTML = '<div style="text-align:center;padding:48px;color:#555;">Cargando…</div>'
    empty.style.display = 'none'

    const { data: pedidos } = await sb.from('Pedido')
      .select('*')
      .order('fechaPedido', { ascending: false })

    _cfData = pedidos || []
    const q = document.getElementById('cf-search')?.value.trim() || ''
    pintarControlFinanciero(q)
  }

  function filtrarControlFinanciero() {
    const q = document.getElementById('cf-search').value.trim()
    pintarControlFinanciero(q)
  }

  function pintarControlFinanciero(filtro) {
    const lista = document.getElementById('cf-lista')
    const empty = document.getElementById('cf-empty')
    const term  = filtro.toLowerCase()
    const pedidos = term
      ? _cfData.filter(p =>
          p.cliente?.toLowerCase().includes(term) ||
          p.contacto?.toLowerCase().includes(term))
      : _cfData

    if (!pedidos.length) {
      lista.innerHTML = ''
      empty.style.display = ''
      return
    }
    empty.style.display = 'none'

    lista.innerHTML = pedidos.map(p => {
      const abono    = p.abono || 0
      const saldo    = Math.max(0, p.precio - abono)
      const saldado  = saldo === 0
      const idxActivo = ESTADOS.indexOf(p.estado)

      return `
        <div class="cf-card">
          <div class="cf-card-top">
            <div>
              <div class="cf-cliente">${escHtml(p.cliente)}</div>
              ${p.contacto ? `<div class="cot-contacto" style="margin-top:3px;">📱 ${escHtml(p.contacto)}</div>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${saldado ? '<span class="cf-badge-saldado">✓ Saldado</span>' : ''}
              <button class="cf-ver-mas-btn" onclick="toggleCfDetalle(this)">Ver más</button>
            </div>
          </div>
          <div class="cf-montos">
            <div class="cf-monto-item">
              <span class="cf-monto-label">Total</span>
              <span class="cf-monto-val total">${fmt(p.precio)}</span>
            </div>
            <div class="cf-monto-item">
              <span class="cf-monto-label">Abono</span>
              <span class="cf-monto-val abono">${fmt(abono)}</span>
            </div>
            <div class="cf-monto-item">
              <span class="cf-monto-label">Saldo</span>
              <span class="cf-monto-val saldo ${saldado ? 'cf-saldo-zero' : ''}">${fmt(saldo)}</span>
            </div>
          </div>
          <div class="cf-detalle" style="display:none;">
            <div class="cf-detalle-item">
              <span class="cf-detalle-label">Tipo</span>
              <span class="cf-detalle-val">${TIPO_LABEL[p.tipo] || p.tipo}</span>
            </div>
            <div class="cf-detalle-item">
              <span class="cf-detalle-label">Estado</span>
              <span class="cf-detalle-val">${p.estado}</span>
            </div>
            <div class="cf-detalle-item">
              <span class="cf-detalle-label">Fecha pedido</span>
              <span class="cf-detalle-val">${fmtFecha(p.fechaPedido)}</span>
            </div>
            <div class="cf-detalle-item">
              <span class="cf-detalle-label">Fecha entrega</span>
              <span class="cf-detalle-val">${p.fechaEntrega ? fmtFecha(p.fechaEntrega) : '—'}</span>
            </div>
            ${p.descripcion ? `
            <div class="cf-detalle-item" style="grid-column:1/-1;">
              <span class="cf-detalle-label">Descripción</span>
              <span class="cf-detalle-val">${escHtml(p.descripcion)}</span>
            </div>` : ''}
          </div>
        </div>`
    }).join('')
  }

  function toggleCfDetalle(btn) {
    const detalle = btn.closest('.cf-card').querySelector('.cf-detalle')
    const abierto = detalle.style.display !== 'none'
    detalle.style.display = abierto ? 'none' : 'grid'
    btn.textContent = abierto ? 'Ver más' : 'Ver menos'
  }

  /* ══════════════ INIT ══════════════ */
  Promise.all([actualizarBadge(), actualizarBadgePedidos()])