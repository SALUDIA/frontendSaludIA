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

// 🆕 Nueva interfaz para la request
export interface PredictionRequest {
  symptoms: string;
  age: number;
  gender: string;
  model: string;
}

// 🆕 Nueva interfaz para la response
export interface PredictionResponse {
  success: boolean;
  metadata: {
    procesamiento: {
      categorizacion_edad: string;
      determinacion_genero: string;
      recomendaciones_source: string;
      traduccion_diagnostico: string;
      traduccion_sintomas: string;
    };
  };
  result: {
    confianza: number;
    diagnostico: string;
    diagnostico_original: string;
    edad_detectada: number;
    genero_origen: string;
    genero_usado: string;
    logged_to_db: boolean;
    modelo_usado: string;
    rango_edad: string;
    recomendaciones: string[];
    sintomas_procesados: string;
    timestamp: string;
  };
}

// 🆕 Agregar las opciones de género que faltaban
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Masculino' },
  { value: 'Female', label: 'Femenino' },
  { value: 'Other', label: 'Otro' }
];

// 🆕 Opciones de edad (si las necesitas)
export const AGE_RANGES = [
  { min: 0, max: 17, label: 'Menor de edad' },
  { min: 18, max: 30, label: 'Joven adulto' },
  { min: 31, max: 50, label: 'Adulto' },
  { min: 51, max: 70, label: 'Adulto mayor' },
  { min: 71, max: 120, label: 'Tercera edad' }
];
