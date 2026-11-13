/**
 * URL de la API.
 *
 * Flask sirve frontend y API desde el mismo origen (local y en PythonAnywhere),
 * así que basta la ruta relativa `/api`. Solo si la página se abre con otro
 * servidor de desarrollo (Live Server, file://) se apunta al Flask local.
 */
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];
const servedByFlask =
  location.protocol.startsWith("http") &&
  !(LOCAL_HOSTS.includes(location.hostname) && location.port && location.port !== "5000");

export const API_URL = servedByFlask ? "/api" : "http://localhost:5000/api";

/** Turnos previos que se envían al modelo para dar continuidad a la conversación. */
export const CHAT_HISTORY_TURNS = 6;
