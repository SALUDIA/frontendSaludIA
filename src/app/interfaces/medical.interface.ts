export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UserConfig {
  age: number;
  gender: string;
}

// Nueva interfaz para la request v11
export interface PredictionRequest {
  symptoms: string;
  age: number;
  gender: string;
}

// 🆕 Nueva interfaz para la response v11
export interface PredictionResponse {
  success: boolean;
  result: {
    confianza: number;
    diagnostico: string;
    diagnostico_original: string;
    edad_detectada: number;
    genero_usado: string;
    modelo_usado: string;
    rango_edad: string;
    texto_procesado: string;
    timestamp: string;
  };
}

// 🆕 Opciones de género actualizadas para enviar en español
export const GENDER_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' }
];

// 🆕 Opciones de edad (si las necesitas)
export const AGE_RANGES = [
  { min: 0, max: 17, label: 'Menor de edad' },
  { min: 18, max: 30, label: 'Joven adulto' },
  { min: 31, max: 50, label: 'Adulto' },
  { min: 51, max: 70, label: 'Adulto mayor' },
  { min: 71, max: 120, label: 'Tercera edad' }
];
