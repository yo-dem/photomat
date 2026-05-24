import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-photo-grid',
  imports: [],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.css',
})
export class PhotoGrid {
  protected readonly photoService = inject(PhotoService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  triggerUpload(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.photoService.add(file.name, reader.result as string);
    reader.readAsDataURL(file);
    input.value = '';
  }
}
