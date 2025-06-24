export interface PredictionRequest {
  symptoms: string;
  age: number;
  gender: string;
}

export interface Disease {
  disease: string;
  probability: number;
}

export interface ProcessingInfo {
  original_input: {
    age: number;
    gender: string;
    symptoms: string;
  };
  processed_input: {
    age_range: string;
    normalized_gender: string;
    translated_symptoms: string;
  };
  translation: {
    confidence: number;
    detected_language: string;
    was_translated: boolean;
  };
}

export interface PredictionResponse {
  confidence: number;
  confidence_level: string;
  endpoint_type: string;
  main_diagnosis: string;
  model_version: string;
  processed_symptoms: string;
  processing_info: ProcessingInfo;
  session_id: string;
  success: boolean;
  timestamp: string;
  top_predictions: Disease[];
  user_friendly: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  prediction?: PredictionResponse;
}

export interface UserConfig {
  age: number;
  gender: string;
}

export const GENDER_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' }
];
