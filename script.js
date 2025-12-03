// 題目資料（從 constants.ts 改成純 JS）
const QUESTIONS = [
  {
    id: 1,
    question: "請問你所在的攤位名稱?",
    options: [
      { id: "A", text: "臺中市政府" },
      { id: "B", text: "勞動部勞動力發展署中彰投分署" },
      { id: "C", text: "健保署" }
    ],
    correctAnswerId: "B"
  },
  {
    id: 2,
    question: "請問中彰投分署提供以下哪些資源?",
    options: [
      { id: "A", text: "就業諮詢與輔導" },
      { id: "B", text: "職業訓練與進修" },
      { id: "C", text: "獎勵補助與津貼" },
      { id: "D", text: "以上皆是" }
    ],
    correctAnswerId: "D"
  },
  {
    id: 3,
    question: "請問以下哪一個為勞動部的整合線上線下資源的網站?",
    options: [
      { id: "A", text: "台灣就業通" },
      { id: "B", text: "104人力銀行" },
      { id: "C", text: "1111人力銀行" }
    ],
    correctAnswerId: "A"
  },
  {
    id: 4,
    question: "請問中彰投分署-青年職涯發展中心服務的對象年齡?",
    options: [
      { id: "A", text: "65歲以上" },
      { id: "B", text: "14歲以下" },
      { id: "C", text: "15-29歲青年" }
    ],
    correctAnswerId: "C"
  },
  {
    id: 5,
    question: "請問以下哪一個不是中彰投分署-青年職涯發展中心提供之服務?",
    options: [
      { id: "A", text: "一對一職涯諮詢" },
      { id: "B", text: "客製化履歷健診" },
      { id: "C", text: "企業參訪體驗" },
      { id: "D", text: "DIY手作工坊" }
    ],
    correctAnswerId: "D"
  }
];

const PASSING_SCORE = 60;
const POINTS_PER_QUESTION = 20;

let currentQuestionIndex = 0;
let score = 0;
let isAnswering = false;
let userAnswers = []; // ✨ 狀態修正：儲存每題答案的陣列

function $(id) {
  return document.getElementById(id);
}

function showSection(section) {
  const welcome = $("welcome-section");
  const quiz = $("quiz-section");
  const result = $("result-section");

  welcome.classList.add("hidden");
  quiz.classList.add("hidden");
  result.classList.add("hidden");

  if (section === "welcome") welcome.classList.remove("hidden");
  if (section === "quiz") quiz.classList.remove("hidden");
  if (section === "result") result.classList.remove("hidden");
}

function resetQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  isAnswering = false;
  userAnswers = []; // ✨ 重置：清空答案紀錄

  const scoreEl = $("score-value");
  scoreEl.textContent = "0";
  scoreEl.classList.remove("text-comic-red");
  scoreEl.classList.add("text-gray-700");

  $("result-pass").classList.add("hidden");
  $("result-fail").classList.add("hidden");
}

function updateProgress() {
  const progressInner = $("progress-inner");
  const progressLabel = $("progress-label");
  const questionNumber = $("question-number");

  const total = QUESTIONS.length;
  const current = currentQuestionIndex + 1;
  const percent = (current / total) * 100;

  progressInner.style.width = percent + "%";
  progressLabel.textContent = `Q${current} / ${total}`;
  questionNumber.textContent = String(current);
}

function renderQuestion() {
  const questionData = QUESTIONS[currentQuestionIndex];
  if (!questionData) return;

  updateProgress();

  const titleEl = $("question-title");
  const optionsContainer = $("options-container");
  
  const prevButton = $("prev-btn"); 
  const nextButton = $("next-btn-main"); 

  titleEl.textContent = questionData.question;
  optionsContainer.innerHTML = "";
  isAnswering = false;

  const savedAnswerId = userAnswers[currentQuestionIndex]; // 取得該題儲存的答案

  // ✨ 控制導航按鈕顯示
  // 上一題按鈕：只有在非第一頁時顯示
  if (prevButton) {
      prevButton.style.display = currentQuestionIndex === 0 ? 'none' : 'block';
  }
  
  // 下一題按鈕：只要有回答，且不是最後一題，就顯示
  if (nextButton) {
      // 如果已回答，或還沒到最後一題，就顯示按鈕讓使用者可以推進 (即使沒回答)
      // 這裡採用寬鬆規則：只要不是最後一題，就顯示下一題按鈕
      nextButton.style.display = (currentQuestionIndex < QUESTIONS.length - 1) ? 'block' : 'none';
      
      // 如果是最後一題，則上一題按鈕需單獨佔滿寬度
      if (currentQuestionIndex === QUESTIONS.length - 1 && prevButton.style.display === 'block') {
          prevButton.classList.remove('w-full');
          prevButton.classList.add('w-1/2');
      } else if (currentQuestionIndex === QUESTIONS.length - 1 && prevButton.style.display === 'none') {
          // 如果是最後一題，且 prevButton 隱藏，則無需按鈕
      }

      // 如果是最後一題，將按鈕文字改為 "送出/完成"
      if (currentQuestionIndex === QUESTIONS.length - 1) {
          nextButton.textContent = '完成測驗！'; // 這裡採用單獨推進按鈕來送出結果
          nextButton.style.display = 'block';
          if (prevButton.style.display === 'block') {
              nextButton.classList.remove('w-full');
              nextButton.classList.add('w-1/2');
          } else {
              nextButton.classList.remove('w-1/2');
              nextButton.classList.add('w-full');
          }

      } else {
          nextButton.textContent = '下一題';
          if (prevButton.style.display === 'block') {
              nextButton.classList.remove('w-full');
              nextButton.classList.add('w-1/2');
          } else {
              nextButton.classList.remove('w-1/2');
              nextButton.classList.add('w-full');
          }
      }
  }


  questionData.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    
    // 基礎樣式
    let btnClasses = "transform transition-transform active:scale-95 font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg py-3 px-4 text-lg mb-1 w-full flex items-center text-left";
    
    // 判斷是否為儲存的答案，給予不同的樣式
    if (option.id === savedAnswerId) {
        btnClasses += " bg-comic-yellow"; // ✨ 已選中樣式
    } else {
        btnClasses += " bg-white hover:bg-gray-100"; // 預設樣式
    }
    
    btn.className = btnClasses;
    
    btn.innerHTML = `
      <span class="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm flex-shrink-0">
        ${option.id}
      </span>
      <span class="text-lg">${option.text}</span>
    `;

    btn.addEventListener("click", () => {
      handleOptionClick(option.id, btn);
    });

    optionsContainer.appendChild(btn);
  });
}

