import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserConfig, GENDER_OPTIONS } from '../../interfaces/medical.interface';

@Component({
  selector: 'app-user-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-config.component.html',
  styleUrl: './user-config.component.css'
})
export class UserConfigComponent {
  @Input() userConfig: UserConfig = { age: 25, gender: 'Masculino' };
  @Output() configChange = new EventEmitter<UserConfig>();
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  configForm: FormGroup;
  genderOptions = GENDER_OPTIONS;

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      age: [this.userConfig.age, [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: [this.userConfig.gender, [Validators.required]]
    });
  }

  ngOnInit() {
    // Actualizar formulario cuando cambie la configuración
    this.configForm.patchValue(this.userConfig);

    // Escuchar cambios en el formulario
    this.configForm.valueChanges.subscribe(value => {
      if (this.configForm.valid) {
        this.configChange.emit(value);
      }
    });
  }

  onSubmit() {
    if (this.configForm.valid) {
      this.configChange.emit(this.configForm.value);
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }

  // Validaciones
  get ageError() {
    const ageControl = this.configForm.get('age');
    if (ageControl?.hasError('required')) return 'La edad es requerida';
    if (ageControl?.hasError('min')) return 'La edad debe ser mayor a 0';
    if (ageControl?.hasError('max')) return 'La edad debe ser menor a 120';
    return null;
  }

  get genderError() {
    const genderControl = this.configForm.get('gender');
    if (genderControl?.hasError('required')) return 'El género es requerido';
    return null;
  }
}
