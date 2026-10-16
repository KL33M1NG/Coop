let TURNO_ACTUAL = null;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('saludoBienvenida').textContent = saludoSegunHora();
  await verificarTurno();
  await cargarServicios();
  configurarEventos();
});

async function verificarTurno() {
  const r = await API.turnoActivo();
  if (r.turno_id) {
    TURNO_ACTUAL = r;
    document.getElementById('estadoTurno').textContent =
      `TURNO ACTIVO: ${r.vendedor} — INICIADO ${r.inicio}`;
    document.getElementById('seccionIniciarTurno').style.display = 'none';
    document.getElementById('seccionVenta').style.display = 'block';
    document.getElementById('seccionFinalizar').style.display = 'block';
  } else {
    document.getElementById('seccionIniciarTurno').style.display = 'block';
    document.getElementById('seccionVenta').style.display = 'none';
    document.getElementById('seccionFinalizar').style.display = 'none';
  }
}

async function cargarServicios() {
  const r = await API.listarServicios();
  const sel = document.getElementById('servicio');
  sel.innerHTML = '';
  (r.servicios || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
}

function configurarEventos() {
  // Iniciar turno
  document.getElementById('btnIniciarTurno').addEventListener('click', async () => {
    const vendedor = document.getElementById('selectVendedor').value;
    if (!vendedor) return alert('SELECCIONE UN VENDEDOR');
    const r = await API.iniciarTurno(vendedor);
    if (!r.ok) return alert('ERROR: ' + r.error);
    alert(`TURNO INICIADO POR ${vendedor}`);
    location.reload();
  });

  // Cambio de medio de pago
  document.getElementById('medioPago').addEventListener('change', e => {
    document.getElementById('bloqueTransferencia').style.display =
      e.target.value === 'TRANSFERENCIA' ? 'block' : 'none';
  });

  // Agregar servicio
  document.getElementById('btnAgregarServicio').addEventListener('click', async () => {
    const nuevo = prompt('NOMBRE DEL NUEVO SERVICIO:');
    if (!nuevo || !nuevo.trim()) return;
    const r = await API.agregarServicio(nuevo.trim());
    if (!r.ok) return alert('ERROR: ' + r.error);
    await cargarServicios();
    alert('SERVICIO AGREGADO: ' + r.servicio);
  });

  // Generar bono
  document.getElementById('btnGenerarBono').addEventListener('click', generarBono);

  // Finalizar turno
  document.getElementById('btnFinalizarTurno').addEventListener('click', finalizarTurno);
}

async function generarBono() {
  const monto = document.getElementById('monto').value;
  const medio = document.getElementById('medioPago').value;
  const titular = document.getElementById('titularTransferencia').value.trim();
  const servicio = document.getElementById('servicio').value;

  if (!monto || Number(monto) <= 0) return alert('INGRESE UN MONTO VÁLIDO');
  if (!servicio) return alert('SELECCIONE UN SERVICIO');
  if (medio === 'TRANSFERENCIA' && !titular)
    return alert('INGRESE EL TITULAR DE LA TRANSFERENCIA');

  const r = await API.registrarVenta({
    turno_id: TURNO_ACTUAL.turno_id,
    vendedor: TURNO_ACTUAL.vendedor,
    monto: Number(monto),
    medio_pago: medio,
    titular_transferencia: titular,
    servicio
  });

  if (!r.ok) return alert('ERROR AL REGISTRAR: ' + r.error);

  // Preparar ticket
  document.getElementById('tkFecha').textContent = 'FECHA: ' + r.fecha;
  document.getElementById('tkHora').textContent  = 'HORA: '  + r.hora;
  document.getElementById('tkMonto').textContent = 'MONTO: $' + r.monto;
  document.getElementById('tkServicio').textContent = r.servicio;

  // Imprimir
  setTimeout(() => window.print(), 200);

  // Limpiar
  document.getElementById('monto').value = '';
  document.getElementById('titularTransferencia').value = '';
  document.getElementById('medioPago').value = 'EFECTIVO';
  document.getElementById('bloqueTransferencia').style.display = 'none';
  document.getElementById('monto').focus();
}

async function finalizarTurno() {
  if (!confirm('¿CONFIRMAR FINALIZACIÓN DEL TURNO?')) return;
  const r = await API.finalizarTurno(TURNO_ACTUAL.turno_id);
  if (!r.ok) return alert('ERROR: ' + r.error);

  // Generar PDF con jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('COOPERADORA HOSPITAL SAN JUAN BAUTISTA', 105, 20, { align: 'center' });
  doc.setFontSize(11);
  doc.text('RESUMEN DE TURNO', 105, 30, { align: 'center' });
  doc.text(`Turno: ${r.turno_id}`, 20, 45);
  doc.text(`Vendedor: ${r.vendedor}`, 20, 52);
  doc.text(`Cantidad de bonos: ${r.cantidad}`, 20, 62);
  doc.text(`Total recaudado: $${r.total}`, 20, 70);
  doc.text('Detalle por servicio:', 20, 85);

  let y = 95;
  Object.keys(r.porServicio || {}).forEach(s => {
    doc.text(`${s}: ${r.porServicio[s].cantidad} bonos — $${r.porServicio[s].monto}`, 25, y);
    y += 8;
  });

  doc.save(`Turno_${r.turno_id}.pdf`);

  alert('TURNO FINALIZADO. PDF DESCARGADO.');
  location.reload();
}
