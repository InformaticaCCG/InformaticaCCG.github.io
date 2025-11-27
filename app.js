// =========================================================================
// CONFIGURACIÓN API
// =========================================================================

// **IMPORTANTE: REEMPLAZA CON LA URL DE TU API DE APPS SCRIPT IMPLEMENTADA**
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2FpuMKWddkXGr1-EvYIdACHbty8pQC-DXNFf8cfkPOnIKG4l_vWa4mt9XCsQRfR2G/exec';


/**
 * Función genérica para enviar datos a la API de Apps Script.
 * @param {string} action La acción que debe realizar el backend (LOGIN, GUARDAR_CLIENTE).
 * @param {Object} payload Los datos a enviar.
 * @returns {Promise<Object>} La respuesta parseada del servidor.
 */
async function enviarPeticionApi(action, payload) {
    if (APPS_SCRIPT_URL === 'REEMPLAZAR_CON_LA_URL_DE_TU_API_IMPLEMENTADA') {
        alert("ERROR: La URL de la API no ha sido configurada. Consulta la consola.");
        console.error("Por favor, reemplaza APPS_SCRIPT_URL con la URL de tu Web App de Apps Script.");
        return { estado: 'error', mensaje: 'URL de API no configurada.' };
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            // Necesario para indicar que el cuerpo es JSON
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload })
        });
        
        if (!response.ok) {
            // Manejo de errores HTTP (ej: 404, 500)
            throw new Error(`Error de red o API. Status: ${response.status}`);
        }
        
        return response.json();

    } catch (error) {
        console.error('Error al comunicarse con la API:', error);
        return { estado: 'error', mensaje: 'Error de conexión con el servidor de Google. Verifique la URL y la implementación.' };
    }
}


// =========================================================================
// LÓGICA DE LOGIN
// =========================================================================

/**
 * Maneja el clic en el botón de Iniciar Sesión.
 */
async function handleLoginClick() {
    const user = document.getElementById('login_user').value;
    const password = document.getElementById('login_pass').value;
    
    if (!user || !password) {
        alert('Ingrese usuario y contraseña.');
        return;
    }
    
    const loginData = { user, password };
    
    // Llamar a la API con la acción 'LOGIN'
    const result = await enviarPeticionApi('LOGIN', loginData);

    if (result.estado === 'ok') {
        alert(`¡Login Exitoso! Bienvenido, ${result.data.nombre}`);
        
        // Guarda los datos del usuario logueado
        localStorage.setItem('userData', JSON.stringify(result.data));

        // Transición de la UI
        const loginDiv = document.getElementById('Login');
        const navbar = document.getElementById('navbar');
        
        if (loginDiv) loginDiv.style.display = 'none';
        if (navbar) navbar.style.display = 'flex'; 

        showSection('inicio'); // Mostrar el menú de inicio
        
    } else {
        alert(`Error: ${result.mensaje}`);
        // Limpiamos la contraseña si falla
        document.getElementById('login_pass').value = '';
    }
}

// Función que se llama desde el onclick del HTML
function iniciarSesion() {
    handleLoginClick();
}


// =========================================================================
// LÓGICA DE NAVEGACIÓN Y VISTAS
// =========================================================================

const seccionMap = {
    'abonos': {
        divId: 'Formulario_Abonos',
        navBtnId: 'btnNabAbonos'
    },
    'clientes': {
        divId: 'Formulario_Clientes',
        navBtnId: 'btnNabClientes'
    },
    'nuevaVenta': {
        divId: 'Formulario_NuevaVenta',
        navBtnId: 'btnNabNuevaVenta'
    },
    'inicio': {
        divId: 'menu_inicio',
        navBtnId: 'btnNabInicio'
    }
};

const todasLasSecciones = Object.keys(seccionMap).map(key => seccionMap[key].divId);


function showSection(section) {
    const nav = document.getElementById('navbar');

    // 1. Ocultar todas las secciones
    todasLasSecciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 2. Mostrar todos los botones de la navbar (reset)
    const navButtons = nav ? nav.querySelectorAll('.nav-btn') : [];
    navButtons.forEach(btn => {
        btn.style.display = 'block';
    });

    // 3. Lógica específica de la sección
    if (section === 'inicio') {
        if (nav) nav.style.display = 'none';
        const inicio = document.getElementById(seccionMap.inicio.divId);
        if (inicio) inicio.style.display = 'flex';
    } else {
        if (nav) nav.style.display = 'flex';

        const currentSection = seccionMap[section];

        if (currentSection) {
            const displayStyle = (section === 'inicio' ? 'flex' : 'block');

            const divToShow = document.getElementById(currentSection.divId);
            if (divToShow) divToShow.style.display = displayStyle;

            const btnToHide = document.getElementById(currentSection.navBtnId);
            if (btnToHide) btnToHide.style.display = 'none';
            
            if (section === 'clientes') {
                showCustomerSection('general'); 
            }
        } else {
            alert(`Cambiando a sección: ${section}`);
        }
    }
}

function showCustomerSection(subSection) {
    const general = document.getElementById('customer_general');
    const individual = document.getElementById('customer_individual');
    const nuevo = document.getElementById('customer_nuevo'); 

    if (general) general.style.display = 'none';
    if (individual) individual.style.display = 'none';
    if (nuevo) nuevo.style.display = 'none';

    if (subSection === 'general') {
        if (general) general.style.display = 'block';
    } else if (subSection === 'individual') {
        if (individual) individual.style.display = 'block';
    } else if (subSection === 'nuevo') {
        if (nuevo) nuevo.style.display = 'block';
    }
}


function logout() {
    // Limpiar el token de sesión
    localStorage.removeItem('userData');

    const login = document.getElementById('Login');
    const nav = document.getElementById('navbar');

    todasLasSecciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (nav) nav.style.display = 'none';
    if (login) login.style.display = 'block';
    
    // Limpiar el formulario de login al salir
    document.getElementById('login_user').value = '';
    document.getElementById('login_pass').value = '';
    alert('Sesión cerrada.');
}


// =========================================================================
// LÓGICA DE FORMULARIO DE NUEVO CLIENTE
// =========================================================================

function limpiarFormularioCliente() {
    document.getElementById('nombre_cliente').value = '';
    document.getElementById('apellido_cliente').value = '';
    document.getElementById('dpi_cliente').value = '';
    document.getElementById('telefono_cliente').value = '';
    document.getElementById('direccion_cliente').value = '';
    alert('Formulario de cliente limpiado.');
}

// Función que se ejecutará al hacer clic en AGREGAR CLIENTE
function guardarNuevoCliente() {
    const data = {
        nombres: document.getElementById('nombre_cliente').value,
        apellidos: document.getElementById('apellido_cliente').value,
        dpi: document.getElementById('dpi_cliente').value,
        telefono: document.getElementById('telefono_cliente').value,
        direccion: document.getElementById('direccion_cliente').value
    };

    // Validación simple
    if (!data.nombres || !data.apellidos) {
        alert('Por favor, complete al menos los campos Nombres y Apellidos.');
        return;
    }

    // Aquí irá la lógica para enviar al Apps Script con la acción 'GUARDAR_CLIENTE'
    // console.log('Datos de cliente listos para enviar:', data);
    // const result = await enviarPeticionApi('GUARDAR_CLIENTE', data);
    
    // Por ahora, simulamos el envío para no romper la navegación:
    alert('Datos listos para enviar a la API. Continuemos con la implementación del backend.');
    limpiarFormularioCliente();
}
