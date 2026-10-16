let TURNO_ACTUAL = null;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('saludoBienvenida').textContent = saludoSegunHora();
  await verificarTurno();
  await cargarServicios();
  configurarEventos();
});

async function verificarTurno() {
  try {
    const r = await API.turnoActivo();
    if (r.turno_id) {
      TURNO_ACTUAL = r;
      document.getElementById('estadoTurno').innerHTML =
        `<i class="fas fa-circle" style="color:#38a169;font-size:0.6rem;vertical-align:middle;"></i> TURNO ACTIVO — ${r.vendedor} — INICIADO ${r.inicio}`;
      document.getElementById('seccionIniciarTurno').style.display = 'none';
      document.getElementById('seccionVenta').style.display = 'block';
      document.getElementById('seccionFinalizar').style.display = 'block';
    } else {
      document.getElementById('estadoTurno').innerHTML =
        `<i class="fas fa-circle" style="color:#e53e3e;font-size:0.6rem;vertical-align:middle;"></i> SIN TURNO ACTIVO`;
      document.getElementById('seccionIniciarTurno').style.display = 'block';
      document.getElementById('seccionVenta').style.display = 'none';
      document.getElementById('seccionFinalizar').style.display = 'none';
    }
  } catch (e) {
    document.getElementById('estadoTurno').textContent = 'ERROR AL VERIFICAR TURNO';
    mostrarToast('ERROR AL CONECTAR CON EL SERVIDOR', 'error');
  }
}

async function cargarServicios() {
  try {
    const r = await API.listarServicios();
    const sel = document.getElementById('servicio');
    sel.innerHTML = '';
    (r.servicios || []).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sel.appendChild(opt);
    });
  } catch (e) {
    mostrarToast('ERROR AL CARGAR SERVICIOS', 'error');
  }
}

function configurarEventos() {
  document.getElementById('btnIniciarTurno').addEventListener('click', e => {
    const btn = e.currentTarget;
    const vendedor = document.getElementById('selectVendedor').value;
    if (!vendedor) return mostrarToast('SELECCIONE UN VENDEDOR', 'error');

    conCarga(btn, 'INICIANDO...', async () => {
      const r = await API.iniciarTurno(vendedor);
      if (!r.ok) return mostrarToast('ERROR: ' + r.error, 'error');
      mostrarToast(`TURNO INICIADO — ${vendedor}`, 'success');
      setTimeout(() => location.reload(), 900);
    });
  });

  document.getElementById('medioPago').addEventListener('change', e => {
    document.getElementById('bloqueTransferencia').style.display =
      e.target.value === 'TRANSFERENCIA' ? 'block' : 'none';
  });

  document.getElementById('btnAgregarServicio').addEventListener('click', e => {
    const btn = e.currentTarget;
    const nuevo = prompt('NOMBRE DEL NUEVO SERVICIO:');
    if (!nuevo || !nuevo.trim()) return;
    conCarga(btn, 'AGREGANDO...', async () => {
      const r = await API.agregarServicio(nuevo.trim());
      if (!r.ok) return mostrarToast('ERROR: ' + r.error, 'error');
      await cargarServicios();
      mostrarToast('SERVICIO AGREGADO: ' + r.servicio, 'success');
    });
  });

  document.getElementById('btnGenerarBono').addEventListener('click', e => {
    conCarga(e.currentTarget, 'GENERANDO...', generarBono);
  });

  document.getElementById('btnFinalizarTurno').addEventListener('click', e => {
    conCarga(e.currentTarget, 'FINALIZANDO...', finalizarTurno);
  });
}

async function generarBono() {
  const monto = document.getElementById('monto').value;
  const medio = document.getElementById('medioPago').value;
  const titular = document.getElementById('titularTransferencia').value.trim();
  const servicio = document.getElementById('servicio').value;

  if (!monto || Number(monto) <= 0) { mostrarToast('INGRESE UN MONTO VÁLIDO', 'error'); return; }
  if (!servicio) { mostrarToast('SELECCIONE UN SERVICIO', 'error'); return; }
  if (medio === 'TRANSFERENCIA' && !titular) { mostrarToast('INGRESE EL TITULAR DE LA TRANSFERENCIA', 'error'); return; }

  const r = await API.registrarVenta({
    turno_id: TURNO_ACTUAL.turno_id,
    vendedor: TURNO_ACTUAL.vendedor,
    monto: Number(monto),
    medio_pago: medio,
    titular_transferencia: titular,
    servicio
  });

  if (!r.ok) { mostrarToast('ERROR AL REGISTRAR: ' + r.error, 'error'); return; }

  document.getElementById('tkFecha').textContent = 'FECHA: ' + r.fecha;
  document.getElementById('tkHora').textContent  = 'HORA: '  + r.hora;
  document.getElementById('tkMonto').textContent = 'MONTO: $' + r.monto;
  document.getElementById('tkServicio').textContent = r.servicio;

  setTimeout(() => window.print(), 250);

  mostrarToast('BONO REGISTRADO E IMPRESO', 'success');

  document.getElementById('monto').value = '';
  document.getElementById('titularTransferencia').value = '';
  document.getElementById('medioPago').value = 'EFECTIVO';
  document.getElementById('bloqueTransferencia').style.display = 'none';
  document.getElementById('monto').focus();
}

async function finalizarTurno() {
  if (!confirm('¿CONFIRMAR FINALIZACIÓN DEL TURNO?')) return;
  const r = await API.finalizarTurno(TURNO_ACTUAL.turno_id);
  if (!r.ok) { mostrarToast('ERROR: ' + r.error, 'error'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('COOPERADORA HOSPITAL SAN JUAN BAUTISTA', 105, 20, { align: 'center' });
  doc.setFontSize(11);
  doc.text('RESUMEN DE TURNO', 105, 30, { align: 'center' });
  doc.text(`Turno: ${r.turno_id}`, 20, 45);
  doc.text(`Vendedor: ${r.vendedor}`, 20, 52);
  doc.text(`Inicio: ${r.fecha_inicio} ${String(r.hora_inicio).substring(0,5)}`, 20, 59);
  doc.text(`Cantidad de bonos: ${r.cantidad}`, 20, 72);
  doc.text(`Total recaudado: $${r.total}`, 20, 80);
  doc.text('Detalle por servicio:', 20, 95);

  let y = 105;
  Object.keys(r.porServicio || {}).forEach(s => {
    doc.text(`${s}: ${r.porServicio[s].cantidad} bonos — $${r.porServicio[s].monto}`, 25, y);
    y += 8;
  });

  doc.save(`Turno_${r.turno_id}.pdf`);
  mostrarToast('TURNO FINALIZADO — PDF DESCARGADO', 'success');
  setTimeout(() => location.reload(), 1500);
}
