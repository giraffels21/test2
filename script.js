// 遊戲狀態管理
const gameState = {
    currentGrade: null,
    currentScene: null,
    score: 0,
    foundEggs: new Set(),
    badges: new Set(),
    words: {
        '1-2': [
            { english: 'balloon', chinese: '氣球' },
            { english: 'swing', chinese: '鞦韆' },
            { english: 'flower', chinese: '花' },
            { english: 'tree', chinese: '樹' },
            { english: 'bird', chinese: '鳥' }
        ],
        '3-4': [
            { english: 'celebration', chinese: '慶祝' },
            { english: 'tradition', chinese: '傳統' },
            { english: 'festival', chinese: '節日' },
            { english: 'memory', chinese: '記憶' },
            { english: 'culture', chinese: '文化' }
        ],
        '5-6': [
            { english: 'inheritance', chinese: '傳承' },
            { english: 'ceremony', chinese: '儀式' },
            { english: 'custom', chinese: '習俗' },
            { english: 'heritage', chinese: '遺產' },
            { english: 'wisdom', chinese: '智慧' }
        ]
    }
};

// 場景配置
const scenes = {
    park: {
        title: '兒童節公園',
        background: 'linear-gradient(135deg, #FFB6C1, #98FB98)',
        eggs: [
            { x: 20, y: 30 },
            { x: 60, y: 40 },
            { x: 80, y: 20 },
            { x: 40, y: 70 }
        ]
    },
    nature: {
        title: '清明自然場景',
        background: 'linear-gradient(135deg, #98FB98, #87CEEB)',
        eggs: [
            { x: 30, y: 20 },
            { x: 70, y: 50 },
            { x: 50, y: 80 },
            { x: 20, y: 60 }
        ]
    },
    museum: {
        title: '文化展覽館',
        background: 'linear-gradient(135deg, #87CEEB, #DDA0DD)',
        eggs: [
            { x: 25, y: 40 },
            { x: 75, y: 30 },
            { x: 60, y: 70 },
            { x: 40, y: 60 }
        ]
    }
};

// 初始化遊戲
function initGame() {
    loadProgress();
    setupEventListeners();
    updateUI();
}

// 加載進度
function loadProgress() {
    const savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        gameState.score = progress.score || 0;
        gameState.foundEggs = new Set(progress.foundEggs || []);
        gameState.badges = new Set(progress.badges || []);
    }
}

// 保存進度
function saveProgress() {
    const progress = {
        score: gameState.score,
        foundEggs: Array.from(gameState.foundEggs),
        badges: Array.from(gameState.badges)
    };
    localStorage.setItem('gameProgress', JSON.stringify(progress));
}

// 設置事件監聽器
function setupEventListeners() {
    // 年級選擇
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.addEventListener('click', () => selectGrade(btn.dataset.grade));
    });

    // 場景選擇
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', () => selectScene(btn.dataset.scene));
    });

    // 返回按鈕
    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('game-scene').classList.add('hidden');
        document.getElementById('scene-select').classList.remove('hidden');
    });

    // 彩蛋彈窗
    document.getElementById('close-popup').addEventListener('click', () => {
        document.getElementById('egg-popup').classList.add('hidden');
    });

    // 語音按鈕
    document.getElementById('speak-btn').addEventListener('click', speakWord);

    // 小遊戲按鈕
    document.getElementById('word-jump-btn').addEventListener('click', () => {
        const word = document.getElementById('word-english').textContent;
        document.getElementById('egg-popup').classList.add('hidden');
        document.getElementById('mini-game').classList.remove('hidden');
        document.getElementById('game-title').textContent = 'Word Jump遊戲';
        initMiniGame('word-jump', document.getElementById('game-container'), word);
    });

    document.getElementById('memory-match-btn').addEventListener('click', () => {
        const words = gameState.words[gameState.currentGrade];
        document.getElementById('egg-popup').classList.add('hidden');
        document.getElementById('mini-game').classList.remove('hidden');
        document.getElementById('game-title').textContent = 'Memory Match遊戲';
        initMiniGame('memory-match', document.getElementById('game-container'), words);
    });

    // 返回場景按鈕
    document.getElementById('back-to-scene').addEventListener('click', () => {
        document.getElementById('mini-game').classList.add('hidden');
    });
}

// 選擇年級
function selectGrade(grade) {
    gameState.currentGrade = grade;
    document.getElementById('grade-select').classList.add('hidden');
    document.getElementById('scene-select').classList.remove('hidden');
}

// 選擇場景
function selectScene(scene) {
    gameState.currentScene = scene;
    const sceneConfig = scenes[scene];
    document.getElementById('scene-title').textContent = sceneConfig.title;
    document.getElementById('scene-container').style.background = sceneConfig.background;
    document.getElementById('scene-select').classList.add('hidden');
    document.getElementById('game-scene').classList.remove('hidden');
    createEggs(sceneConfig.eggs);
}

// 創建彩蛋
function createEggs(eggPositions) {
    const container = document.getElementById('scene-container');
    container.innerHTML = '';
    
    eggPositions.forEach((pos, index) => {
        const egg = document.createElement('div');
        egg.className = 'egg';
        egg.style.left = `${pos.x}%`;
        egg.style.top = `${pos.y}%`;
        egg.dataset.index = index;
        
        egg.addEventListener('click', () => showEggContent(index));
        container.appendChild(egg);
    });
}

// 顯示彩蛋內容
function showEggContent(index) {
    const eggKey = `${gameState.currentScene}-${index}`;
    if (gameState.foundEggs.has(eggKey)) return;

    const words = gameState.words[gameState.currentGrade];
    const word = words[index % words.length];
    
    document.getElementById('word-english').textContent = word.english;
    document.getElementById('word-chinese').textContent = word.chinese;
    document.getElementById('egg-popup').classList.remove('hidden');
    
    gameState.foundEggs.add(eggKey);
    gameState.score += 10;
    updateUI();
    saveProgress();
}

// 語音朗讀
function speakWord() {
    const word = document.getElementById('word-english').textContent;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// 更新UI
function updateUI() {
    // 更新進度條
    const progress = (gameState.foundEggs.size / 12) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `進度: ${Math.round(progress)}%`;
    
    // 更新分數
    document.getElementById('score').textContent = gameState.score;
    
    // 更新徽章
    updateBadges();
}

// 更新徽章
function updateBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        const badgeType = badge.dataset.badge;
        if (gameState.badges.has(badgeType)) {
            badge.classList.add('earned');
        } else {
            badge.classList.remove('earned');
        }
    });
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', initGame); 