const BACKEND_URL = 'https://backend-carlos-gatos.onrender.com/gatos';

// Element refs
const resultadoDiv = document.getElementById('resultado');
const listaGatos = document.getElementById('listaGatos');
const formGato = document.getElementById('formGato');
const imagenInput = document.getElementById('imagen');
const preview = document.getElementById('preview');
const gatoIdInput = document.getElementById('gatoId');
const btnCancelar = document.getElementById('btnCancelar');
const btnSubmit = document.getElementById('btnSubmit');

// Preview image
imagenInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  } else {
    preview.src = '';
    preview.style.display = 'none';
  }
});

// Submit (create or update)
formGato.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultadoDiv.style.display = 'none';

  const id = gatoIdInput.value;
  const formData = new FormData();
  formData.append('nombre', document.getElementById('nombre').value.trim());
  formData.append('edad', document.getElementById('edad').value);
  formData.append('peso', document.getElementById('peso').value);
  formData.append('raza', document.getElementById('raza').value.trim());
  if (imagenInput.files.length > 0) formData.append('imagen', imagenInput.files[0]);

  try {
    let respuesta;
    if (id) {
      respuesta = await fetch(`${BACKEND_URL}/${id}`, { method: 'PUT', body: formData });
    } else {
      // create
      if (imagenInput.files.length === 0) {
        resultadoDiv.className = 'alert-danger';
        resultadoDiv.textContent = 'La imagen es obligatoria al registrar un gato nuevo.';
        resultadoDiv.style.display = 'block';
        return;
      }
      respuesta = await fetch(BACKEND_URL, { method: 'POST', body: formData });
    }

    const data = await respuesta.json();

    if (respuesta.ok) {
      resultadoDiv.className = 'alert-success';
      resultadoDiv.innerHTML = data.mensaje + (data.imagenUrl ? `<br><img src="${data.imagenUrl}" style="max-width:100%;margin-top:10px;border-radius:8px;">` : '');
      limpiarFormulario();
      await cargarGatos();
    } else {
      resultadoDiv.className = 'alert-danger';
      resultadoDiv.textContent = data.mensaje || 'Error al procesar la solicitud';
    }

    resultadoDiv.style.display = 'block';
  } catch (error) {
    console.error(error);
    resultadoDiv.className = 'alert-danger';
    resultadoDiv.textContent = 'Error de conexión con el servidor.';
    resultadoDiv.style.display = 'block';
  }
});

function editarGato(gato) {
  document.getElementById('gatoId').value = gato.id;
  document.getElementById('nombre').value = gato.nombre;
  document.getElementById('edad').value = gato.edad;
  document.getElementById('peso').value = gato.peso;
  document.getElementById('raza').value = gato.raza;

  // no cargamos la imagen en el input file por seguridad
  imagenInput.value = '';
  preview.style.display = 'none';

  btnCancelar.style.display = 'block';
  btnSubmit.textContent = 'Actualizar Gato';
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
}

function limpiarFormulario() {
  formGato.reset();
  gatoIdInput.value = '';
  preview.style.display = 'none';
  btnCancelar.style.display = 'none';
  btnSubmit.textContent = 'Registrar Gato';
}

btnCancelar.addEventListener('click', () => limpiarFormulario());

// Cargar y mostrar gatos
async function cargarGatos() {
  listaGatos.innerHTML = '<div class="empty-state">Cargando gatos...</div>';
  try {
    const respuesta = await fetch(BACKEND_URL);
    const gatos = await respuesta.json();

    if (!respuesta.ok) throw new Error(gatos.mensaje || 'Error al obtener gatos');

    if (!Array.isArray(gatos) || gatos.length === 0) {
      listaGatos.innerHTML = '<div class="empty-state">Aún no hay gatos registrados.</div>';
      return;
    }

    listaGatos.innerHTML = gatos.map(gato => `
      <div class="gato-item">
        <img src="${gato.imagenUrl || 'https://via.placeholder.com/400x250?text=Sin+imagen'}" alt="${gato.nombre}">
        <h5>${gato.nombre}</h5>
        <p><strong>Edad:</strong> ${gato.edad} años · <strong>Peso:</strong> ${gato.peso} kg</p>
        <p><strong>Raza:</strong> ${gato.raza}</p>
        <p><small>Registrado: ${new Date(gato.fecha).toLocaleDateString('es-ES')}</small></p>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="btn-secondary" onclick='editarGato(${JSON.stringify(gato)})'>Editar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    listaGatos.innerHTML = '<div class="empty-state">Error al cargar los gatos. Intenta de nuevo.</div>';
  }
}

// Botón recargar
document.getElementById('btnActualizar').addEventListener('click', cargarGatos);

// Cargar al inicio
cargarGatos();
