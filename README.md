
# Chatbot Template con TypeScript

Este repositorio proporciona una plantilla básica para crear un chatbot utilizando TypeScript. La configuración es independiente del framework, aunque en este caso se ha utilizado Next.js. Puedes personalizar el comportamiento del chatbot según tus necesidades.

## Requisitos

* Node.js
* API Key de OpenAI
* API Key de ElevenLabs

## Configuración

1. Clona el repositorio:
2. ```
   git clone https://github.com/Hecze/ChatBotWithVoice.git
   cd ChatBotWithVoice
   ```
3. Instala las dependencias:

   ```
   npm install
   ```
4. Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

   ```
   NEXT_PUBLIC_OPENAI_API_KEY=tu_openai_api_key
   NEXT_PUBLIC_ELEVENLABS_API_KEY=tu_elevenlabs_api_key
   ```
5. Inicia el servidor de desarrollo:

   ```
   npm run dev
   ```

## Uso

Esta plantilla incluye las funcionalidades básicas de un chatbot con soporte para transcripción de voz a texto y síntesis de texto a voz.

### Grabar y Transcribir Audio

El chatbot puede grabar audio utilizando el micrófono del usuario y transcribirlo a texto mediante la API de OpenAI.

* **Iniciar grabación:** Al hacer clic en el botón `Start Recording`, se iniciará la grabación del audio.
* **Detener grabación:** Al hacer clic en el botón `Stop Recording`, se detendrá la grabación y el audio se enviará a la API de OpenAI para transcripción.

### Enviar Mensajes al Chatbot

Cuando el audio se transcribe a texto, se envía automáticamente al chatbot utilizando la API de OpenAI. La respuesta del chatbot se mostrará en la pantalla.

### Síntesis de Voz

Las respuestas del chatbot se convierten a audio utilizando la API de ElevenLabs. El audio generado se reproduce automáticamente.

## Personalización

Puedes personalizar el comportamiento del chatbot ajustando la configuración y los mensajes del sistema. Aquí hay una guía rápida para hacerlo:

1. **Modificar el Mensaje del Sistema:** El mensaje del sistema define el contexto y el comportamiento del chatbot. Puedes cambiar el contenido de `InitialPrompt` en el archivo principal (`src/app/page.tsx`) para adaptar la personalidad y el tono del chatbot.
2. ```
   // Mensaje de configuración del chatbot
   const InitialPrompt = 'Te llamas Pepe Lucho, eres estudiante de psicologia. Estás medio loco pero eres muy gracioso. Ten una personalidad interesada y empática. No tengas una respuesta objetiva siempre. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal.
   ```
3. **Cambiar la Voz en Text to Speech:** La función `textToSpeech` convierte el texto de respuesta del bot a audio utilizando la API de ElevenLabs. Puedes cambiar la voz utilizada en la síntesis de texto a voz cambiando el `voiceId` en la función `textToSpeech`. ElevenLabs proporciona una variedad de voces que puedes seleccionar desde su página web.
4. ```
   const voiceId = "VR6AewLTigWG4xSOukaG"; // Cambia esto al ID de la voz que prefieras

   ```

## Conversación con el Chatbot

El chatbot utiliza la API de OpenAI, específicamente el modelo `gpt-3.5-turbo`. Puedes cambiar la versión del modelo si deseas utilizar `gpt-4` o `gpt-4-32k`.

### Cambiar la Versión del Modelo

Para cambiar la versión del modelo utilizado por el chatbot, modifica la propiedad `model` en el cuerpo de la solicitud API en la función `sendMessage` en el archivo `src/app/page.tsx`.

```
const apiRequestBody = {
  model: 'gpt-3.5-turbo', // Cambia esto a 'gpt-4' o 'gpt-4-32k' según tus necesidades
  messages: [systemMessage, ...chatMessages, { role: 'user', content: message }]
};

```

## Detalles Técnicos

### Speech to Text

La función `speechToText` convierte el audio grabado a texto utilizando la API de transcripción Whisper de OpenAI. El audio se envía como un `Blob` y se procesa para obtener el texto transcrito.

### Text to Speech

La función `textToSpeech` convierte el texto de respuesta del bot a audio utilizando la API de ElevenLabs. El texto se envía y se convierte en un `Blob` de audio, que se reproduce automáticamente.
