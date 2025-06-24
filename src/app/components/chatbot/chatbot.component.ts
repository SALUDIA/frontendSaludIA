import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatMessage, UserConfig, PredictionResponse } from '../../interfaces/medical.interface';
import { MedicalService } from '../../services/medical.service';
import { UserConfigComponent } from '../user-config/user-config.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, UserConfigComponent],
  providers: [MedicalService],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  messageForm: FormGroup;
  userConfig: UserConfig = { age: 25, gender: 'Masculino' };
  isLoading = false;
  showConfig = false;
  error: string | null = null;

  // 🆕 Nueva variable para el checkbox
  acceptsPrivacyPolicy = false;

  constructor(
    private fb: FormBuilder,
    private medicalService: MedicalService
  ) {
    this.messageForm = this.fb.group({
      symptoms: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  // 🆕 Método para manejar el cambio del checkbox
  onPrivacyPolicyChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.acceptsPrivacyPolicy = target.checked;

    // Si desmarcan el checkbox, limpiar el textarea
    if (!this.acceptsPrivacyPolicy) {
      this.messageForm.get('symptoms')?.setValue('');
    }
  }

  // 🆕 Getter para verificar si se puede enviar
  get canSendMessage(): boolean {
    return this.messageForm.valid && this.acceptsPrivacyPolicy && !this.isLoading;
  }

  get symptomsError() {
    const control = this.messageForm.get('symptoms');
    if (control?.hasError('required')) return 'Describe tus síntomas';
    if (control?.hasError('minlength')) return 'Describe con más detalle (mínimo 10 caracteres)';
    return null;
  }

  onSendMessage() {
    if (this.messageForm.valid && !this.isLoading && this.acceptsPrivacyPolicy) {
      const symptoms = this.messageForm.value.symptoms.trim();

      const userMessage: ChatMessage = {
        id: this.generateId(),
        content: symptoms,
        isUser: true,
        timestamp: new Date()
      };
      this.messages.push(userMessage);

      this.messageForm.reset();
      this.sendPredictionRequest(symptoms);
      this.scrollToBottom();
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  private sendPredictionRequest(symptoms: string) {
    this.isLoading = true;
    this.error = null;

    const request = {
      symptoms: symptoms,
      age: this.userConfig.age,
      gender: this.userConfig.gender
    };

    this.medicalService.predictDisease(request).subscribe({
      next: (response: PredictionResponse) => {
        this.handlePredictionResponse(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
        console.error('Error en predicción:', error);
      }
    });
  }

  private handlePredictionResponse(response: PredictionResponse) {
    let botContent = `🏥 **Análisis Médico Completado**\n\n`;

    if (response.success) {
      botContent += `**Diagnóstico Principal:** ${response.main_diagnosis}\n`;
      botContent += `**Nivel de Confianza:** ${response.confidence_level} (${response.confidence.toFixed(1)}%)\n\n`;

      if (response.top_predictions && response.top_predictions.length > 0) {
        botContent += `**Posibles Diagnósticos:**\n`;
        response.top_predictions.forEach((pred, index) => {
          botContent += `${index + 1}. ${pred.disease} - ${pred.probability.toFixed(1)}%\n`;
        });
      }

      botContent += `\n⚠️ **Importante:** Esta es una evaluación automatizada. Consulta con un médico profesional para un diagnóstico definitivo.`;
    } else {
      botContent += `❌ No se pudo procesar tu consulta. Intenta reformular tus síntomas.`;
    }

    const botMessage: ChatMessage = {
      id: this.generateId(),
      content: botContent,
      isUser: false,
      timestamp: new Date()
    };

    this.messages.push(botMessage);
    this.scrollToBottom();
  }

  private addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content: `¡Hola! Soy tu asistente médico virtual SaludIA 🏥

Puedo ayudarte a obtener información sobre posibles diagnósticos basados en tus síntomas.

Para comenzar:
1. ✅ Acepta la política de privacidad
2. 📝 Describe detalladamente tus síntomas
3. 📤 Envía tu consulta

⚠️ **Recuerda:** Mis sugerencias son informativas y no reemplazan una consulta médica profesional.`,
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(welcomeMessage);
  }

  openConfig() {
    this.showConfig = true;
  }

  closeConfig() {
    this.showConfig = false;
  }

  clearChat() {
    this.messages = [];
    this.error = null;
    this.messageForm.reset();
    this.addWelcomeMessage();
  }

  onConfigChange(config: UserConfig) {
    this.userConfig = { ...config };
  }

  trackByFn(index: number, item: ChatMessage) {
    return item.id;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
