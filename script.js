let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

let isDragging = false;
let currentXPercent = 50, currentYPercent = 50;

// DOM이 로드되면 모든 이벤트 리스너 연결
document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
    setupDragAndDrop();
    setupEventListeners(); // 이벤트 리스너 연결 함수 호출
});

// ==========================================
// 이벤트 리스너 설정 (버튼 및 입력창)
// ==========================================
function setupEventListeners() {
    // 1. 이미지 업로드 이벤트
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);

    // 2. '+ 텍스트 추가' 버튼 클릭 이벤트 (확실한 연결)
    document.getElementById('btn-add-text').addEventListener('click', addText);

    // 3. 텍스트 입력창 입력 이벤트
    document.getElementById('text-input').addEventListener('input', updateText);
}

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
    const textContainer = document.getElementById('preview-text-container');
    const textInput = document.getElementById('text-input');
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
        
        // 줌 초기화
        zoomSlider.value = 100;
        imgEl.style.transform = 'scale(1)';
        document.getElementById('zoom-val').textContent = '100%';
        phEl.style.display = 'none';
        
        // [핵심] 새로운 이미지를 올리면 텍스트 상자를 무조건 숨기고 초기화
        textContainer.classList.remove('show');
        textEl.textContent = "";
        textInput.value = "";
        textInput.disabled = true;
        
        // 텍스트 위치도 초기 중앙으로 리셋
        currentXPercent = 50;
        currentYPercent = 50;
        textContainer.style.left = `50%`;
        textContainer.style.top = `50%`;
        document.getElementById('pos-x-slider').value = 50;
        document.getElementById('pos-y-slider').value = 50;
        document.getElementById('pos-x-val').textContent = '50%';
        document.getElementById('pos-y-val').textContent = '50%';
    }
    reader.readAsDataURL(file);
}

// 텍스트 추가 버튼 로직
function addText() {
    const textContainer = document.getElementById('preview-text-container');
    const textInput = document.getElementById('text-input');
    const imgEl = document.getElementById('preview-img');
    const textMsg = document.getElementById('text-msg');

    if (imgEl.style.display === 'none') {
        textMsg.textContent = "⚠️ 먼저 이미지를 업로드해주세요.";
        textMsg.className = "validation-msg error";
        return;
    }

    textMsg.textContent = "";
    textContainer.classList.add('show'); // 텍스트 상자 보이기
    textInput.disabled = false;          // 입력창 활성화
    textInput.focus();                   // 입력창에 커서 위치
    
    // 만약 텍스트가 비어있다면 스타일 적용을 위해 빈 칸으로 둡니다.
    // 사용자가 입력을 시작하면 바로 반영됩니다.
}

function updateImageZoom() {
    const zoomVal = document.getElementById('zoom-slider').value;
    const imgEl = document.getElementById('preview-img');
    document.getElementById('zoom-val').textContent = `${zoomVal}%`;
    imgEl.style.transform = `scale(${zoomVal / 100})`;
}

// 텍스트 입력 시 즉시 반영
function updateText(event) {
    const textEl = document.getElementById('preview-text');
    // 입력한 그대로 반영 (강제 문구 없음)
    textEl.textContent = event.target.value; 
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

    currentXPercent = posX;
    currentYPercent = posY;
    
    const textContainer = document.getElementById('preview-text-container');
    textContainer.style.left = `${currentXPercent}%`;
    textContainer.style.top = `${currentYPercent}%`;
}

// 마우스 드래그 앤 드롭
function setupDragAndDrop() {
    const textContainer = document.getElementById('preview-text-container');
    const canvasArea = document.getElementById('canvas-area');
    const posXSlider = document.getElementById('pos-x-slider');
    const posYSlider = document.getElementById('pos-y-slider');

    textContainer.addEventListener('mousedown', (e) => {
        // 텍스트 컨테이너가 보일 때만 드래그 가능
        if (!textContainer.classList.contains('show')) return;
        isDragging = true;
        e.preventDefault(); 
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const canvasRect = canvasArea.getBoundingClientRect();
        let mouseX = e.clientX - canvasRect.left;
        let mouseY = e.clientY - canvasRect.top;

        mouseX = Math.max(0, Math.min(mouseX, canvasRect.width));
        mouseY = Math.max(0, Math.min(mouseY, canvasRect.height));

        currentXPercent = (mouseX / canvasRect.width) * 100;
        currentYPercent = (mouseY / canvasRect.height) * 100;

        textContainer.style.left = `${currentXPercent}%`;
        textContainer.style.top = `${currentYPercent}%`;

        posXSlider.value = Math.round(currentXPercent);
        posYSlider.value = Math.round(currentYPercent);
        
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
    document.getElementById('text-input').disabled = false;
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
    
    // JSON 복원 시에만 텍스트 상자 표시 및 내용 적용
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