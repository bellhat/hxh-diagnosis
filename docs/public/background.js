// オーラ背景アニメーション
function createAuraParticles() {
  const auraBackground = document.querySelector('.aura-background');
  
  // 30個のオーラパーティクルを作成
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'aura-particle';
    
    // ランダムな位置に配置
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    
    // ランダムなサイズ
    const size = Math.random() * 5 + 5; // 5-10px
    particle.style.width = particle.style.height = size + 'px';
    
    // ランダムなアニメーション時間
    particle.style.animationDuration = Math.random() * 5 + 5 + 's';
    
    auraBackground.appendChild(particle);
  }
}

// ページ読み込み時にアニメーションを開始
window.onload = () => {
  createAuraParticles();
};
