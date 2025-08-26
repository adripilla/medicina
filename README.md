# 🩺 Quiz Médico Interactivo

Este proyecto es un **juego educativo** en React orientado a estudiantes de medicina y profesionales de la salud.  
A través de casos clínicos simulados, el jugador interactúa con un avatar, revisa síntomas, participa en conversaciones y responde preguntas de opción múltiple.

El objetivo es **aprender y reforzar conocimientos clínicos** de una forma divertida y dinámica.

---

## ✨ Características

- 👩‍⚕️ **Avatar de Doctor(a)** que guía la experiencia.
- 📋 **Casos clínicos interactivos** con preguntas de opción múltiple.
- 💬 **Conversaciones simuladas** entre médico y paciente.
- ❤️ **Sistema de vidas (corazones pixelados)**.
- ⭐ **Puntos y logros** por respuestas correctas.
- 📂 **Carpeta de expediente** con síntomas y notas del paciente.
- 🎨 **Interfaz responsiva** (móvil y escritorio).
- ⚡ Construido con **React + Vite + Tailwind CSS**.

---

## 🛠️ Tecnologías utilizadas

- [React](https://reactjs.org/) – UI.
- [React Router](https://reactrouter.com/) – navegación.
- [Tailwind CSS](https://tailwindcss.com/) – estilos.
- [TypeScript](https://www.typescriptlang.org/) – tipado estático.
- [Vite](https://vitejs.dev/) – bundler rápido.

---

## 📂 Estructura del proyecto

src/
├─ components/
│ ├─ Doctor.tsx # Avatar del doctor
│ ├─ Persona.tsx # Avatar del paciente
│ ├─ QuizCard.tsx # Componente de preguntas
│ ├─ Conversacion.tsx # Diálogo médico-paciente
│ ├─ Carpeta.tsx # Expediente del paciente
│
├─ pages/
│ ├─ Game.tsx # Lógica principal del juego
│ └─ datos.json # Casos clínicos (niveles)
│
├─ style/
│ └─ Game.css # Estilos personalizados
│
└─ main.tsx # Punto de entrada

---

## 🚀 Instalación y ejecución

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tuusuario/quiz-medico.git
   cd quiz-medico
   ```

2.Instala las dependencias:

```bash
npm install
```

3.Ejecuta el servidor de desarrollo:

```bash
npm run dev

```

4.Abre en el navegador:

```bash
http://localhost:5173

```

📱 Responsive Design

En escritorio el avatar del doctor aparece en la izquierda.

En móvil el avatar del doctor se muestra arriba y el paciente al lado, ocupando el ancho completo.
