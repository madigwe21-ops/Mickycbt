let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let timerInterval;
let timeLeft = 0;

let isCBT = false;
let cbtSubjects = ["maths", "physics", "chemistry", "biology"];
let currentCBT = 0;
let finalScore = 0;
let totalQuestions = 0;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

async function startSubject(subject) {
  
  try {
    const res = await fetch("data/jamb/" + subject + ".json");
    
    if (!res.ok) {
      throw new Error("File not found: " + subject);
    }
    
    questions = await res.json();
    
    if (!questions || questions.length === 0) {
      alert("No questions inside " + subject);
      return;
    }
    
    currentIndex = 0;
    score = 0;
    
    document.getElementById("home").style.display = "none";
    document.getElementById("exam").style.display = "block";
    
    showQuestion();
    
  } catch (error) {
    console.error(error);
    alert("Failed to load " + subject + " questions.");
  }
}

function startCBT() {
  isCBT = true;
  currentCBT = 0;
  finalScore = 0;
  totalQuestions = 160;
  timeLeft = 2 * 60 * 60;
  startTimer();
  loadSubject(cbtSubjects[currentCBT]);
}

function loadSubject(subject) {
  fetch(`data/jamb/${subject}.json`)
    .then(res => res.json())
    .then(data => {
      questions = shuffle(data).slice(0, 40);
      openExam(subject);
    });
}

function openExam(subject) {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("about").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");
  
  document.getElementById("subjectTitle").innerText = subject.toUpperCase();
  
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  showQuestion();
}

function showQuestion() {
  
  if (currentQuestion >= questions.length) {
    finishExam();
    return;
  }
  
  let q = questions[currentQuestion];
  
  let html = `<h3>Question ${currentQuestion+1} of ${questions.length}</h3>
            <p>${q.question}</p>`;
  
  if (q.image && q.image !== "") {
    html += `<img src="${q.image}" onerror="this.style.display='none'">`;
  }
  
  let options = shuffle([...q.options]);
  let correctText = q.options[q.answer];
  q.correctIndex = options.indexOf(correctText);
  
  options.forEach((opt, i) => {
    html += `<div class="option" onclick="selectAnswer(${i})">${opt}</div>`;
  });
  
  document.getElementById("questionBox").innerHTML = html;
}

function selectAnswer(index) {
  userAnswers[currentQuestion] = index;
  currentQuestion++;
  showQuestion();
}

function finishExam() {
  
  let score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.correctIndex) {
      score++;
    }
  });
  
  if (isCBT) {
    finalScore += score;
    currentCBT++;
    if (currentCBT < cbtSubjects.length) {
      loadSubject(cbtSubjects[currentCBT]);
    } else {
      finishFullCBT();
    }
  } else {
    clearInterval(timerInterval);
    showResult(score, questions.length);
  }
}

function finishFullCBT() {
  clearInterval(timerInterval);
  showResult(finalScore, totalQuestions);
}

function showResult(score, total) {
  
  let percent = Math.round((score / total) * 100);
  let grade =
    percent >= 70 ? "A" :
    percent >= 60 ? "B" :
    percent >= 50 ? "C" :
    percent >= 45 ? "D" : "F";
  
  document.getElementById("exam").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");
  
  document.getElementById("result").innerHTML = `
    <h2>Exam Completed</h2>
    <p>Score: ${score}/${total}</p>
    <p>Percentage: ${percent}%</p>
    <h3>Grade: ${grade}</h3>
    <button onclick="goHome()">Back Home</button>
  `;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let h = Math.floor(timeLeft / 3600);
    let m = Math.floor((timeLeft % 3600) / 60);
    let s = timeLeft % 60;
    
    document.getElementById("timer").innerText =
      h.toString().padStart(2, '0') + ":" +
      m.toString().padStart(2, '0') + ":" +
      s.toString().padStart(2, '0');
    
    timeLeft--;
    
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      isCBT ? finishFullCBT() : finishExam();
    }
  }, 1000);
}

function showAbout() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("about").classList.remove("hidden");
}

function goHome() {
  location.reload();
}