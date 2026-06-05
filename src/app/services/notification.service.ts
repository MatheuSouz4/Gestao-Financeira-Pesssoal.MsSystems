import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _updateSubject = new Subject<void>();
  
  // Observable que o Dashboard vai escutar
  public update$ = this._updateSubject.asObservable();

  // Método que o FinanceiroService vai chamar após qualquer alteração (POST, PUT, PATCH)
  notify(): void {
    this._updateSubject.next();
  }
}