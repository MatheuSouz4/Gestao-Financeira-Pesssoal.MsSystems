import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

/**
 * Classe Base Genérica para CRUDs.
 * T é o modelo de dados (Cliente, Fornecedor, etc)
 */
export abstract class BaseCrudComponent<T> {
  // Estados da tela
  public itens: T[] = [];
  public termoPesquisa: string = '';
  public isFormularioAberto: boolean = false;
  public itemEmEdicao: T | null = null;

  // Injeção moderna com inject() (evita constructor complexo)
  protected toastService = inject(ToastrService);

  // Métodos que as classes filhas DEVEM implementar
  abstract carregarDados(): void;

  // Comportamentos Padrão
  abrirFormularioCadastro(): void {
    this.itemEmEdicao = null;
    this.isFormularioAberto = true;
  }

  editarItem(item: T): void {
    this.itemEmEdicao = item;
    this.isFormularioAberto = true;
  }

  fecharFormulario(): void {
    this.isFormularioAberto = false;
    this.itemEmEdicao = null;
  }

  /**
   * Atualiza um item na lista local sem precisar recarregar tudo do banco.
   * Útil para performance e UX.
   */
  protected atualizarItemNaLista(itemAtualizado: T, idProp: keyof T = 'id' as keyof T): void {
    const index = this.itens.findIndex((item: any) => item[idProp] === (itemAtualizado as any)[idProp]);
    if (index !== -1) {
      this.itens[index] = itemAtualizado;
    }
  }
}