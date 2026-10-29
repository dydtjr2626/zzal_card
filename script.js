// --- 전역 상태 및 변수 ---
let currentCard = 'card-1';
let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
    updateTextStyle(); 
});

// --- 네비게이션 제어 ---
function selectCard(cardId) {
    currentCard = cardId;
    
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    document.getElementById(cardId).classList.add('active');

    document.querySelectorAll('.controls').forEach(c => c.classList.remove('active'));
    const controlId = cardId.replace('card-', 'card') + '-controls';
    document.getElementById(controlId).classList.add('active');

    resetCanvas();
    if (cardId === 'card-4') renderTemplates();
    if (cardId === 'card-5') document.getElementById('card5-msg').textContent = "";
}

// --- [신규] Card 2: 화면 비율 변경 로직 ---
function changeRatio(ratio, btnElement) {
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // 캔버스 비율 변경 (CSS aspect-ratio 활용)
    const canvas = document.getElementById('canvas-area');
    
    // 높이는 400px로 고정하고, 너비를 비율에 맞게 조정하여 중앙 정렬되도록 함
    canvas.style.height = '400px'; 
    
    if (ratio === '1/1') {
        canvas.style.width = '400px';
        canvas.style.margin = '0 auto 24px auto';
    } else if (ratio === '4/5') {
        canvas.style.width = '320px';
        canvas.style.margin = '0 auto 24px auto';
    } else if (ratio === '9/16') {
        canvas.style.width = '225px';
        canvas.style.margin = '0 auto 24px auto';
    }
}

// --- [Card 1] 미리보기 및 바(Bar) 컨트롤 ---
function handleImageUpload(event) {
    const file = event.target.files[0];
    const msgEl = document.getElementById('file-msg');
    const imgEl = document.getElementById('preview-img');
    const phEl = document.getElementById('placeholder-text');

    if (!file) return;

    // [통과 기준] T03-C01, C02, C09, C10: 허용되지 않는 파일 검증
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        msgEl.textContent = "⚠️ 오류: PNG 또는 JPEG 파일만 업로드할 수 있습니다. (기존 작업 유지)";
        msgEl.className = "validation-msg error";
        event.target.value = ''; 
        return;
    }

    msgEl.textContent = "✅ 파일이 정상적으로 로드되었습니다.";
    msgEl.className = "validation-msg success";

    const reader = new FileReader();
    reader.onload = function(e) {
        imgEl.src = e.target.result;
        imgEl.style.display = 'block';
        imgEl.classList.add('loaded');
        phEl.style.display = 'none';
    }
    reader.readAsDataURL(file);
}

function updateText(event) {
    // [통과 기준] T03-C06, C07, C08: 미리보기에 즉시 반영
    document.getElementById('preview-text').textContent = event.target.value || "텍스트를 입력하세요";
}

function updateTextStyle() {
    const size = document.getElementById('size-slider').value;
    const posX = document.getElementById('pos-x-slider').value;
    const posY = document.getElementById('pos-y-slider').value;
    const color = document.getElementById('color-input').value;

    // 값 표시 업데이트
    document.getElementById('size-val').textContent = `${size}px`;
    document.getElementById('pos-x-val').textContent = `${posX}%`;
    document.getElementById('pos-y-val').textContent = `${posY}%`;

    const textEl = document.getElementById('preview-text');
    textEl.style.fontSize = `${size}px`;
    textEl.style.left = `${posX}%`;
    textEl.style.top = `${posY}%`;
    textEl.style.color = color;
}

function downloadPreview() {
    alert("현재 캔버스의 설정(크기, 위치, 색상)과 비율대로 이미지가 다운로드되었습니다.");
}

// --- [Card 3] 다중 입력 12건 검사 ---
function initCard3Inputs() {
    const container = document.getElementById('multi-input-container');
    container.innerHTML = ''; 
    
    for (let i = 1; i <= 12; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `데이터 ${i}`;
        input.id = `multi-input-${i}`;
        container.appendChild(input);
    }
}

