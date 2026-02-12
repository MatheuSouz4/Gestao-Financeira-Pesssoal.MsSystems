import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpfCnpj',
  standalone: true // Importante para componentes standalone
})
export class CpfCnpjPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // Remove tudo o que não for número
    const apenasNumeros = value.toString().replace(/\D/g, '');

    if (apenasNumeros.length === 11) {
      // Formato CPF: 000.000.000-00
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (apenasNumeros.length === 14) {
      // Formato CNPJ: 00.000.000/0000-00
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return apenasNumeros;
  }
}