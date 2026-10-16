// MAYÚSCULAS automáticas en todos los inputs de texto
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="text"], textarea').forEach(el => {
    el.addEventListener('input', e => {
      const pos = e.target.selectionStart;
      e.target.value = e.target.value.toUpperCase();
      e.target.setSelectionRange(pos, pos);
    });
  });
  // Solo números en campos numéricos
  document.querySelectorAll('input[type="number"], .solo-numeros').forEach(el => {
    el.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  });
});

// Cálculo de rango (dia/semana/mes/año)
function rangoFechas(filtro) { /* ... */ }
