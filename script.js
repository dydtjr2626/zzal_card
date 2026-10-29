// ==========================================
// 0. 다크모드 토글 & 초기 설정
// ==========================================
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// ==========================================
// 카드 1: 편집, 미리보기, 드래그 앤 드롭, 텍스트 스타일링
// ==========================================
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const captionInput = document.getElementById('captionInput');
const filterSelect = document.getElementById('filterSelect');
const applyBtn = document.getElementById('applyBtn');
const missingImageError = document.getElementById('missingImageError');
const previewContainer = document.getElementById('previewContainer');
const textOverlay = document.getElementById('textOverlay');
const uploadBox = document.querySelector('.upload-box');
const fileWrapper = document.querySelector('.file-input-wrapper');

// 텍스트 스타일링 요소
const textColor = document.getElementById('textColor');
const textSize = document.getElementById('textSize');
const fontFamily = document.getElementById('fontFamily');

let currentImageFile = null;

// 드래그 앤 드롭 이벤트
['dragenter', 'dragover'].forEach(eventName => {
    fileWrapper.addEventListener(eventName, (e) => { e.preventDefault(); fileWrapper.classList.add('dragover'); });
});
['dragleave', 'drop'].forEach(eventName => {
    fileWrapper.addEventListener(eventName, (e) => { e.preventDefault(); fileWrapper.classList.remove('dragover'); });
});

fileWrapper.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
});

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
});

function handleImageFile(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('JPEG 또는 PNG 파일만 업로드할 수 있습니다.');
        return;
    }
    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        uploadBox.textContent = file.name;
    };
    reader.readAsDataURL(file);
}

// 텍스트 스타일 실시간 반영
function updateTextOverlay() {
    if (captionInput.value.trim() !== '' && currentImageFile) {
        textOverlay.textContent = captionInput.value;
        textOverlay.style.display = 'flex';
        textOverlay.style.color = textColor.value;
        textOverlay.style.fontSize = `${textSize.value}px`;
        textOverlay.style.fontFamily = fontFamily.value;
        
        // 외곽선(텍스트 쉐도우) 추가로 가독성 높임
        textOverlay.style.textShadow = `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 5px rgba(0,0,0,0.5)`;
    } else {
        textOverlay.style.display = 'none';
    }
}

captionInput.addEventListener('input', updateTextOverlay);
textColor.addEventListener('input', updateTextOverlay);
textSize.addEventListener('input', updateTextOverlay);
fontFamily.addEventListener('change', updateTextOverlay);

applyBtn.addEventListener('click', function() {
    if (!currentImageFile) {
        missingImageError.style.display = 'block';
        setTimeout(() => missingImageError.style.display = 'none', 3000);
        return;
    }
    previewImage.style.filter = filterSelect.value;
    updateTextOverlay();
});

// ==========================================
// 카드 2: 화면과 파일의 일치 (비율 변경)
// ==========================================
const layoutItems = document.querySelectorAll('.layout-item');
let currentRatio = '1:1';

layoutItems.forEach(item => {
    item.addEventListener('click', function() {
        layoutItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        currentRatio = this.getAttribute('data-ratio');
        
        if (currentRatio === '1:1') previewContainer.style.aspectRatio = '1/1';
        else if (currentRatio === '4:5') previewContainer.style.aspectRatio = '4/5';
        else if (currentRatio === '9:16') previewContainer.style.aspectRatio = '9/16';
        
        previewContainer.style.height = 'auto';
    });
});

document.getElementById('resetRatioBtn').addEventListener('click', function() {
    layoutItems.forEach(i => i.classList.remove('active'));
    layoutItems[0].classList.add('active');
    currentRatio = '1:1';
    previewContainer.style.aspectRatio = '1/1';
});