// ✨ 修改選項點擊邏輯，只負責儲存答案和視覺回饋
function handleOptionClick(optionId, btn) {
  // 1. 儲存當前答案
  userAnswers[currentQuestionIndex] = optionId;

  // 2. 移除所有選項的高亮，並高亮當前選項
  const optionsContainer = $("options-container");
  Array.from(optionsContainer.children).forEach(childBtn => {
      childBtn.classList.remove("bg-comic-yellow");
      childBtn.classList.add("bg-white", "hover:bg-gray-100");
  });

  btn.classList.remove("bg-white", "hover:bg-gray-100");
  btn.classList.add("bg-comic-yellow");
  
  // 3. 確保下一題按鈕在已選擇時顯示 (邏輯已在 renderQuestion 中處理)
}

function showResult() {
  showSection("result");

  // ✨ 重新計算總分 (當結果頁顯示時才計算最終分數)
  let finalScore = 0;
  QUESTIONS.forEach((q, index) => {
      const selectedAnswerId = userAnswers[index];
      // 確保答案有被選，且選擇的答案是正確答案
      if (selectedAnswerId && selectedAnswerId === q.correctAnswerId) {
          finalScore += POINTS_PER_QUESTION;
      }
  });
  score = finalScore; // 更新全域分數變數

  const scoreEl = $("score-value");
  scoreEl.textContent = String(score);

  const passEl = $("result-pass");
  const failEl = $("result-fail");

  const isPassed = score >= PASSING_SCORE;

  if (isPassed) {
    scoreEl.classList.remove("text-gray-700");
    scoreEl.classList.add("text-comic-red");
    passEl.classList.remove("hidden");
    failEl.classList.add("hidden");
  } else {
    scoreEl.classList.remove("text-comic-red");
    scoreEl.classList.add("text-gray-700");
    passEl.classList.add("hidden");
    failEl.classList.remove("hidden");
  }
}

// ✨ 新增導航邏輯
function navigateQuestion(direction) {
    // 判斷是否為最後一題且要進入結果
    if (direction === 1 && currentQuestionIndex === QUESTIONS.length - 1) {
        showResult();
        return;
    }
    
    // 計算新索引
    const newIndex = currentQuestionIndex + direction;
    
    if (newIndex >= 0 && newIndex < QUESTIONS.length) {
        currentQuestionIndex = newIndex;
        renderQuestion();
    }
}


document.addEventListener("DOMContentLoaded", () => {
  // 初始顯示歡迎畫面
  showSection("welcome");

  const startBtn = $("start-btn");
  const restartBtn = $("restart-btn-main");
  const prevBtn = $("prev-btn");       // ✨ 取得上一題按鈕
  const nextBtnMain = $("next-btn-main"); // ✨ 取得下一題按鈕

  startBtn.addEventListener("click", () => {
    resetQuiz();
    showSection("quiz");
    renderQuestion();
  });

  restartBtn.addEventListener("click", () => {
    resetQuiz();
    showSection("quiz");
    renderQuestion();
  });

  // ✨ 上一題按鈕點擊事件
  if (prevBtn) {
      prevBtn.addEventListener('click', () => {
          navigateQuestion(-1); // -1: 回上一題
      });
  }
  
  // ✨ 下一題按鈕點擊事件
  if (nextBtnMain) {
      nextBtnMain.addEventListener('click', () => {
          navigateQuestion(1); // 1: 到下一題或送出
      });
  }
});