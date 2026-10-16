const URL_API = 'https://script.google.com/macros/s/AKfycbwGRLT16ItZ83KJ0qJWPFMwF5w6Pw39SSQ02bqhMp3HC5IIMyc-LO9K439ToG31CYjYNQ/exec';

async function llamarAPI(accion, datos = {}) {
  const respuesta = await fetch(URL_API, {
    method: 'POST',
    body: JSON.stringify({ accion, ...datos })
  });
  return respuesta.json();
}

const API = {
  iniciarTurno:      (vendedor) => llamarAPI('iniciarTurno', { vendedor }),
  finalizarTurno:    (turno_id) => llamarAPI('finalizarTurno', { turno_id }),
  registrarVenta:    (datos)    => llamarAPI('registrarVenta', datos),
  listarServicios:   ()         => llamarAPI('listarServicios'),
  agregarServicio:   (s)        => llamarAPI('agregarServicio', { servicio: s }),
  obtenerHistorial:  (filtro)   => llamarAPI('obtenerHistorial', { filtro }),
  obtenerEstadisticas: (filtro) => llamarAPI('obtenerEstadisticas', { filtro }),
  turnoActivo:       ()         => llamarAPI('turnoActivo')
};
