// Variables globales
let precios = {};
let detalleCosto = [];
let costoTotal = 0;

// Función para obtener los precios (simulación de API)
async function obtenerPrecios() {
    // Simulación de precios obtenidos de una API
    precios = {
        siem: {
            wazuh: { base: 500, porEPS: 1 },
            splunk: { base: 1000, porEPS: 2 },
            elk: { base: 800, porEPS: 1.5 },
            qrader: { base: 1200, porEPS: 2.5 },
            arcsight: { base: 1100, porEPS: 2 }
        },
        soar: {
            shuffle: { base: 400, porPlaybook: 50 },
            phantom: { base: 700, porPlaybook: 70 },
            demisto: { base: 900, porPlaybook: 80 },
            swimlane: { base: 800, porPlaybook: 75 },
            resilient: { base: 850, porPlaybook: 78 }
        },
        dfir: {
            iris: { base: 300, porCaso: 150 },
            autopsy: { base: 400, porCaso: 160 },
            encase: { base: 1000, porCaso: 200 },
            ftk: { base: 900, porCaso: 180 },
            xways: { base: 850, porCaso: 170 }
        },
        edr: {
            threatdown: { base: 200, porEndpoint: 5 },
            crowdstrike: { base: 500, porEndpoint: 8 },
            sentinelone: { base: 450, porEndpoint: 7 },
            carbonblack: { base: 550, porEndpoint: 9 },
            fireeye: { base: 600, porEndpoint: 10 }
        }
    };
}

// Función para inicializar la calculadora
function inicializar() {
    const componentes = ['siem', 'soar', 'dfir', 'edr'];
    componentes.forEach(componente => {
        const checkbox = document.querySelector(`input[name="componentes"][value="${componente}"]`);
        toggleParametros(componente, checkbox.checked);
        checkbox.addEventListener('change', () => {
            actualizarPrecios();
            toggleParametros(componente, checkbox.checked);
        });
    });

    document.querySelectorAll('select, input[type="number"]').forEach(element => {
        element.addEventListener('change', actualizarPrecios);
    });

    actualizarPrecios();
}

// Función para habilitar o deshabilitar parámetros según el componente seleccionado
function toggleParametros(componente, habilitar) {
    const selects = document.querySelectorAll(`select[name="opcion_${componente}"], input[name^="param_${componente}"]`);
    selects.forEach(el => {
        el.disabled = !habilitar;
    });
}

// Función para actualizar los precios mostrados en la tabla
function actualizarPrecios() {
    const componentes = ['siem', 'soar', 'dfir', 'edr'];
    componentes.forEach(componente => {
        const checkbox = document.querySelector(`input[name="componentes"][value="${componente}"]`);
        const precioTd = document.getElementById(`precio_${componente}`);
        if (checkbox.checked) {
            const opcion = document.querySelector(`select[name="opcion_${componente}"]`).value;
            const parametros = precios[componente][opcion];
            let precio = parametros.base;
            if (componente === 'siem') {
                const eps = parseInt(document.querySelector(`input[name="param_siem_eps"]`).value) || 0;
                precio += parametros.porEPS * eps;
            } else if (componente === 'soar') {
                const playbooks = parseInt(document.querySelector(`input[name="param_soar_playbooks"]`).value) || 0;
                precio += parametros.porPlaybook * playbooks;
            } else if (componente === 'dfir') {
                const casos = parseInt(document.querySelector(`input[name="param_dfir_casos"]`).value) || 0;
                precio += parametros.porCaso * casos;
            } else if (componente === 'edr') {
                const endpoints = parseInt(document.querySelector(`input[name="param_edr_endpoints"]`).value) || 0;
                precio += parametros.porEndpoint * endpoints;
            }
            precioTd.innerText = `$${precio.toFixed(2)}`;
        } else {
            precioTd.innerText = '$0';
        }
    });
}

// Función para validar el formulario
function validarFormulario() {
    let valido = true;
    const componentesSeleccionados = document.querySelectorAll('input[name="componentes"]:checked');
    if (componentesSeleccionados.length === 0) {
        alert('Debe seleccionar al menos un componente.');
        valido = false;
    }
    componentesSeleccionados.forEach(componenteCheckbox => {
        const componente = componenteCheckbox.value;
        const inputs = document.querySelectorAll(`input[name^="param_${componente}"]`);
        inputs.forEach(input => {
            if (parseInt(input.value) <= 0 || isNaN(input.value)) {
                alert(`El valor de ${input.previousElementSibling.innerText} debe ser un número positivo.`);
                valido = false;
            }
        });
    });
    return valido;
}

