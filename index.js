class Usuario {
  id;
  tipo;
  nome;
  dataNascimento;
  candidaturas = [];

  constructor(nome, tipo, dataNascimento, email, senha) {
    this.nome = nome;
    this.tipo = tipo;
    this.dataNascimento = dataNascimento;
    this.email = email;
    this.senha = senha;
  }
}

class Vaga {
  id;
  titulo;
  descricao;
  remuneracao;
  candidatos = [];

  constructor(titulo, descricao, remuneracao) {
    this.titulo = titulo;
    this.descricao = descricao;
    this.remuneracao = remuneracao;
  }
}

class Candidatura {
  idVaga;
  idCandidato;
  reprovado;

  constructor(reprovado) {
    this.reprovado = reprovado;
  }
}

// Variável global para armazenar o usuário logado
let user = {
  tipo: 'recrutador',
};

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const init = () => {
  document.getElementById('register-job').style.display = 'none';
  document.getElementById('job-description-user').style.display = 'none';

  document.getElementById('register-job-button').addEventListener('click', registerJob);
  document.getElementById('save-job').addEventListener('click', saveJob);
  document.getElementById('back-to-job-home').addEventListener('click', backToJobHome);
  document.getElementById('job-description-back').addEventListener('click', backToJobHome);
};

const listJobs = () => {
  document.getElementById('job-list-content').textContent = '';
  showJobsBarByUserType();

  try {
    api
      .get('/jobs')
      .then((result) => result.data.forEach((item) => createLineJob(item)));
  } catch (e) {
    alert('Erro ao buscar vagas');
  }
};

const createLineJob = (vaga) => {
  const li = document.createElement('li');
  const divTitle = document.createElement('div');
  const h3Title = document.createElement('h3');
  const pTitle = document.createElement('p');
  const divSalary = document.createElement('div');
  const h3Salary = document.createElement('h3');
  const pSalary = document.createElement('p');

  divTitle.classList.add('title');
  divSalary.classList.add('salary');

  li.addEventListener('click', () => goToJobDescriptionPage(vaga.id));

  h3Title.textContent = 'Título:';
  pTitle.textContent = vaga.titulo;
  h3Salary.textContent = 'Remuneração:';
  pSalary.textContent = vaga.remuneracao;

  divTitle.appendChild(h3Title);
  divTitle.appendChild(pTitle);

  divSalary.appendChild(h3Salary);
  divSalary.appendChild(pSalary);

  li.appendChild(divTitle);
  li.appendChild(divSalary);

  document.getElementById('job-list-content').appendChild(li);
};

const showJobsBarByUserType = () => {
  document.getElementById('card-recruiter').style.display =
    user.tipo == 'recrutador' ? 'flex' : 'none';
  document.getElementById('card-worker').style.display =
    user.tipo == 'trabalhador' ? 'flex' : 'none';
};

const registerJob = () => {
  document.getElementById('register-job').style.display = 'block';
  document.getElementById('home-worker').style.display = 'none';
};

const saveJob = async () => {
  const errorInputStyle = '1px solid red';
  let title = document.getElementById('input-title');
  let description = document.getElementById('input-description');
  let salaryElement = document.getElementById('input-salary');

  salary = parseFloat(salaryElement.value);

  if (isNaN(salary)) {
    alert('Remuneração em formato incorreto');
    salaryElement.style.border = errorInputStyle;
    return;
  }

  if (title.value == '') {
    alert('O título é obrigatório');
    title.style.border = errorInputStyle;
    return;
  }

  if (description.value == '') {
    alert('A descrição é obrigatória');
    description.style.border = errorInputStyle;
    return;
  }

  const job = new Vaga(title.value, description.value, salary);

  try {
    await api.post('/jobs', job);
  } catch (e) {
    alert('Ocorreu um erro ao cadastrar vaga');
  }

  document.getElementById('register-job').style.display = 'none';
  document.getElementById('home-worker').style.display = 'block';
  listJobs();
};

const backToJobHome = () => {
  document.getElementById('register-job').style.display = 'none';
  document.getElementById('job-description-user').style.display = 'none';
  document.getElementById('home-worker').style.display = 'block';
  listJobs();
};

const goToJobDescriptionPage = (jobId) => {
  api.get(`/jobs/${jobId}`).then(result => {
    document.getElementById('home-worker').style.display = 'none';
    document.getElementById('job-description-user').style.display = 'block';

    document.getElementById('job-detail-description').textContent = `Descrição: ${result.data.descricao}`;
    document.getElementById('job-detail-salary').textContent = `R$ ${result.data.remuneracao}`;

    let UlJobApplicants = document.getElementById('job-applicants');
    UlJobApplicants.textContent = '';

    result.data.candidatos.forEach(candidato => {

      let li = document.createElement('li');
      let pName = document.createElement('p');
      let pBirthdate = document.createElement('p');

      pName.textContent = candidato.nome;
      pBirthdate.textContent = candidato.dataNascimento;

      li.appendChild(pName);
      li.appendChild(pBirthdate);

      UlJobApplicants.appendChild(li);

    })
  });

}

init();
listJobs();
