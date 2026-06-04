# 1. Imagen base
FROM node:20-alpine

# 2. Directorio de trabajo: Ahora se llama /api
WORKDIR /api

# 3. Caché de dependencias
COPY package*.json ./

# 4. Instalación
RUN npm install

# 5. Copia de código fuente
COPY . .

# 6. Exposición de puerto
EXPOSE ${PORT}

# 7. Comando de arranque
CMD ["npm", "start"]