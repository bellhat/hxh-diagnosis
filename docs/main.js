let currentQuestionIndex = 0;
let userScores = {
  "強化系": 0,
  "変化系": 0,
  "具現化系": 0,
  "放出系": 0,
  "操作系": 0,
  "特質系": 0
};

let questions = [];
let characters = [];

async function loadQuestions() {
  try {
    const res = await fetch("../questions.json");
    questions = await res.json();
    if (Array.isArray(questions)) {
      showQuestion();
    } else {
      console.error('質問データの形式が不正です');
    }
  } catch (error) {
    console.error('質問データの読み込みに失敗しました:', error);
  }
}

async function loadCharacters() {
  try {
    const res = await fetch("../characters.json");
    characters = await res.json();
  } catch (error) {
    console.error('キャラクターデータの読み込みに失敗しました:', error);
  }
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    localStorage.setItem("userScores", JSON.stringify(userScores));
    window.location.href = "result.html";
    return;
  }

  // 質問カウンターを更新
  document.getElementById("current-question").textContent = currentQuestionIndex + 1;
  document.getElementById("total-questions").textContent = questions.length;

  const q = questions[currentQuestionIndex];
  if (q && q.text) {
    document.getElementById("question").textContent = q.text;
  } else {
    console.error('質問データの形式が不正です:', q);
  }
}

function answerQuestion(isYes) {
  const q = questions[currentQuestionIndex];
  if (isYes) {
    for (const 系統 in q.points) {
      userScores[系統] += q.points[系統];
    }
  }
  currentQuestionIndex++;
  showQuestion();
}

// ページ読み込み時に質問を表示
window.onload = async () => {
  const path = window.location.pathname;
  
  if (path.endsWith('quiz.html')) {
    // 質問ページの場合
    await loadQuestions();
    await loadCharacters();
    document.getElementById("yesBtn").addEventListener("click", () => answerQuestion(true));
    document.getElementById("noBtn").addEventListener("click", () => answerQuestion(false));
  } else if (path.endsWith('result.html')) {
    // 結果ページの場合
    await loadCharacters();
    showResult();
  }
};

// 結果ページの表示
function showResult() {
  // スコアデータを取得
  const scores = JSON.parse(localStorage.getItem("userScores"));

  if (!scores) {
    document.getElementById("result-system").textContent = "診断データがありません";
    return;
  }

  // スコアの中で最大の系統を取得
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0][0]; // 最もスコアの高い系統

  // 同じ系統のキャラクターを取得
  const matchingCharacter = characters.find(char => char.系統 === topType);
  
  if (matchingCharacter) {
    // 表示処理
    document.getElementById("result-system").textContent = `${matchingCharacter.name}（${topType}）`;
    
    // 画像を表示
    const imageDiv = document.getElementById("character-image");
    imageDiv.innerHTML = `<img src="../assets/${matchingCharacter.name.replace(/=/g, '_')}.png" alt="${matchingCharacter.name}" class="character-image">`;
    
    document.getElementById("system-description").innerHTML = `
      <p>${matchingCharacter.traits}</p>
      <p>${matchingCharacter.note}</p>
      <p>能力：${matchingCharacter.ability}</p>
    `;
  } else {
    // キャラクターが見つからない場合でも基本情報は表示
    document.getElementById("result-system").textContent = `（${topType}）`;
    document.getElementById("system-description").innerHTML = `
      <p>あなたの系統は${topType}です。</p>
      <p>キャラクター情報が見つかりませんでした。</p>
    `;
  }
}

// 各系統の簡易説明（必要に応じて変更可）
function describeType(type) {
  const map = {
    "強化系": "単純で一途な行動派。まっすぐな力にこそ魅力あり。",
    "変化系": "気まぐれで柔軟、反応力の高いクリエイター肌。",
    "具現化系": "自分の世界観を現実にする、妄想力の塊。",
    "放出系": "エネルギッシュで情熱的、勢いと火力の使い手。",
    "操作系": "状況と人を見極めて最適に操る、戦略家タイプ。",
    "特質系": "理解不能で説明不能、唯一無二のアウトサイダー。"
  };
  return map[type] || "未知の系統";
}