import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefone',
  standalone: true
})
export class TelefonePipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    const apenasNumeros = value.toString().replace(/\D/g, '');

    if (apenasNumeros.length === 11) {
      // Celular: (00) 00000-0000
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (apenasNumeros.length === 10) {
      // Fixo: (00) 0000-0000
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return apenasNumeros;
  }
}