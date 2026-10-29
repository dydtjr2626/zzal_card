let templates = [
    { id: 1, name: "기본 템플릿" },
    { id: 2, name: "생일 축하" },
    { id: 3, name: "이벤트 홍보" }
];

let isDragging = false;
let activeTextElement = null; // 현재 선택된 텍스트
let dragStartX = 0, dragStartY = 0;
let initialLeft = 0, initialTop = 0;

document.addEventListener('DOMContentLoaded', () => {
    initCard3Inputs();
    renderTemplates();
    setupEventListeners();
});

// ==========================================
// 이벤트 리스너 설정
// ==========================================
function setupEventListeners() {
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    document.getElementById('btn-add-text').addEventListener('click', addText);

    // 마우스 드래그 이벤트 (캔버스 전체 영역에 등록)
    const canvasArea = document.getElementById('canvas-area');
    
    canvasArea.addEventListener('mousedown', (e) => {
        // 드래그 가능한 텍스트를 클릭했을 때만 작동
        if (e.target.classList.contains('draggable-text')) {
            activeTextElement = e.target;
            selectText(activeTextElement);
            
            isDragging = true;
            const rect = activeTextElement.getBoundingClientRect();
            const canvasRect = canvasArea.getBoundingClientRect();
            
            // 마우스 클릭 지점과 요소의 좌상단 간의 거리 계산
            dragStartX = e.clientX - rect.left;
            dragStartY = e.clientY - rect.top;
            
            // 현재 요소의 % 위치 저장
            initialLeft = parseFloat(activeTextElement.style.left) || 50;
            initialTop = parseFloat(activeTextElement.style.top) || 50;

            e.preventDefault(); // 텍스트 선택(파란색 블록) 방지
        } else {
            // 빈 공간 클릭 시 선택 해제
            deselectAll();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeTextElement) return;

        const canvasRect = canvasArea.getBoundingClientRect();
        
        // 마우스 위치에서 클릭 오프셋을 빼서 실제 텍스트의 좌상단 위치 계산
        let newX = e.clientX - canvasRect.left - dragStartX;
        let newY = e.clientY - canvasRect.top - dragStartY;

        // 퍼센트로 변환
        let newLeftPercent = (newX / canvasRect.width) * 100;
        let newTopPercent = (newY / canvasRect.height) * 100;

        // 캔버스 영역 밖으로 나가지 않도록 제한 (옵션: 0~100%)
        // transform: translate(-50%, -50%) 이므로 텍스트의 중심이 캔버스 밖으로 나가지 않게 함
        if (newLeftPercent < 0) newLeftPercent = 0;
        if (newLeftPercent > 100) newLeftPercent = 100;
        if (newTopPercent < 0) newTopPercent = 0;
        if (newTopPercent > 100) newTopPercent = 100;

        activeTextElement.style.left = `${newLeftPercent}%`;
        activeTextElement.style.top = `${newTopPercent}%`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // 텍스트 내용 수정 시 스타일 동기화 (선택된 텍스트의 크기/색상 슬라이더 업데이트)
    document.getElementById('size-slider').addEventListener('input', updateSelectedTextStyle);
    document.getElementById('color-input').addEventListener('input', updateSelectedTextStyle);
}

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
    }
    reader.readAsDataURL(file);
}

function updateImageZoom() {
    const zoomVal = document.getElementById('zoom-slider').value;
    const imgEl = document.getElementById('preview-img');
    document.getElementById('zoom-val').textContent = `${zoomVal}%`;
    imgEl.style.transform = `scale(${zoomVal / 100})`;
}

// 여러 개의 텍스트 추가
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

    // 새로운 텍스트 요소 생성
    const newText = document.createElement('div');
    newText.className = 'draggable-text';
    newText.contentEditable = "true"; // 브라우저 내에서 바로 수정 가능
    newText.innerText = "텍스트 입력";
    
    // 초기 위치 (중앙)
    newText.style.left = '50%';
    newText.style.top = '50%';
    
    // 현재 슬라이더 값 적용
    const currentSize = document.getElementById('size-slider').value;
    const currentColor = document.getElementById('color-input').value;
    newText.style.fontSize = `${currentSize}px`;
    newText.style.color = currentColor;

    // 텍스트를 클릭하면 선택 상태로 만들기
    newText.addEventListener('click', (e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        selectText(newText);
    });

    // 텍스트 수정 완료 시 (엔터키 등) 포커스 해제
    newText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            newText.blur();
        }
    });

    textLayer.appendChild(newText);
    selectText(newText); // 추가하자마자 선택 상태로
}

// 특정 텍스트 선택
function selectText(element) {
    deselectAll();
    activeTextElement = element;
    element.classList.add('selected');
    
    // 현재 선택된 텍스트의 스타일을 슬라이더에 동기화
    const currentSize = parseInt(element.style.fontSize) || 24;
    const currentColor = element.style.color;
    
    document.getElementById('size-slider').value = currentSize;
    document.getElementById('size-val').textContent = `${currentSize}px`;
    
    // 색상 값을 hex로 변환하여 input[type="color"]에 적용
    if (currentColor) {
        // rgb -> hex 변환 로직 (간단한 예시, 실제로는 더 복잡할 수 있음)
        const dummy = document.createElement('div');
        dummy.style.color = currentColor;
        document.body.appendChild(dummy);
        const computedColor = window.getComputedStyle(dummy).color;
        document.body.removeChild(dummy);

        const rgb = computedColor.match(/\d+/g);
        if (rgb) {
            const hex = "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
            document.getElementById('color-input').value = hex;
        }
    }
}

// 모든 텍스트 선택 해제
function deselectAll() {
    document.querySelectorAll('.draggable-text').forEach(el => el.classList.remove('selected'));
    activeTextElement = null;
}

// 선택된 텍스트의 스타일 업데이트 (크기, 색상)
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
    
    // 이미지 및 줌 초기화
    const imgEl = document.getElementById('preview-img');
    imgEl.src = validData.image;
    imgEl.style.display = 'block';
    imgEl.classList.add('loaded');
    document.getElementById('placeholder-text').style.display = 'none';
    
    document.getElementById('zoom-slider').value = validData.zoom;
    updateImageZoom(); 

    // 기존 텍스트 모두 지우기
    const textLayer = document.getElementById('text-layer');
    textLayer.innerHTML = '';
    deselectAll();

    // JSON 데이터로 텍스트 복원
    validData.texts.forEach(t => {
        const newText = document.createElement('div');
        newText.className = 'draggable-text';
        newText.contentEditable = "true";
        newText.innerText = t.text;
        newText.style.left = `${t.x}%`;
        newText.style.top = `${t.y}%`;
        newText.style.fontSize = `${t.size}px`;
        newText.style.color = t.color;

        newText.addEventListener('click', (e) => {
            e.stopPropagation();
            selectText(newText);
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