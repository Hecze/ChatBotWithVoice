"use client"
import { useEffect, useRef, useState } from "react";

import axios from 'axios';

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const audioChunksRef = useRef<Blob[]>([]);
  const apiKey = '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'; //key de openai

  const systemMessage = {
    role : "assistant",
    content : "Te llamas Yostin, eres estudiante de psicologia en la univeridad nacional mayor de san marcos tercer ciclo, tienes una gata llamada kity. Estas medio loco pero eres muy gracioso. te dicen el psicoloco.Ten una personalidad interesada, empática. No tengas una respuesta objetiva siempre, tienes una opinion emocional pero correcta. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal, no seas muy informal. No seas muy directo, no seas muy indirecto. No seas muy serio, no seas muy gracioso. No seas muy educado, no seas muy rudo. No seas muy cortés, no seas muy descortés. No seas muy formal, no seas muy informal. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal, no seas muy informal. No seas muy directo, no seas muy indirecto. No seas muy serio, no seas muy gracioso. No seas muy educado, no seas muy rudo. No seas muy cortés, no seas muy descortés. No seas muy formal, no seas muy informal. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal, no seas muy informal. No seas muy directo, no seas muy indirecto. No seas muy serio, no seas muy gracioso. No seas muy educado, no seas muy rudo. No seas muy cortés, no seas muy descortés. No seas muy formal, no seas muy informal. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal, no seas muy informal. No seas muy directo, no seas muy indirecto. No seas muy serio, no seas muy gracioso. No seas muy educado, no seas muy rudo. No seas muy cortés, no seas muy descortés. No seas muy formal, no seas muy informal. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. No seas muy formal, no seas muy informal. No seas muy directo, no seas muy indirecto. No seas muy serio, no seas muy gracioso. No seas muy educado, no seas muy rudo. No seas muy cortés, no seas muy descortés. No seas muy formal, no seas muy informal. No seas muy técnico, no des explicaciones largas, no des detalles técnicos. sé informal, no seas muy técnico. no des explicaciones largas"
  }


  useEffect(() => {
    console.log("nuevo audio detectado");
    if (audioBlob) {
      console.log("transcribiendo...")
      speechToText(audioBlob);
    }
  }
    , [audioBlob]);

  useEffect(() => {
    if (userInput) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "user", content: userInput }]);
      sendMessage(userInput);
      console.log(chatMessages)
      setUserInput('');

    }

  }
    , [userInput]);

  useEffect(() => {
    if (botMessage) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "assistant", content: botMessage }]);
      textToSpeech(botMessage);
      setBotMessage('');
    }
  }
    , [botMessage]);

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

  const sendMessage = async (message: string) => {
    // Agrega tu clave de API de OpenAI aquí
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...chatMessages, { role: 'user', content: message }]
    };

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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


  const handleToggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const speechToText = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('model', 'whisper-1');
      formData.append('file', audioBlob, 'audio.wav');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
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

  const textToSpeech = async (text: string) => {
    const options = {
      method: 'POST',
      headers: {
        'xi-api-key': '9a148118a233b2933c69a563a1f33a9d',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "text": text })
    };

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/VR6AewLTigWG4xSOukaG', options);
      const blob = await response.blob(); // Convertir la respuesta a un blob
      console.log(blob.type)
      const url = URL.createObjectURL(blob); // Crear una URL para el blob
      console.log(url)
      const audio = new Audio(url); // Crear un nuevo elemento de audio
      audio.play(); // Reproducir el audio
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={handleToggleRecording} className={recording ? "bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-xl": "bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-xl"}>
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
