import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-photo-grid',
  imports: [],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.css',
})
export class PhotoGrid {
  protected readonly photoService = inject(PhotoService);
  protected readonly themeService = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly editMode = toSignal(
    this.route.data.pipe(map(d => !!d['editMode'])),
    { initialValue: false },
  );

  protected readonly selectedIndex = signal<number | null>(null);
  protected readonly dragIndex = signal<number | null>(null);
  protected readonly dropTarget = signal<number | null>(null);

  protected get selectedPhoto() {
    const i = this.selectedIndex();
    return i !== null ? (this.photoService.displaySlots()[i] ?? null) : null;
  }

  openPhoto(slotIndex: number): void {
    if (this.photoService.displaySlots()[slotIndex]) {
      this.selectedIndex.set(slotIndex);
    }
  }

  closePhoto(): void {
    this.selectedIndex.set(null);
  }

  navigate(delta: 1 | -1): void {
    const slots = this.photoService.displaySlots();
    const current = this.selectedIndex();
    if (current === null) return;
    const count = slots.length;
    for (let step = 1; step < count; step++) {
      const next = ((current + delta * step) + count) % count;
      if (slots[next] !== null) {
        this.selectedIndex.set(next);
        return;
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.selectedIndex() === null) return;
    if (e.key === 'Escape') this.closePhoto();
    if (e.key === 'ArrowRight') this.navigate(1);
    if (e.key === 'ArrowLeft') this.navigate(-1);
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  onDragStart(index: number, event: DragEvent): void {
    if (!this.editMode() || !this.photoService.displaySlots()[index]) return;
    this.dragIndex.set(index);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dropTarget.set(this.dragIndex() !== index ? index : null);
  }

  onDragLeave(event: DragEvent): void {
    const cell = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (!related || !cell.contains(related)) {
      this.dropTarget.set(null);
    }
  }

  onDrop(toIndex: number, event: DragEvent): void {
    event.preventDefault();
    const from = this.dragIndex();
    if (from !== null && from !== toIndex) {
      this.photoService.movePhoto(from, toIndex);
    }
    this.dragIndex.set(null);
    this.dropTarget.set(null);
  }

  onDragEnd(): void {
    this.dragIndex.set(null);
    this.dropTarget.set(null);
  }

  triggerUpload(): void {
    this.fileInput()?.nativeElement.click();
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
