
class Usuario {
  id
  tipo
  nome
  dataNascimento
  candidaturas = []

  constructor (nome, tipo, dataNascimento, email, senha) {
    this.nome = nome
    this.tipo = tipo
    this.dataNascimento = dataNascimento
    this.email = email
    this.senha = senha
  }

}


class Vaga {
  id
  titulo
  descricao
  remuneracao
  candidatos = []

  constructor (titulo, descricao, remuneracao) {
    this.titulo = titulo
    this.descricao = descricao
    this.remuneracao = remuneracao
  }

}


class Candidatura {
  idVaga
  idCandidato
  reprovado

  constructor(reprovado) {
    this.reprovado = reprovado
  }
  
}