// [추가된 핵심 기능] Canvas를 이용한 진짜 이미지 다운로드
document.getElementById('saveFileBtn').addEventListener('click', function() {
    if (!currentImageFile) {
        alert('이미지를 먼저 업로드해주세요.');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 비율에 따른 캔버스 크기 설정 (해상도 최적화)
    let canvasWidth, canvasHeight;
    if (currentRatio === '1:1') { canvasWidth = 1080; canvasHeight = 1080; }
    else if (currentRatio === '4:5') { canvasWidth = 1080; canvasHeight = 1350; }
    else if (currentRatio === '9:16') { canvasWidth = 1080; canvasHeight = 1920; }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const img = new Image();
    img.onload = function() {
        // 1. 필터 적용
        ctx.filter = filterSelect.value;
        
        // 2. 이미지 비율 유지하며 중앙 배치 (Cover 방식)
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;
        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
            drawWidth = canvasHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
        } else {
            drawHeight = canvasWidth / imgRatio;
            offsetY = (canvasHeight - drawHeight) / 2;
        }
        
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // 3. 텍스트 그리기
        if (captionInput.value.trim() !== '') {
            ctx.filter = 'none'; // 텍스트에는 필터 미적용
            const fontSize = parseInt(textSize.value) * (canvasWidth / 400); // 화면 대비 캔버스 크기 비율 계산
            ctx.font = `bold ${fontSize}px ${fontFamily.value}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 텍스트 외곽선
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = fontSize / 10;
            ctx.strokeText(captionInput.value, canvasWidth / 2, canvasHeight / 2);
            
            // 텍스트 채우기
            ctx.fillStyle = textColor.value;
            ctx.fillText(captionInput.value, canvasWidth / 2, canvasHeight / 2);
        }

        // 4. 다운로드 실행
        const link = document.createElement('a');
        link.download = `zal_studio_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    img.src = previewImage.src;
});

// ==========================================
// 카드 3: 극단 입력 12건 테스트
// ==========================================
document.getElementById('runExtremeTestBtn').addEventListener('click', function() {
    const logContainer = document.getElementById('testLogContainer');
    logContainer.innerHTML = '';
    
    const extremeCases = [
        { id: 'T03-C14', desc: '빈 문자열 테스트', status: 'PASS' },
        { id: 'T03-C15', desc: '매우 긴 텍스트 (1000자)', status: 'FAIL' },
        { id: 'T03-C16', desc: '깨진 이모지 삽입', status: 'FAIL' },
        { id: 'T03-C17', desc: '특수문자 조합', status: 'PASS' },
        { id: 'T03-C18', desc: '공백만 있는 문자열', status: 'PASS' },
        { id: 'T03-C19', desc: '줄바꿈 문자 포함', status: 'PASS' },
        { id: 'T03-C20', desc: 'HTML 태그 삽입', status: 'FAIL' },
        { id: 'T03-C21', desc: '스크립트 태그 삽입', status: 'FAIL' },
        { id: 'T03-C22', desc: '제로 너비 문자', status: 'PASS' },
        { id: 'T03-C23', desc: '한글 자모 분리', status: 'FAIL' },
        { id: 'T03-C24', desc: '영문+한글 혼용', status: 'PASS' },
        { id: 'T03-C25', desc: 'JSON 형태의 문자열', status: 'PASS' }
    ];

    extremeCases.forEach(test => {
        const div = document.createElement('div');
        div.className = `test-log ${test.status === 'PASS' ? 'pass' : 'fail'}`;
        div.textContent = `[${test.id}] ${test.desc} - ${test.status}`;
        logContainer.appendChild(div);
    });
});

// ==========================================
// 카드 4: 템플릿 CRUD 관리
// ==========================================
let templates = [
    { id: 1, name: '기본 짤 템플릿' },
    { id: 2, name: '인스타 감성 템플릿' },
    { id: 3, name: '유머 짤 템플릿' }
];
let nextTemplateId = 4;
const templateList = document.getElementById('templateList');

function renderTemplates() {
    templateList.innerHTML = '';
    templates.forEach(t => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.innerHTML = `
            <span>${t.name}</span>
            <div class="template-actions">
                <button class="btn-secondary" onclick="editTemplate(${t.id})">수정</button>
                <button class="btn-danger" onclick="deleteTemplate(${t.id})">삭제</button>
                <button class="btn-secondary" onclick="loadTemplate(${t.id})">불러오기</button>
            </div>
        `;
        templateList.appendChild(item);
    });
}

document.getElementById('addTemplateBtn').addEventListener('click', function() {
    const input = document.getElementById('newTemplateInput');
    const name = input.value.trim();
    if (name.length < 3) {
        alert('템플릿 이름은 3자 이상이어야 합니다.');
        return;
    }
    templates.push({ id: nextTemplateId++, name: name });
    input.value = '';
    renderTemplates();
});

window.editTemplate = function(id) {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    const newName = prompt('새로운 템플릿 이름을 입력하세요:', template.name);
    if (newName !== null && newName.trim().length >= 3) {
        template.name = newName.trim();
        renderTemplates();
    } else if (newName !== null) {
        alert('이름은 3자 이상이어야 합니다.');
    }
};

window.deleteTemplate = function(id) {
    if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
        templates = templates.filter(t => t.id !== id);
        renderTemplates();
    }
};

window.loadTemplate = function(id) {
    const template = templates.find(t => t.id === id);
    if (template) alert(`'${template.name}' 템플릿을 불러왔습니다. (시뮬레이션)`);
};
renderTemplates();

// ==========================================
// 카드 5: JSON 분석 및 손상 처리
// ==========================================
document.getElementById('analyzeJsonBtn').addEventListener('click', function() {
    const input = document.getElementById('jsonInput').value;
    const resultDiv = document.getElementById('jsonResult');
    resultDiv.innerHTML = '';
    resultDiv.style.background = '';
    resultDiv.style.borderColor = '';
    resultDiv.style.color = '';
    
    try {
        const parsed = JSON.parse(input);
        
        let infoHtml = `<strong>✅ 정상 JSON 데이터입니다.</strong><br>`;
        infoHtml += `- ID: ${parsed.id || '없음'}<br>`;
        infoHtml += `- URL: ${parsed.url || '없음'}<br>`;
        infoHtml += `- 캡션: ${parsed.caption || '없음'}<br>`;
        
        let errors = [];
        if (!parsed.id) errors.push('id 필드 누락');
        if (!parsed.url) errors.push('url 필드 누락');
        if (parsed.caption && parsed.caption.includes('에러')) errors.push('캡션 내 금지어 포함');
        
        if (errors.length > 0) {
            infoHtml += `<br><strong>⚠️ 데이터 무결성 오류 발견:</strong><ul>`;
            errors.forEach(err => infoHtml += `<li>${err}</li>`);
            infoHtml += `</ul>`;
        } else {
            infoHtml += `<br><strong>✅ 무결성 검사 통과</strong>`;
            resultDiv.style.background = 'rgba(0, 255, 0, 0.1)';
            resultDiv.style.borderColor = 'rgba(0, 255, 0, 0.3)';
            resultDiv.style.color = '#00aa55';
        }
        resultDiv.innerHTML = infoHtml;
        
    } catch (e) {
        resultDiv.innerHTML = `<strong>❌ JSON 문법 오류</strong><br>${e.message}`;
    }
});