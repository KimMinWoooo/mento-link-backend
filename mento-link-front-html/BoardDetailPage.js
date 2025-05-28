// URL에서 게시글 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('id');

// DOM 요소
const boardTitle = document.getElementById('boardTitle');
const boardAuthor = document.getElementById('boardAuthor');
const boardDate = document.getElementById('boardDate');
const boardContent = document.getElementById('boardContent');
const commentContent = document.getElementById('commentContent');
const submitComment = document.getElementById('submitComment');
const commentsList = document.getElementById('commentsList');
const commentForm = document.querySelector('.comment-form');

// 로그인 상태 확인 및 댓글 폼 표시 제어
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // 토큰 확인
    if (token) {
        commentForm.style.display = 'block';
    } else {
        commentForm.style.display = 'none';
    }
}

// 게시글 정보 가져오기
async function fetchBoard() {
    try {
        console.log('Fetching board with ID:', boardId); // 게시글 ID 확인
        const response = await fetch(`/api/boards/${boardId}`);
        console.log('Board response:', response); // 응답 확인
        
        if (!response.ok) throw new Error('게시글을 불러올 수 없습니다.');
        
        const board = await response.json();
        console.log('Board data:', board); // 게시글 데이터 확인
        displayBoard(board);
        fetchComments();
        checkLoginStatus();
    } catch (error) {
        console.error('Error fetching board:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 게시글 표시
function displayBoard(board) {
    boardTitle.textContent = board.title;
    boardAuthor.textContent = `작성자: ${board.author}`;
    boardDate.textContent = `작성일: ${new Date(board.createdAt).toLocaleDateString()}`;
    boardContent.textContent = board.content;
}

// 댓글 목록 가져오기
async function fetchComments() {
    try {
        console.log('Fetching comments for board:', boardId); // 댓글 요청 확인
        const response = await fetch(`/api/comments/board/${boardId}`);
        console.log('Comments response:', response); // 댓글 응답 확인
        
        if (!response.ok) throw new Error('댓글을 불러올 수 없습니다.');
        
        const comments = await response.json();
        console.log('Comments data:', comments); // 댓글 데이터 확인
        displayComments(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        commentsList.innerHTML = '<p>댓글을 불러오는데 실패했습니다.</p>';
    }
}

// 댓글 표시
function displayComments(comments) {
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p>아직 댓글이 없습니다.</p>';
        return;
    }

    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// 댓글 요소 생성
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
        <div class="comment-header">
            <span>${comment.author}</span>
            <span>${new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-actions">
            <button onclick="editComment('${comment._id}')">수정</button>
            <button onclick="deleteComment('${comment._id}')">삭제</button>
        </div>
    `;
    return div;
}

// 댓글 작성
submitComment.addEventListener('click', async () => {
    const content = commentContent.value.trim();
    if (!content) {
        alert('댓글 내용을 입력하세요.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }

    try {
        console.log('Submitting comment:', { content, boardId }); // 댓글 작성 요청 확인
        const response = await fetch(`/api/comments/board/${boardId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content,
                author: JSON.parse(localStorage.getItem('user')).name
            })
        });
        console.log('Comment submission response:', response); // 댓글 작성 응답 확인

        if (!response.ok) throw new Error('댓글 작성에 실패했습니다.');

        commentContent.value = '';
        fetchComments();
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('댓글 작성에 실패했습니다.');
    }
});

// 댓글 수정
async function editComment(commentId) {
    const content = prompt('수정할 내용을 입력하세요:');
    if (!content) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error('댓글 수정에 실패했습니다.');

        fetchComments();
    } catch (error) {
        console.error('Error:', error);
        alert('댓글 수정에 실패했습니다.');
    }
}

// 댓글 삭제
async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('댓글 삭제에 실패했습니다.');

        fetchComments();
    } catch (error) {
        console.error('Error:', error);
        alert('댓글 삭제에 실패했습니다.');
    }
}

// 페이지 로드 시 게시글 정보 가져오기
if (boardId) {
    console.log('Page loaded with board ID:', boardId); // 페이지 로드 확인
    fetchBoard();
} else {
    alert('잘못된 접근입니다.');
    window.location.href = '/';
}

// 로그인/로그아웃 시 댓글 폼 표시 업데이트
window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
        console.log('Token changed, updating comment form visibility'); // 토큰 변경 확인
        checkLoginStatus();
    }
}); 