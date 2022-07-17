//#region CLASSES

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

  constructor(idVaga, idCandidato, reprovado) {
    this.reprovado = reprovado;
    this.idCandidato = idCandidato;
    this.idVaga = idVaga;
  }
}

//#endregion

// Variável global para armazenar o usuário logado
let user;

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

//#region FUNCIONALIDADES MARCOS

const init = () => {
  document.getElementById('register-job').style.display = 'none';
  document.getElementById('job-description-user').style.display = 'none';

  document.getElementById('register-job-button').addEventListener('click', registerJob);
  document.getElementById('save-job').addEventListener('click', saveJob);
  document.getElementById('back-to-job-home').addEventListener('click', backToJobHome);
  document.getElementById('job-description-back').addEventListener('click', backToJobHome);
  document.getElementById('register-job-user').addEventListener('click', registerUserJob);
  document.getElementById('register-job-cancel').addEventListener('click', cancelJobUser);
  document.getElementById('logout').addEventListener('click', logout);
};

const listJobs = async () => {
  document.getElementById('job-list-content').textContent = '';
  showJobsBarByUserType();

  try {
    
    const {data:listJobs} = await api.get("/jobs")

    listJobs.forEach(item => createLineJob(item) )
   
  } catch (Error) {
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
  document.getElementById('card-recruiter').style.display = user.tipo == 'recrutador' ? 'flex' : 'none';
  document.getElementById('card-worker').style.display = user.tipo == 'trabalhador' ? 'flex' : 'none';
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

const goToJobDescriptionPage = async (jobId) => {
  const {data: users} = await api.get('/usuario');

  document.getElementById('register-job-cancel').style.display = 'none';
  document.getElementById('register-job-user').style.display = 'block';

  api.get(`/jobs/${jobId}`).then(result => {
    document.getElementById('home-worker').style.display = 'none';
    document.getElementById('job-description-user').style.display = 'block';

    document.getElementById('job-detail-description').textContent = `Descrição: ${result.data.descricao}`;
    document.getElementById('job-detail-salary').textContent = `R$ ${result.data.remuneracao}`;

    document.getElementById('job-id').value = jobId;

    let UlJobApplicants = document.getElementById('job-applicants');
    UlJobApplicants.textContent = '';

    if(!result.data.candidatos.length){
      return;
    }

    result.data.candidatos.forEach(item => {
    const cancelButton = document.getElementById('register-job-cancel');
     const candidate = users.find(user => user.id === item.idCandidato);

     if(candidate){
      document.getElementById('register-job-user').style.display = 'none';
      cancelButton.style.display = 'block';
     } 

     if(item.reprovado){
      cancelButton.disabled = true;
      cancelButton.style.backgroundColor = 'grey';
     }

      let li = document.createElement('li');
      let pName = document.createElement('p');
      let pBirthdate = document.createElement('p');

      pName.textContent = candidate.nome;
      pBirthdate.textContent = candidate.dataNascimento;

      li.appendChild(pName);
      li.appendChild(pBirthdate);

      UlJobApplicants.appendChild(li);
    });
  });

}

const emailIsValid = (email) => { 

  const emailSplitForArroba = email.split('@');
  const hasArroba = emailSplitForArroba.length === 2;
  const addressIsValid = email.indexOf('@') >= 3;

  const domainSeparate = hasArroba ? emailSplitForArroba[1].split('.') : [];

  let domainIsValid = domainSeparate[0] ? domainSeparate[0].length >= 3 : false;

  domainIsValid = domainIsValid && domainSeparate.every(cd => cd.length >= 2);
  domainIsValid = domainIsValid && (domainSeparate.length === 2 || domainSeparate.length === 3);

  return hasArroba && addressIsValid && domainIsValid;
}

const passwordIsValid = (password) => {

  const passwordCharacters = password.split('');

  const hasNumber = passwordCharacters.some(caracter => !isNaN(parseInt(caracter)));

  const letters = passwordCharacters.filter( caracter => caracter.toLowerCase() !== caracter.toUpperCase());

  const hasLetterUpperCase = letters.some(caracter => caracter !== caracter.toUpperCase());
  
  const hasLetterLowerCase = letters.some(caracter => caracter !== caracter.toLowerCase());

  const hasCharacterSpecial = passwordCharacters.some(caracter => {
    return isNaN(parseInt(caracter)) && caracter.toLowerCase() === caracter.toUpperCase();
  });

  const hasEightCharacteres = password.length >= 8;

  return hasNumber
    && hasLetterUpperCase
    && hasLetterLowerCase
    && hasCharacterSpecial
    && hasEightCharacteres;
}

const signInSystem = async (event) => {
  event.preventDefault()

  const valueEmail = inputLoginEmail.value
  const valuePassword = inputLoginPassword.value

  if (!valueEmail || !valuePassword) {
    alert("Digite a senha e o email")
    return 
  }

  if(!emailIsValid(valueEmail)) {
    alert("Email não é valido.")
    return 
  }

  if(!passwordIsValid(valuePassword)) {
    alert("Senha não é valida.")
    return
  }

  try {

    const {data: result} = await api.get(`/usuario?email=${valueEmail}&senha=${valuePassword}`)

    if(!result.length) {
      alert("Usuário não existe cadastrado")
      return
    }

    user = {
      id: result[0].id,
      tipo: result[0].tipo,
      email: result[0].email
    }

    listJobs();
    goScreenHome()

  }catch(Error) {
    console.log("Erro ao realizar login")
  }

  clearInputs(inputLoginEmail.id, inputLoginPassword.id)

}

const goScreenRegisterUser = () => {
  const screenRegister = document.getElementById("register-user")
  const screenLogin = document.getElementById("login")

  screenRegister.classList.toggle("remove-element")
  screenLogin.classList.add("remove-element")
  
}

const goScreenHome = () => {
  const screenHome = document.getElementById("home-worker")
  const screenLogin = document.getElementById("login")

  screenHome.classList.toggle("remove-element")
  screenLogin.classList.add("remove-element")
}

const recoverPassword = async () => {
  
  try {
    const searchEmail = prompt("Digite o e-mail que esta buscando a senha:")
    
    if(!searchEmail) {
      alert("Digite algo no e-mail")
      recoverPassword()
      return
    }

    const {data: resultSearch} = await api.get(`/usuario?email=${searchEmail}`)

    if(!resultSearch.length) {
      alert("E-mail não existe registrado")
      return    
    }

    alert(`Senha do colaborador: ${resultSearch[0].senha}`)
    return

  }catch(Error) {
    alert("Erro no e-mail")
  }
  
}

const backForScreenLogin = (event ) => {
  event.preventDefault()
  

}

clearInputs = (...inputs) => {

  if(!inputs.length) {
    return
  }

  inputs.forEach(input => {
    
    const elementInput = document.getElementById(input)
    elementInput.value = ""
  })
}

//screen login

const buttonLogin = document.getElementById("button-login")
const inputLoginEmail = document.getElementById("input-login-email")
const inputLoginPassword = document.getElementById("input-login-password")

const notHasRegister = document.getElementById("not-has-register")
const forgotPassword = document.getElementById("forgot-password")

buttonLogin.addEventListener("click", signInSystem)
notHasRegister.addEventListener("click", goScreenRegisterUser )
forgotPassword.addEventListener("click", recoverPassword)

//screen register user

const buttonBackLogin = document.getElementById("back-screen-login")
const buttonRegisterNewUser = document.getElementById("register-new-user")

buttonBackLogin.addEventListener("click", backForScreenLogin )

const registerUserJob = async () => {
  const jobId = document.getElementById('job-id').value;
  const cancelButton = document.getElementById('register-job-cancel');
  const registerButton = document.getElementById('register-job-user');

  try {
    let {data: job} = await api.get(`/jobs/${jobId}`);

    const candidatura = new Candidatura(job.id, user.id, false);

    job.candidatos.push(candidatura);

    await api.put(`/jobs/${jobId}`, job);

    alert("Candidatura efetuada com sucesso.")

    cancelButton.style.display = 'block';
    registerButton.style.display = 'none';
    goToJobDescriptionPage(jobId);

  } catch(e) {
    alert("Ocorreu um erro ao se cadidatar a vaga");
    cancelButton.style.display = 'none';
    registerButton.style.display = 'block';
  }
}

const cancelJobUser = async () => {
  const jobId = document.getElementById('job-id').value;

  try {
    let {data: job} = await api.get(`/jobs/${jobId}`);

    job.candidatos = job.candidatos.find(item => item.idCandidato !== user.id) || [];

    await api.put(`/jobs/${jobId}`, job);
    alert("Candidatura cancelada com sucesso");
    goToJobDescriptionPage(jobId);
  } catch(e) {
    alert("Ocorreu um erro ao cancelar a candidatura");
  }
}

const logout = () => {
  user = {};
  document.getElementById('home-worker').style.display = 'none';
  document.getElementById('login').style.display = 'block';
};

//#endregion

init();