// Función para calcular el costo total
function calcularCosto() {
    if (!validarFormulario()) return;

    costoTotal = 0;
    detalleCosto = [];

    const componentesSeleccionados = Array.from(document.querySelectorAll('input[name="componentes"]:checked')).map(el => el.value);

    componentesSeleccionados.forEach(componente => {
        const opcion = document.querySelector(`select[name="opcion_${componente}"]`).value;
        const parametros = precios[componente][opcion];
        let precio = parametros.base;
        let descripcion = `${componente.toUpperCase()} - ${opcion}: `;

        if (componente === 'siem') {
            const eps = parseInt(document.querySelector(`input[name="param_siem_eps"]`).value) || 0;
            precio += parametros.porEPS * eps;
            descripcion += `Base $${parametros.base} + EPS ($${parametros.porEPS} x ${eps})`;
        } else if (componente === 'soar') {
            const playbooks = parseInt(document.querySelector(`input[name="param_soar_playbooks"]`).value) || 0;
            precio += parametros.porPlaybook * playbooks;
            descripcion += `Base $${parametros.base} + Playbooks ($${parametros.porPlaybook} x ${playbooks})`;
        } else if (componente === 'dfir') {
            const casos = parseInt(document.querySelector(`input[name="param_dfir_casos"]`).value) || 0;
            precio += parametros.porCaso * casos;
            descripcion += `Base $${parametros.base} + Casos ($${parametros.porCaso} x ${casos})`;
        } else if (componente === 'edr') {
            const endpoints = parseInt(document.querySelector(`input[name="param_edr_endpoints"]`).value) || 0;
            precio += parametros.porEndpoint * endpoints;
            descripcion += `Base $${parametros.base} + Endpoints ($${parametros.porEndpoint} x ${endpoints})`;
        }

        costoTotal += precio;
        detalleCosto.push({ descripcion, precio });
    });

    // Mostrar el resultado
    document.getElementById('resultado').innerText = `Costo Total Estimado: $${costoTotal.toFixed(2)}`;

    // Mostrar el detalle del costo
    const listaDetalle = document.getElementById('lista_detalle_costo');
    listaDetalle.innerHTML = '';
    detalleCosto.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerText = item.descripcion;
        const span = document.createElement('span');
        span.className = 'badge bg-primary rounded-pill';
        span.innerText = `$${item.precio.toFixed(2)}`;
        li.appendChild(span);
        listaDetalle.appendChild(li);
    });
}

// Función para exportar la cotización a PDF
function exportarPDF() {
    if (!validarFormulario()) return;

    calcularCosto();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Cotización SOCaaS', 14, 22);
    doc.setFontSize(12);
    let y = 30;

    detalleCosto.forEach(item => {
        doc.text(`${item.descripcion}: $${item.precio.toFixed(2)}`, 14, y);
        y += 10;
    });

    doc.text(`Costo Total Estimado: $${costoTotal.toFixed(2)}`, 14, y + 10);

    doc.save('Cotizacion_SOCAAS.pdf');
}

// Función para enviar el correo electrónico (simulación)
function enviarCorreo() {
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const mensaje = document.getElementById('mensaje').value;

    if (nombre === '' || correo === '' || mensaje === '') {
        alert('Por favor, complete todos los campos del formulario de contacto.');
        return;
    }

    // Aquí podrías enviar la información al servidor para enviar el correo
    alert('Su mensaje ha sido enviado. Nos pondremos en contacto con usted pronto.');

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
    modal.hide();
}

// Función para cambiar el idioma (simulación)
function cambiarIdioma(idioma) {
    // Lógica para cambiar el idioma utilizando i18next
    alert(`Cambio de idioma a: ${idioma}. Esta funcionalidad está en desarrollo.`);
}

// Inicializar la calculadora al cargar la página
window.onload = async function() {
    await obtenerPrecios();
    inicializar();
};