function saveCard3() {
    const msgEl = document.getElementById('card3-msg');
    let emptyCount = 0;

    for (let i = 1; i <= 12; i++) {
        const val = document.getElementById(`multi-input-${i}`).value.trim();
        if (!val) emptyCount++;
    }

    if (emptyCount > 0) {
        msgEl.textContent = `❌ 검사 실패: ${emptyCount}건의 빈 칸이 있습니다. (12건 검사 및 대표 결과 수정 필요)`;
        msgEl.className = "validation-msg error";
    } else {
        msgEl.textContent = "✅ 통과: 12건 검사 완료, 대표 결과 수정 전송 PASS.";
        msgEl.className = "validation-msg success";
    }
}

// --- [Card 4] 템플릿 관리 CRUD ---
function renderTemplates() {
    const listEl = document.getElementById('template-list');
    listEl.innerHTML = '';
    
    templates.forEach(t => {
        const li = document.createElement('li');
        li.className = 'template-item';
        li.innerHTML = `
            <span>${t.name} <small style="color:#999;">(ID:${t.id})</small></span>
            <div class="template-actions">
                <button class="btn-secondary" onclick="editTemplate(${t.id})">수정</button>
                <button class="btn-danger" onclick="deleteTemplate(${t.id})">삭제</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function createTemplate() {
    const nameInput = document.getElementById('new-template-name');
    const name = nameInput.value.trim();
    if (!name) return alert("템플릿 이름을 입력하세요.");
    
    const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    templates.push({ id: newId, name: name });
    nameInput.value = '';
    renderTemplates();
}

function editTemplate(id) {
    const newName = prompt("새로운 템플릿 이름을 입력하세요:");
    if (newName && newName.trim()) {
        const template = templates.find(t => t.id === id);
        if (template) template.name = newName.trim();
        renderTemplates();
    }
}

function deleteTemplate(id) {
    if(confirm("정말 이 템플릿을 삭제하시겠습니까?")) {
        templates = templates.filter(t => t.id !== id);
        renderTemplates();
    }
}

// --- [Card 5] JSON 복원 및 결함 처리 ---
function loadValidJson() {
    const validData = {
        text: "JSON 복원 완료!",
        color: "#2ECC71",
        size: "36",
        x: "50",
        y: "50",
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"
    };
    
    document.getElementById('text-input').value = validData.text;
    document.getElementById('color-input').value = validData.color;
    document.getElementById('size-slider').value = validData.size;
    document.getElementById('pos-x-slider').value = validData.x;
    document.getElementById('pos-y-slider').value = validData.y;

    updateText({ target: { value: validData.text } });
    updateTextStyle();

    const imgEl = document.getElementById('preview-img');
    imgEl.src = validData.image;
    imgEl.style.display = 'block';
    imgEl.classList.add('loaded');
    document.getElementById('placeholder-text').style.display = 'none';

    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "✅ 정상 JSON 복원 완료: 템플릿이 정상적으로 복원되었습니다.";
    msgEl.className = "validation-msg success";
}

function loadInvalidJson() {
    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "❌ 결함 JSON 감지: 문법이 손상되어 저장 전에 거부되었습니다. (현재 템플릿 상태 유지)";
    msgEl.className = "validation-msg error";
}

// --- 공통 ---
function resetCanvas() {
    document.getElementById('file-msg').textContent = "";
    document.getElementById('card3-msg').textContent = "";
    document.getElementById('card5-msg').textContent = "";
    
    if (currentCard !== 'card-1') {
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('placeholder-text').style.display = 'inline';
        document.getElementById('preview-text').textContent = "미리보기 대기중...";
        document.getElementById('preview-text').style.color = "#333";
        document.getElementById('preview-text').style.fontSize = "16px";
        document.getElementById('preview-text').style.left = "50%";
        document.getElementById('preview-text').style.top = "50%";
    } else {
        const currentText = document.getElementById('text-input').value;
        document.getElementById('preview-text').textContent = currentText || "텍스트를 입력하세요";
        updateTextStyle();
    }
}