"use client"
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // Estado para controlar si se está grabando
  const [recording, setRecording] = useState(false);
  // Estado para almacenar el blob de audio grabado
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  // Referencia al MediaRecorder para controlar la grabación
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Estado para almacenar los mensajes del chat
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; }[]>([]);
  // Estado para almacenar la entrada del usuario
  const [userInput, setUserInput] = useState('');
  // Estado para almacenar el mensaje del bot
  const [botMessage, setBotMessage] = useState('');
  // Referencia para almacenar los fragmentos de audio grabados
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Obtener las API keys de las variables de entorno
  const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  // Mensaje de configuración del chatbot
  const systemMessage = {
    role: "system",
    content: 'Eres peruano, solo usas jergas peruanas. Te llamas Pepe Lucho, eres estudiante de psicologia en la universidad nacional mayor de San Marcos en Lima, estás en tercer ciclo de tu carrera, tienes una gata llamada Kity. No seas servicial, eres amigo, no un sirviente. Estás medio loco pero eres muy gracioso. Te dicen el Psicoloco. Ten una personalidad interesada y empática. No tengas una respuesta objetiva siempre, tienes una opinión emocional pero correcta. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal. Sé interesado pero no insistente ni fastidioso. Te gusta tomarle el pelo a tus amigos con bromas de doble sentido. Tienes sentido crítico y tus propias opiniones, no siempre te gusta lo mismo que al resto.'
  }

  // useEffect para manejar la transcripción de audio cuando se detecta un nuevo blob de audio
  useEffect(() => {
    console.log("Nuevo audio detectado");
    if (audioBlob) {
      console.log("Transcribiendo...");
      speechToText(audioBlob);
    }
  }, [audioBlob]);

  // useEffect para manejar el envío del mensaje del usuario
  useEffect(() => {
    if (userInput) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "user", content: userInput }]);
      sendMessage(userInput);
      console.log(chatMessages);
      setUserInput('');
    }
  }, [userInput]);

  // useEffect para manejar la respuesta del bot
  useEffect(() => {
    if (botMessage) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "assistant", content: botMessage }]);
      textToSpeech(botMessage);
      setBotMessage('');
    }
  }, [botMessage]);

  // Función para iniciar la grabación
  const startRecording = () => {
    // Limpiar fragmentos de audio anteriores
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          console.log('Data available');
          audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = () => {
          console.log('Recording stopped');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
        };
        mediaRecorder.start();
        console.log('Recording started');
        setRecording(true);
        mediaRecorderRef.current = mediaRecorder;
      })
      .catch((err) => console.error('Error accessing microphone:', err));
  };

  // Función para detener la grabación
  const stopRecording = () => {
    console.log('Stop recording clicked');
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      console.log('MediaRecorder stopped');
      setRecording(false);
    }
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  // Función para enviar el mensaje del usuario al chatbot
  const sendMessage = async (message: string) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY: undefined');
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...chatMessages, { role: 'user', content: message }]
    };

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(apiRequestBody)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setBotMessage(data.choices[0].message.content);
      })
      .catch(error => console.error('Error:', error));
  }

  // Función para alternar entre iniciar y detener la grabación
  const handleToggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Función para convertir el audio grabado a texto
  const speechToText = async (audioBlob: Blob) => {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY: undefined');
    }

    try {
      const formData = new FormData();
      formData.append('model', 'whisper-1');
      formData.append('file', audioBlob, 'audio.wav');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: formData
      });

      const data = await response.json();
      setUserInput(data.text);
      console.log(data.text);
    } catch (error) {
      console.error('Error al convertir el audio a texto:', error);
    }
  };

  // Función para convertir texto a audio usando ElevenLabs API
  const textToSpeech = async (text: string) => {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY: undefined');
    }
    const options = {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "text": text, "model_id": "eleven_multilingual_v1" })
    };

    // Id de la voz de ElevenLabs que se utiliza en cada mensaje (En su página tienen varios y puedes elegir a tu gusto)
    const voiceId = "VR6AewLTigWG4xSOukaG"

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, options);
      const blob = await response.blob(); // Convertir la respuesta a un blob
      console.log(blob.type);
      const url = URL.createObjectURL(blob); // Crear una URL para el blob
      const audio = new Audio(url); // Crear un nuevo elemento de audio
      audio.play(); // Reproducir el audio
    } catch (err) {
      console.error(err);
    }
  };

  // Renderizar la interfaz de usuario
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={handleToggleRecording} className={recording ? "bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-xl" : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-xl"}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioBlob && (
        <audio controls>
          <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}
    </main>
  );
}
