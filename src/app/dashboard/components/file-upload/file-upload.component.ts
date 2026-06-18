import { Component, output } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [FileUploadModule],
  styleUrl: './file-upload.component.scss',
  template: `
    <div class="file-upload-container">
      <p-fileUpload
        mode="basic"
        accept=".xlsx,.xls"
        [auto]="false"
        [multiple]="false"
        (onSelect)="onFileSelect($event)"
        chooseLabel="Subir archivo"
        class="w-full file-upload-btn"
      />
    </div>
  `,
  styles: `
    .file-upload-container {
      padding: 1rem;
    }
  `,
})
export class FileUploadComponent {
  fileSelected = output<File>();

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
