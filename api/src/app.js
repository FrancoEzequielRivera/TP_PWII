const express = require('express');
const app = express();
const PORT = 7050;
const db = require('./database'); // Asegúrate de que esta ruta a database.js es correcta

// Importar rutas de la API
const celularesRoutes = require('./routes/celulares');
const clientesRoutes = require('./routes/clientes');
const ventasRoutes = require('./routes/ventas');

// --- NUEVAS LÍNEAS PARA SERVIR EL FRONTEND ---
const path = require('path');
// Asegúrate de que esta ruta apunte a la carpeta 'frontend' que está un nivel por encima de 'api'
app.use(express.static(path.join(__dirname, '../../frontend'))); // Sirve los archivos de la carpeta 'frontend'

// Manejar todas las demás rutas para el frontend (útil para SPAs, o para redirigir a index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.get('/gestion', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/gestion.html'));
});

// ---------------------------------------------


// Middleware para parsear JSON en las solicitudes de la API
app.use(express.json());

// Montar rutas de la API
app.use('/api/celulares', celularesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de API y Frontend corriendo en http://localhost:${PORT}`);
});
