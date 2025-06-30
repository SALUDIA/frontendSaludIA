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
  userConfig: UserConfig = { age: 25, gender: 'Femenino' };
  isLoading = false;
  showConfig = false;
  error: string | null = null;
  acceptsPrivacyPolicy = false;
  isTyping = false;

  constructor(
    private fb: FormBuilder,
    private medicalService: MedicalService
  ) {
    this.messageForm = this.fb.group({
      symptoms: [
        { value: '', disabled: true },
        [Validators.required, Validators.minLength(10)]
      ]
    });
  }

  ngOnInit() {
    this.addWelcomeMessage();
  }

  onPrivacyPolicyChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.acceptsPrivacyPolicy = target.checked;

    const symptomsControl = this.messageForm.get('symptoms');

    if (this.acceptsPrivacyPolicy && !this.isLoading) {
      symptomsControl?.enable();
    } else {
      symptomsControl?.disable();
      symptomsControl?.setValue('');
    }
  }

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

      this.messageForm.get('symptoms')?.setValue('');
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
    this.isTyping = true;
    this.error = null;

    this.messageForm.get('symptoms')?.disable();

    const request = {
      symptoms: symptoms,
      age: this.userConfig.age,
      gender: this.userConfig.gender
    };

    this.medicalService.predictDisease(request).subscribe({
      next: (response: PredictionResponse) => {
        setTimeout(() => {
          this.handlePredictionResponse(response);
          this.isLoading = false;
          this.isTyping = false;

          if (this.acceptsPrivacyPolicy) {
            this.messageForm.get('symptoms')?.enable();
          }
        }, 2000);
      },
      error: (error) => {
        setTimeout(() => {
          this.error = error.message;
          this.isLoading = false;
          this.isTyping = false;

          if (this.acceptsPrivacyPolicy) {
            this.messageForm.get('symptoms')?.enable();
          }
          console.error('Error en predicción:', error);
        }, 1000);
      }
    });
  }

  // 🎯 SOLO MOSTRAR DIAGNÓSTICO
  private handlePredictionResponse(response: PredictionResponse) {
    let botContent = '';

    if (response.success && response.result) {
      const result = response.result;

      // 🩺 DIAGNÓSTICO
      if (result.diagnostico) {
        botContent += `🩺 **DIAGNÓSTICO**\n`;
        botContent += `${result.diagnostico}\n\n`;

        // � INFORMACIÓN ADICIONAL
        botContent += `📊 **Detalles del Análisis**\n`;
        botContent += `• Confianza: ${result.confianza}%\n`;
        botContent += `• Modelo utilizado: ${result.modelo_usado}\n`;
        botContent += `• Rango de edad: ${result.rango_edad}\n\n`;
      }

      // ⚠️ DISCLAIMER
      botContent += `⚠️ **Importante:** Esta es una evaluación automatizada. Consulta con un médico profesional para un diagnóstico definitivo.`;

    } else {
      botContent = `❌ **Error en el Análisis**\n\nNo se pudo procesar tu consulta. Por favor:\n\n1. Verifica que hayas descrito tus síntomas claramente\n2. Intenta reformular tu consulta\n3. Si el problema persiste, contacta al soporte técnico`;
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

Puedo ayudarte a obtener información sobre posibles diagnósticos basados en tus síntomas usando nuestro modelo de IA **v11**.

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
    this.isTyping = false;
    this.messageForm.get('symptoms')?.setValue('');
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
