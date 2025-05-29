//모달창 추가하니 스크립트가 너무 길어져서 분리했습니다. 불편하시면 바꿔주세요!

// API 기본 URL
const API_BASE_URL = '/api';

// 기수 목록 가져오기
async function getCohorts() {
    try {
        const response = await fetch(`${API_BASE_URL}/cohorts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cohorts = await response.json();
        const cohortList = document.getElementById('cohortList');
        
        if (cohorts.length === 0) {
            cohortList.innerHTML = '<div class="no-cohorts">등록된 기수가 없습니다.</div>';
            return;
        }

        cohortList.innerHTML = cohorts.map(cohort => `
            <div class="gen-box" data-cohort-id="${cohort._id}">
                ${cohort.number}기 멘토링 게시판
            </div>
        `).join('');

        // 각 gen-box에 클릭 이벤트 추가
        document.querySelectorAll('.gen-box').forEach(box => {
            box.addEventListener('click', function() {
                const cohortId = this.getAttribute('data-cohort-id');
                showSubjectsInSubSection(cohortId);
            });
        });
    } catch (error) {
        console.error('Error fetching cohorts:', error);
        document.getElementById('cohortList').innerHTML = 
            '<div class="error-message">기수 목록을 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 페이지 로드 시 데이터 가져오기
window.addEventListener('load', () => {
    getCohorts();
});

// ====== 메인페이지 공지사항 목록 실제 DB 연동 ======
async function loadMainNotices() {
    const noticeListElement = document.querySelector(".notice-list");
    noticeListElement.innerHTML = "<li>로딩중...</li>";
    try {
        const res = await fetch('/api/boards/subject/682edd408423789a032fe819/notice');
        const notices = await res.json();
        if (!Array.isArray(notices) || notices.length === 0) {
            noticeListElement.innerHTML = "<li>공지사항이 없습니다.</li>";
            return;
        }
        noticeListElement.innerHTML = notices.map(notice => `
            <li>
                <a href="#" class="open-notice" data-id="${notice._id}">${notice.title}</a>
                <span class="date">${new Date(notice.createdAt).toLocaleDateString()}</span>
            </li>
        `).join('');
        bindNoticeClickEvents(notices);
        // 공지 전체보기(모달)용 데이터도 저장
        window._mainNotices = notices;
    } catch (e) {
        noticeListElement.innerHTML = "<li>공지사항을 불러오는 중 오류 발생</li>";
    }
}

function bindNoticeClickEvents(notices) {
    document.querySelectorAll(".open-notice").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const id = this.dataset.id;
            const notice = notices.find(n => n._id === id);
            if (notice) {
                const modalTitle = document.querySelector(".modal-title");
                const modalBody = document.querySelector(".modal-body");
                modalTitle.textContent = notice.title;
                modalBody.textContent = notice.content;
                document.getElementById("noticeModal").style.display = "flex";
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', function() {
    loadMainNotices();
});

// SubSection에 과목 목록 표시
async function showSubjectsInSubSection(cohortId) {
    const subDetail = document.querySelector('.SubDetail');
    subDetail.innerHTML = '<div>과목 목록을 불러오는 중...</div>';
    try {
        const response = await fetch(`${API_BASE_URL}/subjects/cohort/${cohortId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const subjects = await response.json();
        if (subjects.length === 0) {
            subDetail.innerHTML = '<div class="no-subjects">등록된 과목이 없습니다.</div>';
            return;
        }
        subDetail.innerHTML = `
            <ul class="subject-list">
                ${subjects.map(subject => `
                    <li class="subject-list-item" onclick="location.href='/mentoring?subjectId=${subject._id}&type=notice'">
                        <span class="subject-title">${subject.name}</span>
                        <span class="subject-mentor">멘토: ${subject.mentor.name}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } catch (error) {
        subDetail.innerHTML = '<div class="error-message">과목 목록을 불러오는 중 오류가 발생했습니다.</div>';
    }
}

// 언어 변경 함수
async function setLanguage(lang) {
    try {
        const res = await fetch(`lang/${lang}.json`);
        const dict = await res.json();
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
    } catch (e) {
        console.error('언어 파일을 불러오지 못했습니다:', e);
    }
}

document.getElementById('lang-ko').addEventListener('click', () => setLanguage('ko'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// 로그인/회원가입 모달 및 인증 관련
(function() {
    // 모달 요소
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    
    // 로그인/회원가입 버튼 클릭 시 모달 열기
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });
    // 닫기 버튼
    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    closeRegister.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });

    // 회원가입 폼 제출
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            name: document.getElementById('regName').value,
            department: document.getElementById('regDepartment').value,
            studentId: document.getElementById('regStudentId').value,
            phone: document.getElementById('regPhone').value
        };
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                alert('회원가입이 완료되었습니다. 로그인 해주세요!');
                registerModal.style.display = 'none';
            } else {
                alert(result.message || '회원가입 실패');
            }
        } catch (err) {
            alert('회원가입 중 오류 발생');
        }
    });

    // 로그인 폼 제출
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
            studentId: document.getElementById('loginStudentId').value,
            password: document.getElementById('loginPassword').value
        };
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                loginModal.style.display = 'none';
                updateAuthUI();
            } else {
                alert(result.message || '로그인 실패');
            }
        } catch (err) {
            alert('로그인 중 오류 발생');
        }
    });

    // 로그인 상태 UI 업데이트
    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        if (token && user) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            // 로그인 정보 및 로그아웃 버튼 표시
            let authDiv = document.getElementById('authInfo');
            if (!authDiv) {
                authDiv = document.createElement('div');
                authDiv.id = 'authInfo';
                authDiv.style.display = 'inline-block';
                authDiv.style.marginLeft = '10px';
                loginBtn.parentNode.appendChild(authDiv);
            }
            authDiv.innerHTML = `${user.name}님 <button id="logoutBtn" class="logoutBtn">로그아웃</button>`;
            document.getElementById('logoutBtn').onclick = function() {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateAuthUI();
            };
        } else {
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            const authDiv = document.getElementById('authInfo');
            if (authDiv) authDiv.remove();
        }
    }
    // 페이지 로드 시 로그인 상태 반영
    updateAuthUI();
})();

