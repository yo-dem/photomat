import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
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

  protected readonly selectedIndex = signal<number | null>(null);

  protected get selectedPhoto() {
    const i = this.selectedIndex();
    return i !== null ? this.photoService.photos()[i] : null;
  }

  openPhoto(index: number): void {
    this.selectedIndex.set(index);
  }

  closePhoto(): void {
    this.selectedIndex.set(null);
  }

  navigate(delta: 1 | -1): void {
    const i = this.selectedIndex();
    if (i === null) return;
    const count = this.photoService.photos().length;
    this.selectedIndex.set((i + delta + count) % count);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.selectedIndex() === null) return;
    if (e.key === 'Escape') this.closePhoto();
    if (e.key === 'ArrowRight') this.navigate(1);
    if (e.key === 'ArrowLeft') this.navigate(-1);
  }

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
