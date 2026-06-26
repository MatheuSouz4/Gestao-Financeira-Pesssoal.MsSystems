export enum TipoPessoa {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA'
}

export enum Status{
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  BLOQUEADO = 'BLOQUEADO'
}

export interface Pessoa {
  id?: number;
  tipoPessoa: TipoPessoa;
  nomeOuNomeFantasia: string;
  cpfCnpj: string;
  rg?: string; // Apenas PF
  razaoSocial?: string; // Apenas PJ
  inscricaoEstadual?: string; // Apenas PJ
  email: string;
  telefone: string;
  endereco?: string;
  descricao?: string;
  status: string;
}

export interface Cliente extends Pessoa {
  // Campos específicos de cliente, se houver no futuro
}

export interface Fornecedor extends Pessoa {
  // Campos específicos de fornecedor, se houver no futuro
}