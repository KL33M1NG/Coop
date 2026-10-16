// ============================================================
// UTILIDADES GENERALES 
// ============================================================

// MAYÚSCULAS automáticas + solo números
function aplicarRestricciones(raiz = document) {
  raiz.querySelectorAll('input[type="text"], textarea').forEach(el => {
    if (el.dataset.restriccion === 'aplicada') return;
    el.dataset.restriccion = 'aplicada';
    el.addEventListener('input', e => {
      const pos = e.target.selectionStart;
      e.target.value = e.target.value.toUpperCase();
      e.target.setSelectionRange(pos, pos);
    });
  });

  raiz.querySelectorAll('input[type="number"], .solo-numeros').forEach(el => {
    if (el.dataset.restriccion === 'aplicada') return;
    el.dataset.restriccion = 'aplicada';
    el.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  });
}

// Saludo según horario
function saludoSegunHora() {
  const h = new Date().getHours();
  if (h < 12) return '¡BUENOS DÍAS!';
  if (h < 19) return '¡BUENAS TARDES!';
  return '¡BUENAS NOCHES!';
}

// Fecha y hora local
function fechaHoy()  { return new Date().toLocaleDateString('es-AR'); }
function horaAhora() { return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }

// ============================================================
// TOAST (notificaciones)
// ============================================================
function mostrarToast(mensaje, tipo = 'info', duracion = 3500) {
  let cont = document.getElementById('toastContainer');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toastContainer';
    document.body.appendChild(cont);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + tipo;
  t.textContent = mensaje;
  cont.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 320);
  }, duracion);
}

// ============================================================
// BOTÓN CON ESTADO DE CARGA
// ============================================================
function conCarga(boton, textoCarga, fn) {
  const original = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;margin-right:6px;vertical-align:middle;"></span>${textoCarga}`;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      boton.disabled = false;
      boton.innerHTML = original;
    });
}

// ============================================================
// MODO OSCURO
// ============================================================
function inicializarModoOscuro() {
  const btn = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  const icon = btn ? btn.querySelector('i') : null;
  if (!btn) return;

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (icon) icon.className = 'fas fa-sun';
    if (label) label.textContent = 'CLARO';
  }
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    if (label) label.textContent = isDark ? 'CLARO' : 'OSCURO';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarRestricciones();
  inicializarModoOscuro();
});
