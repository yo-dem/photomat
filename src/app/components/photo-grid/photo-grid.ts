import { Component, effect, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BachekaService } from '../../services/bacheca.service';
import { PhotoService } from '../../services/photo.service';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-photo-grid',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.css',
})
export class PhotoGrid {
  protected readonly photoService = inject(PhotoService);
  protected readonly themeService = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  protected readonly bachekaService = inject(BachekaService);
  private readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly editMode = toSignal(
    this.route.data.pipe(map(d => !!d['editMode'])),
    { initialValue: false },
  );

  protected readonly routeParamUsername = toSignal(
    this.route.params.pipe(map(p => p['username'] as string | undefined)),
    { initialValue: undefined },
  );

  protected readonly profileUsername = (() => {
    const editMode = this.editMode;
    const authCurrentUser = this.auth.currentUser;
    const routeParam = this.routeParamUsername;
    return () => (editMode() ? authCurrentUser() : (routeParam() ?? null));
  })();

  protected readonly selectedIndex = signal<number | null>(null);
  protected readonly dragIndex = signal<number | null>(null);
  protected readonly dropTarget = signal<number | null>(null);
  protected readonly pendingUpload = signal<{ name: string; dataUrl: string } | null>(null);
  protected readonly bachekaEligible = signal<boolean>(true);
  protected readonly uploadResult = signal<'published' | 'queued' | null>(null);

  // Two-way binding helper for ngModel
  protected get bachekaEligibleModel(): boolean {
    return this.bachekaEligible();
  }
  protected set bachekaEligibleModel(v: boolean) {
    this.bachekaEligible.set(v);
  }

  constructor() {
    effect(() => {
      const u = this.profileUsername();
      if (u) this.photoService.setUser(u);
    });
  }

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
    if (this.pendingUpload() !== null) {
      if (e.key === 'Escape') this.cancelUpload();
      return;
    }
    if (this.selectedIndex() === null) return;
    if (e.key === 'Escape') this.closePhoto();
    if (e.key === 'ArrowRight') this.navigate(1);
    if (e.key === 'ArrowLeft') this.navigate(-1);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
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
    reader.onload = () => {
      this.pendingUpload.set({ name: file.name, dataUrl: reader.result as string });
      this.bachekaEligible.set(true);
      this.uploadResult.set(null);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  confirmUpload(): void {
    const pending = this.pendingUpload();
    if (!pending) return;
    const eligible = this.bachekaEligible();
    this.photoService.add(pending.name, pending.dataUrl, eligible);
    const addedPhoto = this.photoService.getLastAddedPhoto();
    if (eligible && addedPhoto) {
      const result = this.bachekaService.submitPhoto(addedPhoto);
      this.uploadResult.set(result);
    } else {
      this.uploadResult.set(null);
    }
    this.pendingUpload.set(null);
    // Clear result after 4 seconds
    setTimeout(() => this.uploadResult.set(null), 4000);
  }

  cancelUpload(): void {
    this.pendingUpload.set(null);
  }

  getPendingCount(): number {
    const u = this.auth.currentUser();
    return u ? this.bachekaService.pendingCountForUser(u) : 0;
  }

  getNextPublishTime(): Date | null {
    const u = this.auth.currentUser();
    return u ? this.bachekaService.nextPublishTimeForUser(u) : null;
  }
}
