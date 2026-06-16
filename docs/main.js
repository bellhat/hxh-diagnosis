let currentQuestionIndex = 0;
let questions = [];
let characters = [];  // ✅ キャラクター配列を初期化
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
    // 結果ページの場合
    await loadCharacters();  // ✅ キャラクター読み込み完了を待つ
    console.log("✓ showResult実行");
    showResult();  // characters配列が確実に読み込まれた後に実行
  } else {
    // 診断ページの場合
    if (document.getElementById("yesBtn") && document.getElementById("noBtn")) {
      document.getElementById("yesBtn").addEventListener("click", () => answer(true));
      document.getElementById("noBtn").addEventListener("click", () => answer(false));
      loadQuestions();
    }
  }
};

// キャラクター読み込み
async function loadCharacters() {
  try {
    const res = await fetch("characters.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    characters = await res.json();
    console.log(`✓ ${characters.length} キャラクター読み込み完了`);
  } catch (err) {
    console.error("キャラクターの読み込みに失敗しました", err);
  }
}

// シンボル表示用マッピング
const symbolEmojis = {
  "fist": "✊",
  "fire": "🔥",
  "star": "★",
  "boom": "💥",
  "zap": "⚡",
  "wave": "〜",
  "cycle": "◉",
  "wind": "💨",
  "target": "◯",
  "cube": "▢",
  "chain": "🔗",
  "lock": "🔒",
  "circle": "●",
  "sun": "☀",
  "arrow-up": "↑",
  "bolt": "⚔",
  "network": "⊕",
  "arrow-right": "→",
  "crown": "👑",
  "control": "◆",
  "eye": "◉",
  "star-crown": "♛",
  "infinity": "∞",
  "gem": "◇"
};

// 結果表示処理
function showResult() {
  const scores = JSON.parse(localStorage.getItem("userScores"));
  if (!scores) {
    document.getElementById("result-system").textContent = "診断データがありません";
    return;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0][0];

  // ✅ キャラクターが正しく読み込まれたか確認
  if (!characters || characters.length === 0) {
    console.error("エラー: キャラクターデータが読み込まれていません");
    document.getElementById("result-system").textContent = "データ読み込みエラー";
    return;
  }

  const matching = characters.filter(c => c.系統 === topType);
  if (matching.length === 0) {
    console.error(`エラー: ${topType}のキャラクターが見つかりません`);
    return;
  }

  const char = matching[Math.floor(Math.random() * matching.length)];

  console.log(`✓ 診断結果: ${char.name} (${topType})`);
  console.log(`  - iconSymbol: ${char.iconSymbol}`);
  console.log(`  - iconColor: ${char.iconColor}`);

  document.getElementById("result-system").textContent = `${char.name}（${topType}）`;

  // 画像ファイルの存在確認 → CSSアイコン代替ロジック
  const imagePath = `assets/${char.name.replace(/=/g, "_")}.png`;
  const imageContainer = document.getElementById("character-image");

  // ✅ CSSアイコン表示用のシステムカラーマッピング
  const systemColorMap = {
    "強化系": "icon-kouka",
    "変化系": "icon-henka",
    "具現化系": "icon-gugenka",
    "放出系": "icon-houshutsu",
    "操作系": "icon-sosa",
    "特質系": "icon-tokushitsu"
  };

  const symbolEmoji = symbolEmojis[char.iconSymbol] || "◯";
  const colorClass = systemColorMap[topType];

  // 画像表示を試みるが、失敗時はCSSアイコンを表示
  const img = new Image();
  img.onload = () => {
    imageContainer.innerHTML = `<img src="${imagePath}" alt="${char.name}" class="character-image" />`;
    console.log(`✓ 画像ファイル表示: ${imagePath}`);
  };
  img.onerror = () => {
    // 画像読み込み失敗時 → CSSアイコン表示
    console.log(`✓ CSSアイコン表示: ${symbolEmoji} ${colorClass}`);
    imageContainer.innerHTML = `
      <div class="character-icon ${colorClass}" role="img" aria-label="${char.name}（${topType}）">
        ${symbolEmoji}
      </div>
      <p class="icon-fallback-notice">※イメージカラーとシンボルで表示しています</p>
    `;
  };
  img.src = imagePath;

  document.getElementById("system-description").innerHTML = `
    <p>${char.traits}</p>
    <p>${char.note}</p>
    <p><strong>能力：</strong>${char.ability}</p>
  `;
}
