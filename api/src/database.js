const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './celulares.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Puedes inicializar las tablas aquí si no existen, aunque ya las tienes
        db.run(`CREATE TABLE IF NOT EXISTS Cliente (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            dni TEXT UNIQUE NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Celulares (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marca TEXT NOT NULL,
            modelo TEXT NOT NULL,
            peso REAL,
            ram TEXT,
            camara_frontal TEXT,
            camara_trasera TEXT,
            procesador TEXT,
            capacidad_bateria TEXT,
            tamanio_pantalla TEXT,
            precio REAL NOT NULL,
            lanzamiento TEXT
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente INTEGER NOT NULL,
            producto INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            FOREIGN KEY(cliente) REFERENCES Cliente(id),
            FOREIGN KEY(producto) REFERENCES Celulares(id)
        )`);
    }
});

module.exports = db;