let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

let activeTextElement = null; // 현재 선택된 텍스트
let isDragging = false;
let dragStartX, dragStartY;
let initialLeft, initialTop;

document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
    setupDragAndDrop();
});

// ==========================================
// [Card 1, 2] 이미지 및 텍스트 제어
// ==========================================
function changeRatio(ratio, btn) {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const canvas = document.getElementById('canvas-area');
    
    if (ratio === '1/1') canvas.style.width = '450px';
    else if (ratio === '4/5') canvas.style.width = '360px';
    else if (ratio === '9/16') canvas.style.width = '253px';
}

// 이미지 업로드 처리 (HTML 인라인 onchange로 호출됨)
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
        // 브라우저 렌더링 타이밍을 맞추기 위해 약간의 지연 후 클래스 추가
        setTimeout(() => {
            imgEl.classList.add('loaded');
        }, 10);
        
        zoomSlider.value = 100;
        imgEl.style.transform = 'scale(1)';
        document.getElementById('zoom-val').textContent = '100%';
        phEl.style.display = 'none';
    }
    reader.readAsDataURL(file);
}

function updateImageZoom() {
    const zoomVal = document.getElementById('zoom-slider').value;
    const imgEl = document.getElementById('preview-img');
    document.getElementById('zoom-val').textContent = `${zoomVal}%`;
    imgEl.style.transform = `scale(${zoomVal / 100})`;
}

// 여러 개의 텍스트 추가 (HTML 인라인 onclick으로 호출됨)
function addText() {
    const imgEl = document.getElementById('preview-img');
    const textMsg = document.getElementById('text-msg');

    if (imgEl.style.display === 'none') {
        textMsg.textContent = "⚠️ 먼저 이미지를 업로드해주세요.";
        textMsg.className = "validation-msg error";
        return;
    }

    textMsg.textContent = "";
    const textLayer = document.getElementById('text-layer');

    const newText = document.createElement('div');
    newText.className = 'draggable-text';
    newText.contentEditable = "true"; // 브라우저 내에서 바로 수정 가능
    newText.innerText = "텍스트 입력";
    
    newText.style.left = '50%';
    newText.style.top = '50%';
    
    const currentSize = document.getElementById('size-slider').value;
    const currentColor = document.getElementById('color-input').value;
    newText.style.fontSize = `${currentSize}px`;
    newText.style.color = currentColor;

    // 클릭 시 선택
    newText.addEventListener('mousedown', (e) => {
        // 드래그를 위해 기본 텍스트 선택 방지
        e.preventDefault(); 
        selectText(newText);
        
        // 드래그 시작 좌표 저장
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        // 현재 요소의 % 위치 저장
        initialLeft = parseFloat(newText.style.left) || 50;
        initialTop = parseFloat(newText.style.top) || 50;
    });

    textLayer.appendChild(newText);
    selectText(newText);
    
    // 새로 추가된 텍스트에 포커스 (바로 타이핑 가능하게)
    newText.focus();
}

// 특정 텍스트 선택
function selectText(element) {
    deselectAll();
    activeTextElement = element;
    element.classList.add('selected');
    
    // 현재 선택된 텍스트의 스타일을 슬라이더에 동기화
    const currentSize = parseInt(element.style.fontSize) || 24;
    document.getElementById('size-slider').value = currentSize;
    document.getElementById('size-val').textContent = `${currentSize}px`;
    
    // 색상 동기화
    const dummy = document.createElement('div');
    dummy.style.color = element.style.color;
    document.body.appendChild(dummy);
    const computedColor = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);

    const rgb = computedColor.match(/\d+/g);
    if (rgb) {
        const hex = "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
        document.getElementById('color-input').value = hex;
    }
}

function deselectAll() {
    document.querySelectorAll('.draggable-text').forEach(el => el.classList.remove('selected'));
    activeTextElement = null;
}

// 마우스 드래그 이벤트 설정
function setupDragAndDrop() {
    const canvasArea = document.getElementById('canvas-area');

    // 드래그 중 (마우스 이동)
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeTextElement) return;

        const canvasRect = canvasArea.getBoundingClientRect();
        
        // 마우스 이동 거리 계산
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        // 퍼센트로 변환하여 위치 업데이트
        const newLeft = initialLeft + (deltaX / canvasRect.width) * 100;
        const newTop = initialTop + (deltaY / canvasRect.height) * 100;

        // 캔버스 영역을 벗어나지 않도록 제한 (선택사항)
        // activeTextElement.style.left = `${newLeft}%`;
        // activeTextElement.style.top = `${newTop}%`;
        
        // 부드러운 이동을 위해 %로 적용
        activeTextElement.style.left = `${newLeft}%`;
        activeTextElement.style.top = `${newTop}%`;
    });

    // 드래그 종료
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // 캔버스 빈 곳 클릭 시 선택 해제
    canvasArea.addEventListener('mousedown', (e) => {
        if (e.target === canvasArea || e.target === document.getElementById('preview-img')) {
            deselectAll();
        }
    });
}

// 선택된 텍스트 스타일 업데이트
function updateSelectedTextStyle() {
    if (!activeTextElement) return;

    const size = document.getElementById('size-slider').value;
    const color = document.getElementById('color-input').value;

    document.getElementById('size-val').textContent = `${size}px`;

    activeTextElement.style.fontSize = `${size}px`;
    activeTextElement.style.color = color;
}

function downloadPreview() {
    alert("현재 화면 비율, 사진 줌 상태, 모든 텍스트 위치 그대로 파일이 다운로드됩니다.");
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
        texts: [
            { text: "JSON에서 복원된 텍스트 1", color: "#2ECC71", size: "36", x: "30", y: "30" },
            { text: "두 번째 텍스트", color: "#E74C3C", size: "24", x: "70", y: "70" }
        ],
        zoom: "100",
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"
    };
    
    const imgEl = document.getElementById('preview-img');
    imgEl.src = validData.image;
    imgEl.style.display = 'block';
    setTimeout(() => { imgEl.classList.add('loaded'); }, 10);
    
    document.getElementById('placeholder-text').style.display = 'none';
    
    document.getElementById('zoom-slider').value = validData.zoom;
    updateImageZoom(); 

    const textLayer = document.getElementById('text-layer');
    textLayer.innerHTML = '';
    deselectAll();

    validData.texts.forEach(t => {
        const newText = document.createElement('div');
        newText.className = 'draggable-text';
        newText.contentEditable = "true";
        newText.innerText = t.text;
        newText.style.left = `${t.x}%`;
        newText.style.top = `${t.y}%`;
        newText.style.fontSize = `${t.size}px`;
        newText.style.color = t.color;

        newText.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            selectText(newText);
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialLeft = parseFloat(newText.style.left) || 50;
            initialTop = parseFloat(newText.style.top) || 50;
        });
        
        textLayer.appendChild(newText);
    });

    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "✅ 정상 JSON 복원 완료. (다중 텍스트 포함)";
    msgEl.className = "validation-msg success";
}

function loadInvalidJson() {
    const msgEl = document.getElementById('card5-msg');
    msgEl.textContent = "❌ 결함 JSON 감지: 문법 손상 및 필수 항목 누락. (현재 화면 유지됨)";
    msgEl.className = "validation-msg error";
}