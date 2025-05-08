# API de Catálogo de Celulares

## Descripción
Esta API proporciona acceso a un catálogo de celulares cargado desde un archivo CSV, permitiendo operaciones CRUD básicas y endpoints avanzados con filtros.

## Origen de los datos
Los datos se cargan al iniciar el servidor desde el archivo `celulares.csv`, que contiene información técnica de diversos modelos de teléfonos móviles. El archivo CSV se procesa omitiendo la primera fila (headers) y asignando IDs incrementales a cada registro.

La fuente de este celulares.csv proviene de: https://www.kaggle.com/datasets/abdulmalik1518/mobiles-dataset-2025

## Tecnologías utilizadas

+ **Node.js**
+ **Express**
+ **FS** (File System)
+ **csv-parser**
+ **Morgan**

## Endpoints implementados

### CRUD Básico
- `GET /celulares` - Lista todos los celulares
- `GET /celulares/:id` - Obtiene un celular por ID
- `POST /celulares` - Agrega un nuevo celular
- `PUT /celulares/:id` - Actualiza un celular existente
- `DELETE /celulares/:id` - Elimina un celular

### Endpoints Avanzados

1. **Filtrar por empresa**
   - `GET /celulares/empresa/:empresa`
   - Filtra celulares por nombre de empresa (búsqueda parcial case-insensitive)
   - Ejemplo: `/celulares/empresa/samsung`

2. **Filtrar por rango de precio**
   - `GET /celulares/precio?min=VALOR&max=VALOR`
   - Devuelve celulares dentro de un rango de precios, ordenados de menor a mayor
   - Ejemplo: `/celulares/precio?min=300&max=600`

## Códigos de Respuesta
La API utiliza los siguientes códigos HTTP:
- 200: OK - Solicitud exitosa
- 201: Created - Recurso creado (POST)
- 204: No Content - Recurso eliminado (DELETE)
- 400: Bad Request - Parámetros inválidos
- 404: Not Found - Recurso no encontrado

## Pruebas
Se recomienda usar Postman, Bruno o cualquier cliente HTTP para probar los endpoints.
