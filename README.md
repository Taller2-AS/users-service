# 👨‍💻 Microservicio de Usuarios – StreamFlow

Este microservicio forma parte del proyecto **StreamFlow**, De la asignatura **Arquitectura de Sistemas**. Administra la información relacionada a los usuarios disponibles, permitiendo su creación, actualización, eliminación lógica y consulta.

---

## 📋 Requisitos

- Node.js v18.x o superior  
- Docker  
- RabbitMQ   
- MongoDB   
- Postman 

---

## 🚀 Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/Taller2-AS/users-service.git
cd usersService
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Crea el archivo `.env`

Ejemplo:

```env
MONGO_USER="martinbecerra"
MONGO_PASSWORD="gXsNv5wLljLCDrTW"
MONGO_DATABASE="mongodb+srv://<USER>:<PASSWORD>@usuarios.xyn84bf.mongodb.net/?retryWrites=true&w=majority&appName=Usuarios"

SERVER_URL=localhost
SERVER_PORT=3000

RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

> ⚠️ Asegúrate de que MongoDB y RabbitMQ estén corriendo en tu entorno local.

---

### 4. Levanta MongoDB y RabbitMQ con Docker

```bash
docker-compose up -d
```

---

### 5. Ejecuta el seeder (opcional)

```bash
npm run seed
```

Esto insertará 100 registros falsos de usuarios para pruebas.

---

### 6. Inicia el microservicio

```bash
npm start
```
---

## 👨‍💻 Desarrollado por

**Desarrollador A - Martin Becerra**  
Universidad Católica del Norte – Arquitectura de Sistemas