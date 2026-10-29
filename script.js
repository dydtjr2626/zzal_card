let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
});

// ==========================================
// [Card 1, 2] 에디터 및 이미지 제어
// ==========================================
function changeRatio(ratio, btn) {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const canvas = document.getElementById('canvas-area');
    
    // 캔버스 비율 변경 (이미지는 CSS object-fit: cover 에 의해 자동으로 잘림)
    if (ratio === '1/1') canvas.style.width = '450px';
    else if (ratio === '4/5') canvas.style.width = '360px';
    else if (ratio === '9/16') canvas.style.width = '253px';
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const msgEl = document.getElementById('file-msg');
    const imgEl = document.getElementById('preview-img');
    const phEl = document.getElementById('placeholder-text');
    const textEl = document.getElementById('preview-text');

    if (!file) return;

    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        msgEl.textContent = "⚠️ 오류: PNG/JPEG만 가능합니다. (기존 작업 유지됨)";
        msgEl.className = "validation-msg error";
        event.target.value = ''; 
        return;
    }

    msgEl.textContent = "✅ 이미지가 정상적으로 로드되었습니다.";
    msgEl.className = "validation-msg success";

    const reader = new FileReader();
    reader.onload = function(e) {
        imgEl.src = e.target.result;
        imgEl.style.display = 'block';
        imgEl.classList.add('loaded');
        
        // 새 이미지 로드 시 줌 슬라이더 및 이미지 크기 초기화
        document.getElementById('zoom-slider').value = 100;
        imgEl.style.transform = 'scale(1)';
        document.getElementById('zoom-val').textContent = '100%';

        phEl.style.display = 'none';
        textEl.classList.add('show'); 
        
        const currentText = document.getElementById('text-input').value;
        textEl.textContent = currentText || "텍스트를 입력하세요";
    }
    reader.readAsDataURL(file);
}

// [추가] 이미지 확대/축소 (Zoom) 제어 함수
function updateImageZoom() {
    const zoomVal = document.getElementById('zoom-slider').value;
    const imgEl = document.getElementById('preview-img');
    
    document.getElementById('zoom-val').textContent = `${zoomVal}%`;
    // CSS transform의 scale을 이용해 이미지만 확대/축소 (중앙 기준)
    imgEl.style.transform = `scale(${zoomVal / 100})`;
}

function updateText(event) {
    const textEl = document.getElementById('preview-text');
    if (event.target.value.trim() !== "") {
        textEl.classList.add('show');
        textEl.textContent = event.target.value;
    } else {
        textEl.textContent = "텍스트를 입력하세요";
    }
}

function updateTextStyle() {
    const size = document.getElementById('size-slider').value;
    const posX = document.getElementById('pos-x-slider').value;
    const posY = document.getElementById('pos-y-slider').value;
    const color = document.getElementById('color-input').value;

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
    alert("현재 화면 비율, 사진 줌 상태, 텍스트 스타일 그대로 파일이 다운로드됩니다.");
}


// ==========================================
// [Card 3] 다중 입력 12건 검사
// ==========================================
function initCard3Inputs() {
    const container = document.getElementById('multi-input-container');
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
        if (!document.getElementById(`multi-input-${i}`).value.trim()) emptyCount++;
    }

    if (emptyCount > 0) {
        msgEl.textContent = `❌ 검사 실패: ${emptyCount}건의 빈 칸이 있습니다.`;
        msgEl.className = "validation-msg error";
    } else {
        msgEl.textContent = "✅ 통과: 12건 검사 완료. 데이터가 보존되었습니다.";
        msgEl.className = "validation-msg success";
    }
}


// ==========================================
// [Card 4] 템플릿 CRUD
// ==========================================
function renderTemplates() {
    const listEl = document.getElementById('template-list');
    listEl.innerHTML = '';
    
    templates.forEach(t => {
        const li = document.createElement('li');
        li.className = 'template-item';
        li.innerHTML = `
            <span>${t.name}</span>
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
    if (!name) return alert("이름을 입력하세요.");
    
    const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    templates.push({ id: newId, name: name });
    nameInput.value = '';
    renderTemplates();
}

function editTemplate(id) {
    const newName = prompt("수정할 템플릿 이름을 입력하세요:");
    if (newName && newName.trim()) {
        const template = templates.find(t => t.id === id);
        if (template) template.name = newName.trim();
        renderTemplates();
    }
}

function deleteTemplate(id) {
    if(confirm("정말 삭제하시겠습니까?")) {
        templates = templates.filter(t => t.id !== id);
        renderTemplates();
    }
}


// ==========================================
// [Card 5] JSON 복원 및 결함 처리
// ==========================================
function loadValidJson() {
    const validData = {
        text: "정상 복원된 텍스트",
        color: "#2ECC71",
        size: "36",
        x: "50",
        y: "50",
        zoom: "150", // [추가] 줌 데이터
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"
    };
    
    document.getElementById('text-input').value = validData.text;
    document.getElementById('color-input').value = validData.color;
    document.getElementById('size-slider').value = validData.size;
    document.getElementById('pos-x-slider').value = validData.x;
    document.getElementById('pos-y-slider').value = validData.y;
    
    // [추가] JSON에서 줌 상태 복원
    document.getElementById('zoom-slider').value = validData.zoom;
    updateImageZoom(); 

    updateTextStyle();

    const imgEl = document.getElementById('preview-img');
    imgEl.src = validData.image;
    imgEl.style.display = 'block';
    imgEl.classList.add('loaded');
    document.getElementById('placeholder-text').style.display = 'none';
    
    const textEl = document.getElementById('preview-text');
    textEl.textContent = validData.text;
    textEl.classList.add('show');

    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "✅ 정상 JSON 복원 완료. (줌 상태 포함)";
    msgEl.className = "validation-msg success";
}

function loadInvalidJson() {
    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "❌ 결함 JSON 감지: 문법 손상 및 필수 항목 누락. (현재 화면 유지됨)";
    msgEl.className = "validation-msg error";
}