export const API_URL = "http://localhost:5000/api";

export const TYPED_ROLES = [
  "AI Engineer",
  "Arquitecto de sistemas RAG",
  "Especialista en Azure AI",
  "Desarrollador multiagente",
];

export const CHAT_SUGGESTIONS = [
  "¿Qué experiencia tiene con Azure?",
  "Háblame de sus proyectos RAG",
  "¿Cómo lo contacto?",
];

export const CHAT_GREETING =
  "¡Hola! Soy el asistente de Jhonatan y conozco su CV completo. Pregúntame lo que quieras sobre su experiencia, proyectos o certificaciones.";

/** Turnos previos que se envían al modelo para dar continuidad a la conversación. */
export const CHAT_HISTORY_TURNS = 6;
