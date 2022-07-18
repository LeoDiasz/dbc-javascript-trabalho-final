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

const clearInputs = (...inputs) => {

  if(!inputs.length) {
    return
  }

  inputs.forEach(input => {
    
    const elementInput = document.getElementById(input)
    elementInput.value = ""
  })
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
  let date = dateInput.value.replaceAll(' ', '').replaceAll('/', ''); 

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
    alert("Erro ao registrar usuário")
    return
  }
  

}

const backForScreenLogin = (event) => {
  const listIdInputs = ["register-user-type", "register-user-name", "register-user-email", "register-user-date", "register-user-password"]

  clearInputs(...listIdInputs)

  goForScreen("register-user", "login", event)

}

//#endregion

//#region TELA DE CADASTRAR VAGA

const saveJob = async (event) => {
  event.preventDefault()

  const {value:inputTitle} = document.getElementById('input-title');
  const {value:inputDescription} = document.getElementById('input-description');
  const {value:inputSalary} = document.getElementById('input-salary');
  
  let messageError = ""
  
  if(!inputTitle || !inputDescription || !inputSalary) {
    alert("Digite todos os parametros")
    return
  }

  if (isNaN(inputSalary) || inputSalary < 0) {
    messageError += 'Remuneração somente numeros acima de 0\n';
  }

  if (!inputTitle.length) {
    messageError += 'O título é obrigatório. Digite algum valor.\n'
  }

  if (!inputDescription.length) {
    messageError +='A descrição é obrigatória. Digite algum valor.\n';
  }

  if(messageError.length) {
    alert(`Erro ao cadastrar a vaga, verifique:\n${messageError}`)
    return
  }

  const formatSalary = `R$ ${inputSalary}`
  const newJob = new Vaga(inputTitle, inputDescription, formatSalary);
  
  try {
    await api.post('/jobs', newJob);

    alert("Vaga cadastrada com sucesso")
    clearInputs("input-title", "input-salary", "input-description")
    goForScreen("register-job", "home-worker")
    showListJobs();
    return
    
  } catch (e) {
    alert('Ocorreu um erro ao cadastrar vaga');
    clearInputs("input-title", "input-salary", "input-description")
    return
  } 
};

const backForHome = (event) => {
  clearInputs("input-title", "input-description", "input-salary")
  goForScreen("register-job", "home-worker", event)
}

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
    return
   
  } catch (Error) {
    alert('Erro ao buscar vagas');
  }
};

