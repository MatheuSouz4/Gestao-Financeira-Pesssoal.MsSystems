import { AbstractControl, ValidationErrors } from '@angular/forms';

export class GenericValidator {
  static isValidCpfCnpj(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (!value) return null;

    // Verifica se é CPF (11) ou CNPJ (14)
    if (value.length === 11) {
      return GenericValidator.validateCPF(value) ? null : { cpfInvalido: true };
    } else if (value.length === 14) {
      return GenericValidator.validateCNPJ(value) ? null : { cnpjInvalido: true };
    }

    return { lengthInvalido: true };
  }

  private static validateCPF(cpf: string): boolean {
    if (/^(\d)\1+$/.test(cpf)) return false; // Bloqueia sequências iguais (111...)
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === parseInt(cpf.substring(10, 11));
  }

  private static validateCNPJ(cnpj: string): boolean {
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
  }
}