// ====== 관리자: 기수/과목/공지사항 추가 모달 및 서버 연동 ======
(function() {
    // 기수 추가 모달
    const cohortBtn = document.getElementById('addCohortBtn');
    const cohortModal = document.getElementById('cohortModal');
    const closeCohort = document.getElementById('closeCohortModal');
    cohortBtn.onclick = () => { cohortModal.style.display = 'flex'; };
    closeCohort.onclick = () => { cohortModal.style.display = 'none'; };
    window.addEventListener('click', e => { if (e.target === cohortModal) cohortModal.style.display = 'none'; });
    document.getElementById('cohortForm').onsubmit = async function(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log('token for cohortForm:', token);
        const data = {
            number: document.getElementById('cohortNumber').value,
            startDate: document.getElementById('cohortStart').value,
            endDate: document.getElementById('cohortEnd').value,
            lmsUrl: document.getElementById('cohortLms').value,
            funSystemUrl: document.getElementById('cohortFun').value
        };
        try {
            const res = await fetch('/api/cohorts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('기수 추가 완료!');
                cohortModal.style.display = 'none';
                location.reload();
            } else {
                const result = await res.json();
                alert(result.message || '기수 추가 실패');
            }
        } catch (err) { alert('기수 추가 중 오류'); }
    };
    // 과목 추가 모달
    const subjectBtn = document.getElementById('addSubjectBtn');
    const subjectModal = document.getElementById('subjectModal');
    const closeSubject = document.getElementById('closeSubjectModal');
    subjectBtn.onclick = async () => {
        subjectModal.style.display = 'flex';
        // 기수 목록 동적 로드
        const sel = document.getElementById('subjectCohort');
        sel.innerHTML = '<option value="">로딩중...</option>';
        try {
            const res = await fetch('/api/cohorts');
            const cohorts = await res.json();
            sel.innerHTML = cohorts.map(c => `<option value="${c._id}">${c.number}기</option>`).join('');
        } catch { sel.innerHTML = '<option>기수 없음</option>'; }
    };
    closeSubject.onclick = () => { subjectModal.style.display = 'none'; };
    window.addEventListener('click', e => { if (e.target === subjectModal) subjectModal.style.display = 'none'; });
    document.getElementById('subjectForm').onsubmit = async function(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log('token for subjectForm:', token);
        const data = {
            name: document.getElementById('subjectName').value,
            code: document.getElementById('subjectCode').value,
            cohortId: document.getElementById('subjectCohort').value,
            mentor: {
                name: document.getElementById('mentorName').value,
                email: document.getElementById('mentorEmail').value,
                introduction: document.getElementById('mentorIntro').value
            }
        };
        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert('과목 추가 완료!');
                subjectModal.style.display = 'none';
                location.reload();
            } else {
                const result = await res.json();
                alert(result.message || '과목 추가 실패');
            }
        } catch (err) { alert('과목 추가 중 오류'); }
    };
    // 메인 공지사항 작성 모달
    const mainNoticeForm = document.getElementById('mainNoticeForm');
    if (mainNoticeForm) {
        mainNoticeForm.onsubmit = async function(e) {
            e.preventDefault();
            const token = localStorage.getItem('token');
            console.log('token for mainNoticeForm:', token);
            const data = new FormData();
            data.append('type', 'notice');
            data.append('isMainNotice', 'true');
            data.append('title', document.getElementById('mainNoticeTitle').value);
            data.append('content', document.getElementById('mainNoticeContent').value);
            data.append('author', JSON.parse(localStorage.getItem('user')).studentId);
            data.append('subject', '682edd408423789a032fe819');
            try {
                const res = await fetch('/api/boards', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: data
                });
                if (res.ok) {
                    alert('공지사항 등록 완료!');
                    document.getElementById('mainNoticeModal').style.display = 'none';
                    location.reload();
                } else {
                    const result = await res.json();
                    alert(result.message || '공지사항 등록 실패');
                }
            } catch (err) { alert('공지사항 등록 중 오류'); }
        };
    }
})();