const showJobsBarByUserType = () => {
  const divShowForRecruiter = document.getElementById('card-recruiter')
  const divShowForWorker = document.getElementById('card-worker')

  if(user.tipo == "recrutador") {
    divShowForRecruiter.style.display = "flex"
    divShowForWorker.style.display = "none"

  } else {
    divShowForWorker.style.display = "flex"
    divShowForRecruiter.style.display = "none"
  }

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
  li.addEventListener('click', event => goToJobDescriptionPage(job.id, event));
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

//#region TELA DESCRIÇÃO VAGA

const createElementCandidatureInJob = async (worker, jobId) => {
  const listCandidature = document.getElementById('list-candidature');
  const cancelCandidatureButton = document.getElementById('register-job-cancel');

  const isCandidate = worker.idCandidato == user.id

  listCandidature.textContent = ""

  try {
    const {data:candidateData} = await api.get(`/usuario/${worker.idCandidato}`)
    
    let li = document.createElement('li');
    let pName = document.createElement('p');
    let pBirthdate = document.createElement('p');
    let buttonReprove = document.createElement("button")

    const dateCandidate = candidateData.dataNascimento
    const date = new Date(dateCandidate)
    const dateFormat = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

    pName.textContent = candidateData.nome;
    pBirthdate.textContent = dateFormat
    buttonReprove.textContent = "Reprovar"
    buttonReprove.classList.add("button-reprove")
    buttonReprove.addEventListener("click", event => reproveWorkerInJob(jobId, worker))
  
    if(worker.reprovado && isCandidate && user.tipo == "trabalhador"){
      pName.style.color = "red"
    }

    if(user.tipo == "recrutador" && worker.reprovado) {
      pName.style.color = "red"
      buttonReprove.disabled = true;
      buttonReprove.style.backgroundColor = 'grey';
    }

    if(isCandidate && worker.reprovado) {
      cancelCandidatureButton.disabled = true;
      cancelCandidatureButton.style.backgroundColor = 'grey';
    }

    if(user.tipo == "recrutador") {
      li.append(pName, pBirthdate, buttonReprove)
    } else {
      li.append(pName, pBirthdate)
    }
    
    listCandidature.append(li)

  } catch(Error) {
    alert("Erro ao montar a lista")
    return
  }
}

const goToJobDescriptionPage = async (jobId, event) => {
  event.preventDefault()


  const {data:dataJob} = await api.get(`jobs/${jobId}`)

  goForScreen("home-worker", "job-description")

  const title = document.getElementById("job-description-title")
  const description = document.getElementById("job-text")
  const salary = document.getElementById("job-description-salary")

  const divButtonsWorker = document.getElementById("job-description-options-worker")
  divButtonsWorker.textContent = ""
  const divButtonRecruiter = document.getElementById("job-description-options-recruiter")
  divButtonRecruiter.textContent = ""

  const createButtonDelete = document.createElement("button")
  createButtonDelete.textContent = "Excluir vaga"
  createButtonDelete.addEventListener("click", event => deleteRoomJob(jobId, event))
  divButtonRecruiter.append(createButtonDelete)

  const createButtonApllyJob = document.createElement("button")
  createButtonApllyJob.textContent = "Candidatar-se"
  createButtonApllyJob.addEventListener("click", event => registerUserInJob(jobId, event))
  createButtonApllyJob.setAttribute("id", "job-description-apply-job")
  
  const createButtonCancelApply = document.createElement("button")
  createButtonCancelApply.textContent = "Cancelar candidatura"
  createButtonCancelApply.addEventListener("click", event => cancelJobUser(jobId, event))
  createButtonCancelApply.setAttribute("id", "register-job-cancel")
  createButtonCancelApply.classList.add("register-job-cancel")

  divButtonsWorker.append(createButtonApllyJob, createButtonCancelApply)

  if(user.tipo == "recrutador") {
    divButtonsWorker.classList.add("remove-element")
    divButtonRecruiter.classList.remove("remove-element")

  } else {
    divButtonsWorker.classList.remove("remove-element")
    divButtonRecruiter.classList.add("remove-element")
  }

  title.textContent = `Titulo: ${dataJob.titulo}`
  description.textContent = `Descrição: ${dataJob.descricao}`
  salary.textContent = `Remuneração: ${dataJob.remuneracao}`

  if(!dataJob.candidatos.length){
    return;
  }

  const isCandidate = dataJob.candidatos.some(candidato => candidato.idCandidato == user.id)

  if(isCandidate) {
    createButtonApllyJob.style.display = "none"
    createButtonCancelApply.style.display = "block"

  } else {
    createButtonApllyJob.style.display = "block"
    createButtonCancelApply.style.display = "none"
  }
  
  dataJob.candidatos.forEach(worker => createElementCandidatureInJob(worker, jobId))
}

const registerUserInJob = async (jobId, event) => {
  event.preventDefault()

  try {
    let {data: job} = await api.get(`/jobs/${jobId}`);

    const candidatura = new Candidatura(jobId, user.id, false);

    job.candidatos.push(candidatura);

    await api.put(`/jobs/${jobId}`, job);

    alert("Candidatura efetuada com sucesso.")

    goForScreen("job-description", "home-worker")
    showListJobs()
    return

  } catch(e) {
    alert("Ocorreu um erro ao se cadidatar a vaga");
    
  }
}

const cancelJobUser = async (jobId, event) => {
  event.preventDefault()

  try {
    let {data: job} = await api.get(`/jobs/${jobId}`);

    job.candidatos = job.candidatos.find(item => item.idCandidato !== user.id) || [];

    await api.put(`/jobs/${jobId}`, job);

    alert("Candidatura cancelada com sucesso");
    
  } catch(e) {
    
    alert("Ocorreu um erro ao cancelar a candidatura");
  }

  goForScreen("job-description", "home-worker")
  showListJobs()
}

const deleteRoomJob = async (jobId, event) => {
  event.preventDefault()
  const isConfirm = confirm("Você tem certeza que deseja deletar a sala?")

  if (!isConfirm) {
    return
  }

  try {
    await api.delete(`/jobs/${jobId}`)
 
    alert("vaga deletada com sucesso")
    goForScreen("job-description", "home-worker")
    showListJobs()
    return

  } catch(Error) {
    alert("Não foi possivel deletar a sala.")
  }
  
}

const reproveWorkerInJob = async (jobId, worker, event) => {

  const isConfirm = confirm("Você tem certeza que deseja reprovar o candidato?")
  
  if (!isConfirm) {
    return
  }

  try {
    const {data:job} = await api.get(`/jobs/${jobId}`)

    job.candidatos.forEach(candidato => {
      if (candidato.id == worker.id) {
        candidato.reprovado = true
      }
    }) 

    await api.put(`/jobs/${jobId}`, job)

    alert("Candidato reprovado com sucesso")
    return
  
} catch(Error) {
    alert("Erro ao reprovar candidato.")
    return
  }

} 
//#endregion


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

buttonBackLogin.addEventListener("click", backForScreenLogin)
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
buttonBackToScreenHome.addEventListener('click', backForHome);

//screen description 

const buttonGoScreenHome = document.getElementById('job-description-back')
buttonGoScreenHome.addEventListener('click', event => goForScreen("job-description", "home-worker", event));






