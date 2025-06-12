document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:7050/api'; // Tu API corriendo en este puerto

    // --- Funciones Comunes para la Página Principal y Gestión ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text(); // Obtener el texto del error
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            alert(`Error al cargar datos: ${error.message}`);
            return null;
        }
    }

    async function postData(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error posting data:', error);
            alert(`Error al enviar datos: ${error.message}`);
            return null;
        }
    }

    async function putData(url, data) {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            alert(`Error al actualizar datos: ${error.message}`);
            return null;
        }
    }

    async function deleteData(url) {
        try {
            const response = await fetch(url, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting data:', error);
            alert(`Error al eliminar datos: ${error.message}`);
            return null;
        }
    }

    // --- Lógica para index.html (Página Principal) ---
    if (document.getElementById('celulares-list')) {
        const celularesListDiv = document.getElementById('celulares-list');
        const brandFilterOptions = document.getElementById('brand-filter-options');
        let allCelulares = []; // Para guardar todos los celulares y poder filtrarlos localmente

        // <-- CAMBIO: Valor por defecto de filterBrand es 'Samsung'
        async function loadCelulares(filterBrand = 'Samsung') {
            celularesListDiv.innerHTML = '<div class="text-center col-12"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
            const data = await fetchData(`${API_BASE_URL}/celulares`);
            if (data) {
                allCelulares = data; // Guarda todos los celulares
                displayCelulares(filterBrand);
                populateBrandFilter();
            } else {
                celularesListDiv.innerHTML = '<p class="text-center col-12">No se pudieron cargar los celulares.</p>';
            }
        }

        function displayCelulares(filterBrand) {
            celularesListDiv.innerHTML = ''; // Limpia la lista actual
            const celularesToDisplay = filterBrand === 'all'
                ? allCelulares
                : allCelulares.filter(celular => celular.marca.toLowerCase() === filterBrand.toLowerCase());

            if (celularesToDisplay.length === 0) {
                celularesListDiv.innerHTML = '<p class="text-center col-12">No hay celulares disponibles para este filtro.</p>';
                return;
            }

            celularesToDisplay.forEach(celular => {
                const cardHtml = `
                    <div class="col">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">${celular.marca} ${celular.modelo}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">$${parseFloat(celular.precio).toFixed(2)}</h6>
                                <p class="card-text">
                                    RAM: ${celular.ram || 'N/A'}<br>
                                    Cámara Trasera: ${celular.camara_trasera || 'N/A'}<br>
                                    Procesador: ${celular.procesador || 'N/A'}<br>
                                    Pantalla: ${celular.tamanio_pantalla || 'N/A'}
                                </p>
                                </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <small class="text-muted">Lanzamiento: ${celular.lanzamiento ? new Date(celular.lanzamiento).toLocaleDateString() : 'N/A'}</small>
                            </div>
                        </div>
                    </div>
                `;
                celularesListDiv.innerHTML += cardHtml;
            });
        }

        // <-- CAMBIO: populateBrandFilter modificado para eliminar "Todos" y establecer texto de botón
        function populateBrandFilter() {
            // Limpiamos todas las opciones existentes. Ya no tendremos la opción "Todos"
            brandFilterOptions.innerHTML = '';

            const brands = new Set(allCelulares.map(celular => celular.marca));
            // Ordenar las marcas alfabéticamente
            const sortedBrands = Array.from(brands).sort();

            sortedBrands.forEach(brand => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.classList.add('dropdown-item', 'filter-btn');
                a.href = '#';
                a.dataset.brand = brand;
                a.textContent = brand;
                li.appendChild(a);
                brandFilterOptions.appendChild(li);
            });

            // Agrega event listeners a los botones de filtro
            document.querySelectorAll('#brand-filter-options .filter-btn').forEach(button => {
                // Remueve listeners anteriores para evitar duplicados si populateBrandFilter es llamado varias veces
                button.removeEventListener('click', handleBrandFilterClick);
                button.addEventListener('click', handleBrandFilterClick);
            });

            // Asegurarse de que el botón muestre "Samsung" al inicio
            document.getElementById('filterDropdown').textContent = 'Filtrar por Marca: Samsung';
        }

        function handleBrandFilterClick(event) {
            event.preventDefault();
            const brand = event.target.dataset.brand;
            // <-- CAMBIO: Ya no se necesita lógica para "Todos" aquí, pero mantenemos el update del texto
            document.getElementById('filterDropdown').textContent = `Filtrar por Marca: ${brand}`;
            displayCelulares(brand);
        }

        // <-- CAMBIO: Llama a la función para cargar los celulares con 'Samsung' al iniciar la página
        loadCelulares('Samsung');
    }

    // --- Lógica para gestion.html (Página de Gestión) ---
    if (document.getElementById('clientes-table-body')) {
        const clientesTableBody = document.getElementById('clientes-table-body');
        const addClienteForm = document.getElementById('add-cliente-form');
        const ventasTableBody = document.getElementById('ventas-table-body');
        const addVentaForm = document.getElementById('add-venta-form');
        const ventaProductoSelect = document.getElementById('venta-producto-id');
        const ventaClienteInput = document.getElementById('venta-cliente-input');
        const ventaClienteSelect = document.getElementById('venta-cliente-id'); // Este es el select oculto para el ID del cliente

        const celularesCrudTableBody = document.getElementById('celulares-crud-table-body');
        const addCelularForm = document.getElementById('add-celular-form');
        const editCelularModal = new bootstrap.Modal(document.getElementById('editCelularModal'));
        const editCelularForm = document.getElementById('edit-celular-form');


        // --- Funciones para Clientes ---
        async function loadClientes() {
            clientesTableBody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Cargando...</span></div> Cargando clientes...</td></tr>';
            const data = await fetchData(`${API_BASE_URL}/clientes`);
            if (data) {
                clientesTableBody.innerHTML = '';
                if (data.length === 0) {
                    clientesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay clientes registrados.</td></tr>';
                    return;
                }
                data.forEach(cliente => {
                    const row = `
                        <tr>
                            <td>${cliente.id}</td>
                            <td>${cliente.nombre}</td>
                            <td>${cliente.apellido}</td>
                            <td>${cliente.dni}</td>
                        </tr>
                    `;
                    clientesTableBody.innerHTML += row;
                });
            } else {
                clientesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar clientes.</td></tr>';
            }
            // populateClienteSelect(data); // Ya no se usa directamente, la funcionalidad de búsqueda es lo principal
        }

        addClienteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nombre = document.getElementById('cliente-nombre').value;
            const apellido = document.getElementById('cliente-apellido').value;
            const dni = document.getElementById('cliente-dni').value;

            const newCliente = await postData(`${API_BASE_URL}/clientes`, { nombre, apellido, dni });
            if (newCliente) {
                alert('Cliente agregado exitosamente!');
                addClienteForm.reset();
                loadClientes(); // Recargar la lista de clientes
                loadAllClientesForSearch(); // Actualizar la lista para búsqueda
            }
        });

        // Autocompletado o búsqueda de cliente para la venta
        let allClientes = [];
        async function loadAllClientesForSearch() {
            allClientes = await fetchData(`${API_BASE_URL}/clientes`);
        }
        // Llamar para cargar clientes al inicio de la página de gestión (o al menos sus IDs para la búsqueda)
        loadAllClientesForSearch();


        // Listener para el input de búsqueda de cliente
        ventaClienteInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const filteredClients = allClientes.filter(client =>
                client.dni.toLowerCase().includes(searchTerm) ||
                client.nombre.toLowerCase().includes(searchTerm) ||
                client.apellido.toLowerCase().includes(searchTerm)
            );

            ventaClienteSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
            if (filteredClients.length > 0 && searchTerm.length > 0) {
                ventaClienteSelect.style.display = 'block'; // Muestra el select
                filteredClients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = `${client.nombre} ${client.apellido} (DNI: ${client.dni})`;
                    ventaClienteSelect.appendChild(option);
                });
            } else {
                ventaClienteSelect.style.display = 'none'; // Oculta el select si no hay resultados o input vacío
            }
        });


        // --- Funciones para Ventas ---
        async function loadVentas() {
            ventasTableBody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Cargando...</span></div> Cargando ventas...</td></tr>';
            const data = await fetchData(`${API_BASE_URL}/ventas`);
            if (data) {
                ventasTableBody.innerHTML = '';
                if (data.length === 0) {
                    ventasTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas registradas.</td></tr>';
                    return;
                }
                data.forEach(venta => {
                    const row = `
                        <tr>
                            <td>${venta.venta_id}</td>
                            <td>${new Date(venta.fecha).toLocaleString()}</td>
                            <td>${venta.cliente_nombre} ${venta.cliente_apellido}</td>
                            <td>${venta.producto_marca} ${venta.producto_modelo}</td>
                            <td>$${parseFloat(venta.producto_precio).toFixed(2)}</td>
                        </tr>
                    `;
                    ventasTableBody.innerHTML += row;
                });
            } else {
                ventasTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar ventas.</td></tr>';
            }
        }

        async function populateCelularSelect() {
            const data = await fetchData(`${API_BASE_URL}/celulares`);
            if (data) {
                ventaProductoSelect.innerHTML = '<option value="">Selecciona un celular</option>';
                data.forEach(celular => {
                    const option = document.createElement('option');
                    option.value = celular.id;
                    // <-- CAMBIO: parseFloat para el precio en el select de ventas
                    option.textContent = `${celular.marca} ${celular.modelo} ($${parseFloat(celular.precio).toFixed(2)})`;
                    ventaProductoSelect.appendChild(option);
                });
            } else {
                ventaProductoSelect.innerHTML = '<option value="">Error al cargar celulares</option>';
            }
        }


        addVentaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const clienteId = ventaClienteSelect.value; // Asegúrate de tomar el ID del select
            const productoId = ventaProductoSelect.value;
            const fecha = document.getElementById('venta-fecha').value; // Formato YYYY-MM-DDTHH:mm

            if (!clienteId || !productoId || !fecha) {
                alert('Por favor, completa todos los campos de la venta.');
                return;
            }

            // Convertir la fecha al formato que espera tu API (YYYY-MM-DD HH:MM:SS)
            const formattedDate = new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');

            const newVenta = await postData(`${API_BASE_URL}/ventas`, {
                cliente_id: parseInt(clienteId),
                producto_id: parseInt(productoId),
                fecha: formattedDate
            });

            if (newVenta) {
                alert('Venta registrada exitosamente!');
                addVentaForm.reset();
                ventaClienteInput.value = ''; // Limpia el input de búsqueda
                ventaClienteSelect.style.display = 'none'; // Oculta el select después de la venta
                loadVentas(); // Recargar la lista de ventas
            }
        });


        // --- Funciones para Gestión de Celulares (CRUD) ---
        async function loadCelularesCrud() {
            celularesCrudTableBody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Cargando...</span></div> Cargando celulares...</td></tr>';
            const data = await fetchData(`${API_BASE_URL}/celulares`);
            if (data) {
                celularesCrudTableBody.innerHTML = '';
                if (data.length === 0) {
                    celularesCrudTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay celulares registrados.</td></tr>';
                    return;
                }
                data.forEach(celular => {
                    const row = `
                        <tr>
                            <td>${celular.id}</td>
                            <td>${celular.marca}</td>
                            <td>${celular.modelo}</td>
                            <td>$${parseFloat(celular.precio).toFixed(2)}</td>
                            <td>
                                <button class="btn btn-sm btn-info edit-btn" data-id="${celular.id}">Editar</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${celular.id}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                    celularesCrudTableBody.innerHTML += row;
                });

                // Añadir listeners a los botones de editar y eliminar
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', (e) => deleteCelular(e.target.dataset.id));
                });

            } else {
                celularesCrudTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar celulares.</td></tr>';
            }
        }

        addCelularForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const celularData = {
                marca: document.getElementById('add-marca').value,
                modelo: document.getElementById('add-modelo').value,
                precio: parseFloat(document.getElementById('add-precio').value),
                peso: parseFloat(document.getElementById('add-peso').value) || null,
                ram: document.getElementById('add-ram').value || null,
                camara_frontal: document.getElementById('add-camara_frontal').value || null,
                camara_trasera: document.getElementById('add-camara_trasera').value || null,
                procesador: document.getElementById('add-procesador').value || null,
                capacidad_bateria: document.getElementById('add-capacidad_bateria').value || null,
                tamanio_pantalla: document.getElementById('add-tamanio_pantalla').value || null,
                lanzamiento: document.getElementById('add-lanzamiento').value || null // YYYY-MM-DD
            };

            const newCelular = await postData(`${API_BASE_URL}/celulares`, celularData);
            if (newCelular) {
                alert('Celular agregado exitosamente!');
                addCelularForm.reset();
                loadCelularesCrud(); // Recargar la lista
                populateCelularSelect(); // Recargar el select de ventas
            }
        });

        async function openEditModal(id) {
            const celular = await fetchData(`${API_BASE_URL}/celulares/${id}`);
            if (celular) {
                document.getElementById('edit-id').value = celular.id;
                document.getElementById('edit-marca').value = celular.marca;
                document.getElementById('edit-modelo').value = celular.modelo;
                document.getElementById('edit-precio').value = celular.precio;
                document.getElementById('edit-peso').value = celular.peso || '';
                document.getElementById('edit-ram').value = celular.ram || '';
                document.getElementById('edit-camara_frontal').value = celular.camara_frontal || '';
                document.getElementById('edit-camara_trasera').value = celular.camara_trasera || '';
                document.getElementById('edit-procesador').value = celular.procesador || '';
                document.getElementById('edit-capacidad_bateria').value = celular.capacidad_bateria || '';
                document.getElementById('edit-tamanio_pantalla').value = celular.tamanio_pantalla || '';
                // Formatear fecha para el input type="date"
                document.getElementById('edit-lanzamiento').value = celular.lanzamiento ? celular.lanzamiento.split('T')[0] : '';
                editCelularModal.show();
            }
        }

        editCelularForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = document.getElementById('edit-id').value;
            const updatedCelularData = {
                marca: document.getElementById('edit-marca').value,
                modelo: document.getElementById('edit-modelo').value,
                precio: parseFloat(document.getElementById('edit-precio').value),
                peso: parseFloat(document.getElementById('edit-peso').value) || null,
                ram: document.getElementById('edit-ram').value || null,
                camara_frontal: document.getElementById('edit-camara_frontal').value || null,
                camara_trasera: document.getElementById('edit-camara_trasera').value || null,
                procesador: document.getElementById('edit-procesador').value || null,
                capacidad_bateria: document.getElementById('edit-capacidad_bateria').value || null,
                tamanio_pantalla: document.getElementById('edit-tamanio_pantalla').value || null,
                lanzamiento: document.getElementById('edit-lanzamiento').value || null
            };

            const result = await putData(`${API_BASE_URL}/celulares/${id}`, updatedCelularData);
            if (result) {
                alert('Celular actualizado exitosamente!');
                editCelularModal.hide();
                loadCelularesCrud(); // Recargar la lista
                populateCelularSelect(); // Recargar el select de ventas
            }
        });

        async function deleteCelular(id) {
            if (confirm('¿Estás seguro de que quieres eliminar este celular?')) {
                const result = await deleteData(`${API_BASE_URL}/celulares/${id}`);
                if (result) {
                    alert('Celular eliminado exitosamente!');
                    loadCelularesCrud(); // Recargar la lista
                    populateCelularSelect(); // Recargar el select de ventas
                }
            }
        }

        // Cargar datos al cargar la página de gestión o al cambiar de pestaña
        const myTab = document.getElementById('myTab');
        if (myTab) {
            myTab.addEventListener('shown.bs.tab', event => {
                const activeTabId = event.target.id;
                if (activeTabId === 'clientes-tab') {
                    loadClientes();
                } else if (activeTabId === 'ventas-tab') {
                    loadVentas();
                    populateCelularSelect(); // Cargar los celulares para el select de ventas
                    loadAllClientesForSearch(); // Asegurarse de que los clientes estén cargados para la búsqueda
                } else if (activeTabId === 'celulares-crud-tab') {
                    loadCelularesCrud();
                }
            });
            // Cargar por defecto la primera pestaña visible al cargar la página de gestión
            // Esta línea asegura que la primera pestaña activa al cargar la página (Clientes) se inicialice
            const initialActiveTab = document.querySelector('#myTab .nav-link.active');
            if (initialActiveTab && initialActiveTab.id === 'clientes-tab') {
                loadClientes();
            }
        }
    }
});