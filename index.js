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


// Ir para as telas
const goForScreen = ( screenNowId, screenAfterId, event) => {
  if(event) {
    event.preventDefault()
  }

  const screenNow = document.getElementById(screenNowId)
  const screenAfter = document.getElementById(screenAfterId)

  screenNow.classList.add("remove-element")
  screenAfter.classList.remove("remove-element")
}


//#region VALIDAÇÃO INPUTS REGISTRAR USUÁRIO

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

const dateBirthIsValid = (date) => {

  if(date.length != 10) {
    return false
  }

  const day = date.substring(0,2);
  const month = date.substring(3,5);
  const year = date.substring(6);

  const dateNow = new Date();
  const dateBirth = new Date(`${month}/${day}/${year}`);

  const dateIsValid = isNaN(dateBirth);

  const age = dateNow.getFullYear() - dateBirth.getFullYear();

  const underAge = !isNaN(age) && age > 18;
  
  const isValidDate = !dateIsValid && underAge

  return isValidDate ? dateBirth : false

}

const nameIsValid = (name) => {
  name = name.replaceAll(" ").split("")

  const nameHasOnlyLetter = name.every(caracter => caracter.toLowerCase() !== caracter.toUpperCase())

  return nameHasOnlyLetter
}

const addMaskForDate = () => {
  
  const dateInput = document.getElementById('register-user-date');
  let date = dateInput.value.replaceAll(' ', '').replaceAll('/', ''); // remover espaços e barras
  // dependendo do tamanho vamos retornar uma determinada string
  switch(date.length) {
    case 3: case 4:
      dateInput.value = `${date.substring(0,2)}/${date.substring(2)}`;
      break;
    case 5: case 6: case 7: case 8:
      dateInput.value = `${date.substring(0,2)}/${date.substring(2,4)}/${date.substring(4)}`;
      break;
    default:
      dateInput.value = date;
  }
}

//#endregion

//#region TELA DE LOGIN

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

    const {data: result} = await api.get(`/usuario?email=${valueEmail}`)

    if(!result.length) {
      alert("Usuário não existe cadastrado")
      return
    }

    if(result[0].senha !== valuePassword) {
      alert("Senha invalida do usuário")
      return
    }

    user = {
      id: result[0].id,
      tipo: result[0].tipo,
      email: result[0].email
    }

    goForScreen("login", "home-worker")
    showListJobs()

  }catch(Error) {
    console.log("Erro ao realizar login")
  }

  clearInputs(inputLoginEmail.id, inputLoginPassword.id)

}

