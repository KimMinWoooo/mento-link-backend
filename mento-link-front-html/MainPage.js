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

//공지 모달 스크립트 (현재 더미 데이터 넣어놓음)

document.addEventListener("DOMContentLoaded", function () {
    const noticeModal = document.getElementById("noticeModal");
    const noticeListModal = document.getElementById("noticeListModal");
    const modalTitle = document.querySelector(".modal-title");
    const modalBody = document.querySelector(".modal-body");
    const noticeListElement = document.querySelector(".notice-list");

    const noticeData = {
        1: {
            title: "공지사항 1",
            body: "이것은 공지사항 1의 내용입니다.",
            date: "2025-05-01"
        },
        2: {
            title: "이거 어디까지 길어지는거예요",
            body: "ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁㅁ",
            date: "2025-04-28"
        }
    };

    function renderNotices() {
        noticeListElement.innerHTML = "";
        const modalList = document.querySelector(".modal-list");
        modalList.innerHTML = "";

        Object.entries(noticeData).forEach(([id, notice]) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <a href="#" class="open-notice" data-id="${id}">${notice.title}</a>
                <span class="date">${notice.date}</span>
            `;
            noticeListElement.appendChild(li);

            const modalLi = document.createElement("li");
            modalLi.innerHTML = `<a href="#" class="open-notice" data-id="${id}">${notice.title}</a>`;
            modalList.appendChild(modalLi);
        });

        bindNoticeClickEvents();
    }

    function bindNoticeClickEvents() {
        document.querySelectorAll(".open-notice").forEach(item => {
            item.addEventListener("click", function (e) {
                e.preventDefault();
                const id = this.dataset.id;
                if (noticeData[id]) {
                    modalTitle.textContent = noticeData[id].title;
                    modalBody.textContent = noticeData[id].body;
                    noticeListModal.style.display = "none";
                    noticeModal.style.display = "flex";
                }
            });
        });
    }

    document.querySelector(".ViewMore a").addEventListener("click", function (e) {
        e.preventDefault();
        noticeListModal.style.display = "flex";
    });

    document.querySelectorAll(".close-detail").forEach(btn =>
        btn.addEventListener("click", () => noticeModal.style.display = "none")
    );
    document.querySelectorAll(".close-list").forEach(btn =>
        btn.addEventListener("click", () => noticeListModal.style.display = "none")
    );

    window.addEventListener("click", function (e) {
        if (e.target === noticeModal) noticeModal.style.display = "none";
        if (e.target === noticeListModal) noticeListModal.style.display = "none";
    });

    renderNotices();
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

