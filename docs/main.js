let currentQuestionIndex = 0;
let questions = [];
let userScores = {
  "強化系": 0,
  "変化系": 0,
  "具現化系": 0,
  "放出系": 0,
  "操作系": 0,
  "特質系": 0
};

// 質問を読み込む
async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    const data = await res.json();
    questions = data;
    showQuestion();
  } catch (err) {
    console.error("質問の読み込みに失敗しました", err);
  }
}

// 質問を表示する
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    localStorage.setItem("userScores", JSON.stringify(userScores));
    window.location.href = "result.html";
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById("question").textContent = q.text;
  document.getElementById("current-question").textContent = currentQuestionIndex + 1;
  document.getElementById("total-questions").textContent = questions.length;
}

// 回答処理
function answer(isYes) {
  const q = questions[currentQuestionIndex];
  if (isYes) {
    for (const system in q.points) {
      if (userScores.hasOwnProperty(system)) {
        userScores[system] += q.points[system];
      }
    }
  }
  currentQuestionIndex++;
  showQuestion();
}

// イベントリスナーの設定
window.onload = async () => {
  if (window.location.pathname.includes("result.html")) {
    await loadCharacters();
    showResult();
  } else {
    if (document.getElementById("yesBtn") && document.getElementById("noBtn")) {
      document.getElementById("yesBtn").addEventListener("click", () => answer(true));
      document.getElementById("noBtn").addEventListener("click", () => answer(false));
      loadQuestions();
    }
  }
};

// キャラクター読み込み
async function loadCharacters() {
  const res = await fetch("characters.json");
  characters = await res.json();
}

// 結果表示処理
function showResult() {
  const scores = JSON.parse(localStorage.getItem("userScores"));
  if (!scores) {
    document.getElementById("result-system").textContent = "診断データがありません";
    return;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0][0];

  const matching = characters.filter(c => c.系統 === topType);
  const char = matching[Math.floor(Math.random() * matching.length)];

  document.getElementById("result-system").textContent = `${char.name}（${topType}）`;

  const imagePath = `assets/${char.name.replace(/=/g, "_")}.png`;
  document.getElementById("character-image").innerHTML = `<img src="${imagePath}" alt="${char.name}" class="character-image" />`;

  document.getElementById("system-description").innerHTML = `
    <p>${char.traits}</p>
    <p>${char.note}</p>
    <p><strong>能力：</strong>${char.ability}</p>
  `;
}