const recoverPassword = async () => {
  
  try {
    const searchEmail = prompt("Digite o e-mail que esta buscando a senha:")
    
    if(!searchEmail) {
      alert("Digite algo no e-mail")
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


//#endregion

//#region TELA DE CADASTRAR USUÁRIO

const registerNewUser = async (event) => {
  event.preventDefault()

  const {value: type} = document.getElementById("register-user-type")
  const {value: name} = document.getElementById("register-user-name")
  const {value: email} = document.getElementById("register-user-email")
  const {value: date} = document.getElementById("register-user-date")
  const {value: password} = document.getElementById("register-user-password")

  if(!type || !name || !email || !date || !password) {
    alert("Preencha todos os parametros")
    return
  }
  
  let messagesError = ""

  if (!emailIsValid(email)) {
    messagesError += "Email não é valido.\n"
  }

  if (!passwordIsValid(password)) {
    messagesError += "Senha não é valida.\n"
  }

  const dateValid = dateBirthIsValid(date)

  if (!dateValid) {
    messagesError += "Data não é valida.\n"
  }

  if (!nameIsValid(name)) {
    messagesError += "Nome não é valido. Somente letras.\n"
  }

  if(messagesError.length) {
    alert(`Possui erros nos dados inseridos:\n${messagesError}`)
    return
  }

  const {data:existsEmailRegister} =  await api.get(`/usuario?email=${email}`)

  if(existsEmailRegister.length) {
    alert("Já existe esse email cadastrado.")
    return
  }

  const newUser = new Usuario(name, type, dateValid, email, password)

  try {

    const {data:result} = await api.post("/usuario", newUser)

    if (result) {
      alert("Usuário cadastrado com sucesso.")
    }
    

    const listIdInputs = ["register-user-type", "register-user-name", 
    "register-user-email", "register-user-date", "register-user-password"]

    clearInputs(...listIdInputs)
    goForScreen("register-user", "login")
    return
    
  } catch(Error) {
    console.log(Error)
    return
  }
  

}

//#endregion

//#region TELA DE CADASTRAR VAGA

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

//#endregion

//#region TELA HOME

const showListJobs = async () => {
  const listContent = document.getElementById('job-list-content')
  listContent.textContent = '';

  showJobsBarByUserType();
  
  try {
    const {data:listJobs} = await api.get("/jobs")

    if(!listJobs.length) {
      return
    }

    listJobs.forEach(item => createElementJob(item) )
   
  } catch (Error) {
    alert('Erro ao buscar vagas');
  }
};

const showJobsBarByUserType = () => {
  const divShowForRecruiter = document.getElementById('card-recruiter')
  const divShowForWorker = document.getElementById('card-worker')

  divShowForRecruiter.style.display = user.tipo !== 'recrutador' && 'none';
  divShowForWorker.style.display = user.tipo !== 'trabalhador' && 'none';
};

const createElementJob = (job) => {
  const li = document.createElement('li');
  const listContent = document.getElementById("job-list-content")

  const divTitle = document.createElement('div');
  const h3Title = document.createElement('h3');
  const pTitle = document.createElement('p');

  const divSalary = document.createElement('div');
  const h3Salary = document.createElement('h3');
  const pSalary = document.createElement('p');

  h3Title.textContent = 'Título:';
  pTitle.textContent = job.titulo;

  h3Salary.textContent = 'Remuneração:';
  pSalary.textContent = job.remuneracao;

  divTitle.append(h3Title, pTitle)
  divSalary.append(h3Salary, pSalary)

  li.append(divTitle, divSalary)
  li.addEventListener('click', () => goToJobDescriptionPage(job.id));
  li.classList.add("list-card-job")

  listContent.append(li)
 
};

const logout = () => {

  if(user) {
    user = {};
  }
  
  goForScreen("home-worker", "login")
 
}

//#endregion

const goToJobDescriptionPage = (jobId) => {
  
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

const clearInputs = (...inputs) => {

  if(!inputs.length) {
    return
  }

  inputs.forEach(input => {
    
    const elementInput = document.getElementById(input)
    elementInput.value = ""
  })
}

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

//screen login

const buttonLogin = document.getElementById("button-login")
const inputLoginEmail = document.getElementById("input-login-email")
const inputLoginPassword = document.getElementById("input-login-password")
const notHasRegister = document.getElementById("not-has-register")
const forgotPassword = document.getElementById("forgot-password")

buttonLogin.addEventListener("click", signInSystem)
notHasRegister.addEventListener("click", event => goForScreen("login", "register-user", event))
forgotPassword.addEventListener("click", recoverPassword)

//screen register user

const buttonBackLogin = document.getElementById("back-screen-login")
const buttonRegisterNewUser = document.getElementById("register-new-user")
const inputDateBirth = document.getElementById("register-user-date")

buttonBackLogin.addEventListener("click", event => goForScreen("register-user", "login", event))
buttonRegisterNewUser.addEventListener("click", registerNewUser)
inputDateBirth.addEventListener("keyup", addMaskForDate)

//screen home

const buttonGoScreenRegisterNewJob = document.getElementById('register-job-button')
buttonGoScreenRegisterNewJob.addEventListener('click', event => goForScreen("home-worker", "register-job", event));

const buttonLogoutUser = document.getElementById('logout-user')
  buttonLogoutUser.addEventListener('click', logout);

const buttonLogoutRecruiter = document.getElementById("logout-recruiter")
buttonLogoutRecruiter.addEventListener("click", logout)

//screen register job

const buttonRegisterNewJob = document.getElementById('save-job')
buttonRegisterNewJob.addEventListener('click', saveJob);

const buttonBackToScreenHome = document.getElementById('back-to-job-home')
buttonBackToScreenHome.addEventListener('click', event => goForScreen("register-job", "home-worker", event));


//screen description job for user

const buttonGoScreenHome = document.getElementById('job-description-back')
buttonGoScreenHome.addEventListener('click', event => goForScreen("job-description-recruiter", "home-worker", event));

const buttonApllyInJob = document.getElementById('register-job-user')
buttonApllyInJob.addEventListener('click', registerUserJob);

const buttonCancelAplly = document.getElementById('register-job-cancel')
buttonCancelAplly.addEventListener('click', cancelJobUser);




