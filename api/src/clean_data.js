// api/src/clean_data.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ajusta la ruta a tu archivo de base de datos
const DB_PATH = path.resolve(__dirname, '../../celulares.db'); // Asume que celulares.db está en la raíz de tu proyecto
// Si tu celulares.db está en api/src/, entonces sería:
// const DB_PATH = path.resolve(__dirname, './celulares.db');


const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite para limpieza.');
    }
});

async function cleanCelularesData() {
    console.log('Iniciando proceso de limpieza de datos...');

    let updatedCount = 0;

    try {
        // 1. Obtener todos los celulares
        const allCelulares = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM Celulares', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        console.log(`Se encontraron ${allCelulares.length} celulares.`);

        // 2. Procesar cada celular para limpiar los datos
        for (const celular of allCelulares) {
            let needsUpdate = false;
            const updatedCelular = { ...celular }; // Crea una copia para modificar

            // Limpiar 'precio'
            let parsedPrecio = parseFloat(celular.precio);
            if (isNaN(parsedPrecio) || parsedPrecio <= 0) { // Si no es un número o es <= 0
                parsedPrecio = 0.00; // Valor por defecto
                needsUpdate = true;
                console.log(`Celular ID <span class="math-inline">\{celular\.id\}\: Precio '</span>{celular.precio}' limpiado a ${parsedPrecio}`);
            }
            updatedCelular.precio = parsedPrecio;

            // Limpiar campos TEXT que estén vacíos o null
            const textFields = ['ram', 'camara_frontal', 'camara_trasera', 'procesador', 'capacidad_bateria', 'tamanio_pantalla'];
            textFields.forEach(field => {
                // Si el valor es null, undefined, o una cadena vacía o solo espacios
                if (!celular[field] || String(celular[field]).trim() === '') {
                    updatedCelular[field] = 'N/A'; // O cualquier valor por defecto que desees
                    needsUpdate = true;
                    // console.log(`Celular ID <span class="math-inline">\{celular\.id\}\: Campo '</span>{field}' limpiado a 'N/A'`); // Descomenta para ver detalles
                } else {
                    // Asegura que no haya espacios extra y estandariza mayúsculas/minúsculas si quieres
                    updatedCelular[field] = String(celular[field]).trim();
                }
            });

            // Limpiar 'lanzamiento' (ya debería estar arreglado, pero por si acaso)
            if (!celular.lanzamiento || String(celular.lanzamiento).trim() === '' || isNaN(new Date(celular.lanzamiento))) {
                updatedCelular.lanzamiento = '2000-01-01'; // O una fecha por defecto más genérica si no hay una real
                needsUpdate = true;
                // console.log(`Celular ID <span class="math-inline">\{celular\.id\}\: Lanzamiento '</span>{celular.lanzamiento}' limpiado a ${updatedCelular.lanzamiento}`);
            } else {
                 // Asegurarse de que el formato sea YYYY-MM-DD
                 const dateObj = new Date(celular.lanzamiento);
                 const year = dateObj.getFullYear();
                 const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                 const day = String(dateObj.getDate()).padStart(2, '0');
                 updatedCelular.lanzamiento = `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
            }


            // 3. Actualizar el celular si se detectó algún cambio
            if (needsUpdate) {
                await new Promise((resolve, reject) => {
                    const { id, marca, modelo, precio, peso, ram, camara_frontal, camara_trasera, procesador, capacidad_bateria, tamanio_pantalla, lanzamiento } = updatedCelular;
                    const sql = `UPDATE Celulares SET
                                marca = ?, modelo = ?, precio = ?, peso = ?, ram = ?,
                                camara_frontal = ?, camara_trasera = ?, procesador = ?,
                                capacidad_bateria = ?, tamanio_pantalla = ?, lanzamiento = ?
                                WHERE id = ?`;
                    const params = [
                        marca, modelo, precio,
                        peso, ram, camara_frontal, camara_trasera,
                        procesador, capacidad_bateria, tamanio_pantalla,
                        lanzamiento, id
                    ];
                    db.run(sql, params, function(err) {
                        if (err) {
                            console.error(`Error al actualizar celular ID ${id}:`, err.message);
                            reject(err);
                        } else {
                            updatedCount++;
                            resolve();
                        }
                    });
                });
            }
        }

        console.log(`Proceso de limpieza completado. Se actualizaron ${updatedCount} celulares.`);

    } catch (error) {
        console.error('Error durante la limpieza de datos:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error al cerrar la base de datos:', err.message);
            } else {
                console.log('Conexión a la base de datos cerrada.');
            }
        });
    }
}

cleanCelularesData();