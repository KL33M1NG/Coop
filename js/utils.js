// MAYÚSCULAS automáticas y solo números
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

// Formatear fecha/hora
function fechaHoy() {
  return new Date().toLocaleDateString('es-AR');
}
function horaAhora() {
  return new Date().toLocaleTimeString('es-AR');
}

document.addEventListener('DOMContentLoaded', () => aplicarRestricciones());