// 공지 모달 닫기(x) 버튼 이벤트 추가
const noticeModal = document.getElementById('noticeModal');
const closeNoticeBtn = document.querySelector('.close-detail');
if (closeNoticeBtn) {
    closeNoticeBtn.addEventListener('click', function() {
        noticeModal.style.display = 'none';
    });
}

// 공지 전체보기(모달) 목록 렌더링 및 이벤트
function showNoticeListModal() {
    const modal = document.getElementById('noticeListModal');
    const list = modal.querySelector('.modal-list');
    const notices = window._mainNotices || [];
    if (notices.length === 0) {
        list.innerHTML = '<li>공지사항이 없습니다.</li>';
    } else {
        list.innerHTML = notices.map(notice => `
            <li><a href="#" class="open-notice" data-id="${notice._id}">${notice.title}</a><span class="date">${new Date(notice.createdAt).toLocaleDateString()}</span></li>
        `).join('');
    }
    // 목록 내 공지 클릭 시 상세 모달 오픈
    list.querySelectorAll('.open-notice').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.dataset.id;
            const notice = notices.find(n => n._id === id);
            if (notice) {
                const modalTitle = document.querySelector(".modal-title");
                const modalBody = document.querySelector(".modal-body");
                modalTitle.textContent = notice.title;
                modalBody.textContent = notice.content;
                document.getElementById("noticeModal").style.display = "flex";
                modal.style.display = 'none'; // 목록 모달 닫기
            }
        });
    });
    modal.style.display = 'flex';
}

// 전체보기(공지 목록) 버튼 이벤트
const viewMoreBtn = document.querySelector('.ViewMore a');
if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNoticeListModal();
    });
}
// 공지 목록 모달 닫기(x) 버튼
const closeNoticeListBtn = document.querySelector('.close-list');
const noticeListModal = document.getElementById('noticeListModal');
if (closeNoticeListBtn) {
    closeNoticeListBtn.addEventListener('click', function() {
        noticeListModal.style.display = 'none';
    });
}

