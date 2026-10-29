let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

// 드래그 상태 관리를 위한 변수
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let currentXPercent = 50, currentYPercent = 50; // 현재 텍스트 위치 (%)

document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
    setupDragAndDrop(); // 드래그 앤 드롭 이벤트 초기화
});

// ==========================================
// [Card 1, 2] 에디터, 이미지 및 드래그 제어
// ==========================================
function changeRatio(ratio, btn) {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const canvas = document.getElementById('canvas-area');
    
    if (ratio === '1/1') canvas.style.width = '450px';
    else if (ratio === '4/5') canvas.style.width = '360px';
    else if (ratio === '9/16') canvas.style.width = '253px';
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const msgEl = document.getElementById('file-msg');
    const imgEl = document.getElementById('preview-img');
    const phEl = document.getElementById('placeholder-text');
    const zoomSlider = document.getElementById('zoom-slider');

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
        
        zoomSlider.value = 100;
        imgEl.style.transform = 'scale(1)';
        document.getElementById('zoom-val').textContent = '100%';

        phEl.style.display = 'none';
        
        // 텍스트는 버튼을 눌러야 나오므로 여기서는 숨김 처리 유지
        document.getElementById('preview-text-container').classList.remove('show');
    }
    reader.readAsDataURL(file);
}

// [추가] 텍스트 추가 버튼 로직
function addText() {
    const textContainer = document.getElementById('preview-text-container');
    const textInput = document.getElementById('text-input');
    const imgEl = document.getElementById('preview-img');

    // 이미지가 없으면 경고 (사진 위에 텍스트를 올리는 것이므로)
    if (imgEl.style.display === 'none') {
        document.getElementById('text-msg').textContent = "⚠️ 먼저 이미지를 업로드해주세요.";
        document.getElementById('text-msg').className = "validation-msg error";
        return;
    }

    document.getElementById('text-msg').textContent = "";
    
    // 텍스트 상자 보이기
    textContainer.classList.add('show');
    
    // 입력창 활성화 및 포커스
    textInput.disabled = false;
    textInput.focus();
    
    // 초기 텍스트가 없으면 기본값 세팅
    if (textInput.value.trim() === "") {
        textInput.value = "텍스트를 입력하세요";
        document.getElementById('preview-text').textContent = textInput.value;
    }
}

function updateImageZoom() {
    const zoomVal = document.getElementById('zoom-slider').value;
    const imgEl = document.getElementById('preview-img');
    document.getElementById('zoom-val').textContent = `${zoomVal}%`;
    imgEl.style.transform = `scale(${zoomVal / 100})`;
}

function updateText(event) {
    const textEl = document.getElementById('preview-text');
    textEl.textContent = event.target.value || "텍스트를 입력하세요";
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
    textEl.style.color = color;

    // 슬라이더 조작 시 드래그 좌표 변수도 업데이트
    currentXPercent = posX;
    currentYPercent = posY;
    
    const textContainer = document.getElementById('preview-text-container');
    textContainer.style.left = `${currentXPercent}%`;
    textContainer.style.top = `${currentYPercent}%`;
}

// [추가] 마우스 드래그 앤 드롭 로직
function setupDragAndDrop() {
    const textContainer = document.getElementById('preview-text-container');
    const canvasArea = document.getElementById('canvas-area');
    const posXSlider = document.getElementById('pos-x-slider');
    const posYSlider = document.getElementById('pos-y-slider');

    textContainer.addEventListener('mousedown', (e) => {
        // 텍스트 상자가 보이지 않으면 드래그 불가
        if (!textContainer.classList.contains('show')) return;
        
        isDragging = true;
        
        // 마우스가 캔버스 내에서 시작한 좌표 기록
        const canvasRect = canvasArea.getBoundingClientRect();
        dragStartX = e.clientX - canvasRect.left;
        dragStartY = e.clientY - canvasRect.top;
        
        e.preventDefault(); // 기본 드래그(이미지 끌기 등) 방지
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const canvasRect = canvasArea.getBoundingClientRect();
        
        // 마우스 이동 거리 계산
        let mouseX = e.clientX - canvasRect.left;
        let mouseY = e.clientY - canvasRect.top;

        // 캔버스 영역을 벗어나지 않도록 제한 (0% ~ 100%)
        mouseX = Math.max(0, Math.min(mouseX, canvasRect.width));
        mouseY = Math.max(0, Math.min(mouseY, canvasRect.height));

        // 퍼센트 값으로 변환
        currentXPercent = (mouseX / canvasRect.width) * 100;
        currentYPercent = (mouseY / canvasRect.height) * 100;

        // 텍스트 위치 업데이트
        textContainer.style.left = `${currentXPercent}%`;
        textContainer.style.top = `${currentYPercent}%`;

        // 슬라이더 값도 동기화 (반올림 처리)
        posXSlider.value = Math.round(currentXPercent);
        posYSlider.value = Math.round(currentYPercent);
        
        // 슬라이더 라벨 텍스트 업데이트
        document.getElementById('pos-x-val').textContent = `${posXSlider.value}%`;
        document.getElementById('pos-y-val').textContent = `${posYSlider.value}%`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function downloadPreview() {
    alert("현재 화면 비율, 사진 줌 상태, 텍스트 스타일 및 드래그 위치 그대로 파일이 다운로드됩니다.");
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
        text: "JSON에서 복원된 텍스트",
        color: "#2ECC71",
        size: "36",
        x: "50",
        y: "50",
        zoom: "100",
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"
    };
    
    document.getElementById('text-input').value = validData.text;
    document.getElementById('text-input').disabled = false; // 입력창 활성화
    document.getElementById('color-input').value = validData.color;
    document.getElementById('size-slider').value = validData.size;
    document.getElementById('pos-x-slider').value = validData.x;
    document.getElementById('pos-y-slider').value = validData.y;
    
    document.getElementById('zoom-slider').value = validData.zoom;
    updateImageZoom(); 

    updateTextStyle();

    const imgEl = document.getElementById('preview-img');
    imgEl.src = validData.image;
    imgEl.style.display = 'block';
    imgEl.classList.add('loaded');
    document.getElementById('placeholder-text').style.display = 'none';
    
    // 텍스트 상자 및 텍스트 내용 표시
    const textContainer = document.getElementById('preview-text-container');
    const textEl = document.getElementById('preview-text');
    textContainer.classList.add('show');
    textEl.textContent = validData.text;

    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "✅ 정상 JSON 복원 완료. (텍스트 및 줌 상태 포함)";
    msgEl.className = "validation-msg success";
}

function loadInvalidJson() {
    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "❌ 결함 JSON 감지: 문법 손상 및 필수 항목 누락. (현재 화면 유지됨)";
    msgEl.className = "validation-msg error";
}