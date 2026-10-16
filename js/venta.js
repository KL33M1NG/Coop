document.getElementById('btnGenerarBono').addEventListener('click', async () => {
  const monto = document.getElementById('monto').value;
  const medio = document.getElementById('medioPago').value;
  const titular = document.getElementById('titularTransferencia').value;
  const servicio = document.getElementById('servicio').value;

  if (!monto || !servicio) return alert('COMPLETE MONTO Y SERVICIO');
  if (medio === 'TRANSFERENCIA' && !titular)
    return alert('INGRESE EL TITULAR DE LA TRANSFERENCIA');

  const turno = await API.turnoActivo();
  if (!turno.turno_id) return alert('DEBE INICIAR TURNO PRIMERO');

  await API.registrarVenta({
    turno_id: turno.turno_id, monto, medio_pago: medio,
    titular_transferencia: titular, servicio
  });

  // Preparar ticket
  const ahora = new Date();
  document.getElementById('tkFecha').textContent = 'FECHA: ' + ahora.toLocaleDateString();
  document.getElementById('tkHora').textContent  = 'HORA: '  + ahora.toLocaleTimeString();
  document.getElementById('tkMonto').textContent = 'MONTO: $' + monto;

  window.print();      // ← se imprime solo en la impresora predeterminada
  limpiarFormulario();
});
