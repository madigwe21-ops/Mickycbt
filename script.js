// ================= GLOBAL VARIABLES =================

let selectedSubjects = [];
let currentSubjectIndex = 0;
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 1800;
let loadedQuestions = {};

// ================= UTILITY =================

// Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ================= SECTION CONTROL =================

function hideAllSections() {
  document.getElementById("homeSection").classList.add("hidden");
  document.getElementById("aboutSection").classList.add("hidden");
  document.getElementById("subjectSelectSection").classList.add("hidden");
  document.getElementById("examSection").classList.add("hidden");
  document.getElementById("resultSection").classList.add("hidden");
}

function goHome() {
  clearInterval(timerInterval);
  hideAllSections();
  document.getElementById("homeSection").classList.remove("hidden");
}

function openAbout() {
  hideAllSections();
  document.getElementById("aboutSection").classList.remove("hidden");
}

function openCBTSelection() {
  hideAllSections();
  document.getElementById("subjectSelectSection").classList.remove("hidden");
}

// ================= LOAD SUBJECT =================

async function loadSubjectQuestions(subject) {
  
  const response = await fetch(`data/jamb/${subject}.json`);
  const data = await response.json();
  
  // Shuffle and pick 40
  const shuffled = shuffle(data);
  loadedQuestions[subject] = shuffled.slice(0, 40);
}

// ================= DIRECT SUBJECT MODE =================

async function openSubject(subject) {
  
  selectedSubjects = [subject];
  score = 0;
  currentSubjectIndex = 0;
  currentQuestionIndex = 0;
  timeLeft = 1800;
  loadedQuestions = {};
  
  await loadSubjectQuestions(subject);
  
  hideAllSections();
  document.getElementById("examSection").classList.remove("hidden");
  
  startTimer();
  loadQuestion();
}

// ================= CBT MODE =================

async function startCBT() {
  
  selectedSubjects = [];
  
  ["maths", "physics", "chemistry", "biology"].forEach(sub => {
    if (document.getElementById(sub).checked) {
      selectedSubjects.push(sub);
    }
  });
  
  if (selectedSubjects.length === 0) {
    alert("Select at least one subject");
    return;
  }
  
  score = 0;
  currentSubjectIndex = 0;
  currentQuestionIndex = 0;
  timeLeft = 1800;
  loadedQuestions = {};
  
  for (let subject of selectedSubjects) {
    await loadSubjectQuestions(subject);
  }
  
  hideAllSections();
  document.getElementById("examSection").classList.remove("hidden");
  
  startTimer();
  loadQuestion();
}

// ================= TIMER =================

function startTimer() {
  
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timeLeft--;
    
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    
    document.getElementById("timer").innerText =
      `${minutes}:${seconds < 10 ? "0":""}${seconds}`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResults();
    }
    
  }, 1000);
}

// ================= LOAD QUESTION =================

function loadQuestion() {
  
  let subject = selectedSubjects[currentSubjectIndex];
  let questions = loadedQuestions[subject];
  
  if (currentQuestionIndex >= questions.length) {
    currentSubjectIndex++;
    currentQuestionIndex = 0;
    
    if (currentSubjectIndex >= selectedSubjects.length) {
      showResults();
      return;
    }
    
    subject = selectedSubjects[currentSubjectIndex];
    questions = loadedQuestions[subject];
  }
  
  document.getElementById("subjectIndicator").innerText =
    subject.toUpperCase() + " - Question " + (currentQuestionIndex + 1);
  
  let q = questions[currentQuestionIndex];
  
  document.getElementById("questionText").innerText = q.question;
  
  let optionsHTML = "";
  
  q.options.forEach((opt, index) => {
    optionsHTML += `
      <div class="option" onclick="selectAnswer(${index})">
        ${opt}
      </div>
    `;
  });
  
  document.getElementById("optionsContainer").innerHTML = optionsHTML;
}

// ================= SELECT ANSWER =================

function selectAnswer(index) {
  
  let subject = selectedSubjects[currentSubjectIndex];
  let correct = loadedQuestions[subject][currentQuestionIndex].answer;
  
  let options = document.querySelectorAll(".option");
  options.forEach(o => o.classList.remove("selected"));
  options[index].classList.add("selected");
  
  if (index === correct) {
    score++;
  }
}

// ================= NAVIGATION =================

function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

// ================= RESULTS =================

function showResults() {
  
  clearInterval(timerInterval);
  hideAllSections();
  
  let totalQuestions = 0;
  selectedSubjects.forEach(sub => {
    totalQuestions += loadedQuestions[sub].length;
  });
  
  document.getElementById("resultSection").innerHTML = `
    <h2>Exam Completed</h2>
    <div class="review-card correct">
      Your Score: ${score} / ${totalQuestions}
    </div>
    <br>
    <button onclick="goHome()">Return Home</button>
  `;
  
  document.getElementById("resultSection").classList.remove("hidden");
}

// ================= CALCULATOR =================

function toggleCalculator() {
  document.getElementById("calculator").classList.toggle("hidden");
}

function appendCalc(value) {
  let screen = document.getElementById("calcScreen");
  if (screen.innerText === "0") {
    screen.innerText = value;
  } else {
    screen.innerText += value;
  }
}

function clearCalc() {
  document.getElementById("calcScreen").innerText = "0";
}

function calculateResult() {
  let screen = document.getElementById("calcScreen");
  try {
    screen.innerText = eval(screen.innerText);
  } catch {
    screen.innerText = "Error";
  }
}