// API Base URL - админка на /admin, API на /api
// Проверяем, запущена ли админка на том же хосте, что и API
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `${window.location.protocol}//${window.location.hostname}:8080/api`
    : '/api';

// State
let currentUser = null;
let accessToken = null;
let refreshToken = null;
let currentCertificateId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const storedToken = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
        accessToken = storedToken;
        refreshToken = storedRefresh;
        currentUser = JSON.parse(storedUser);
        showMainScreen();
        loadDashboard();
    } else {
        showLoginScreen();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Status modal
    document.getElementById('status-select').addEventListener('change', (e) => {
        const reasonGroup = document.getElementById('rejection-reason-group');
        if (e.target.value === 'rejected') {
            reasonGroup.style.display = 'block';
        } else {
            reasonGroup.style.display = 'none';
        }
    });
    
    document.getElementById('status-form').addEventListener('submit', handleStatusChange);
    document.getElementById('cancel-status-btn').addEventListener('click', closeStatusModal);
    
    // Create user modal
    document.getElementById('create-user-btn').addEventListener('click', () => {
        const modal = document.getElementById('create-user-modal');
        modal.classList.add('show');
        // Сбрасываем форму и скрываем все поля при открытии
        document.getElementById('create-user-form').reset();
        document.getElementById('student-fields').style.display = 'none';
        document.getElementById('staff-fields').style.display = 'none';
    });
    
    document.getElementById('create-user-form').addEventListener('submit', handleCreateUser);
    document.getElementById('cancel-create-user-btn').addEventListener('click', () => {
        document.getElementById('create-user-modal').classList.remove('show');
    });
    
    // Refresh certificates
    document.getElementById('refresh-certificates').addEventListener('click', loadCertificates);
}

// Show screens
function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
}

function showMainScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    
    if (currentUser) {
        document.getElementById('user-info').textContent = 
            `${currentUser.first_name} ${currentUser.last_name} (${currentUser.role})`;
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'certificates') {
        loadCertificates();
    } else if (tabName === 'users') {
        loadUsers();
    }
}

// API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        
        // Проверяем, что ответ пришел
        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const data = await response.json();
                errorMessage = data.error || data.message || errorMessage;
            } catch (e) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }

            if (response.status === 401 && accessToken) {
                // Try to refresh token
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry request
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                    const retryResponse = await fetch(url, config);
                    if (!retryResponse.ok) {
                        throw new Error(errorMessage);
                    }
                    return await retryResponse.json();
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        // Проверяем, является ли это сетевой ошибкой
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Ошибка подключения к серверу. Убедитесь, что API запущен.');
        }
        throw error;
    }
}

async function refreshAccessToken() {
    if (!refreshToken) {
        handleLogout();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
            accessToken = data.access_token;
            // Обновляем refresh token, если сервер прислал новый
            if (data.refresh_token) {
                refreshToken = data.refresh_token;
                localStorage.setItem('refreshToken', refreshToken);
            }
            localStorage.setItem('accessToken', accessToken);
            return true;
        } else {
            handleLogout();
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        handleLogout();
        return false;
    }
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    // Показываем индикатор загрузки
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        accessToken = data.tokens.access_token;
        refreshToken = data.tokens.refresh_token;
        currentUser = data.user;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(currentUser));

        showMainScreen();
        loadDashboard();
    } catch (error) {
        errorDiv.textContent = error.message || 'Ошибка входа';
        errorDiv.classList.add('show');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    showLoginScreen();
}

// Load dashboard
async function loadDashboard() {
    try {
        const certificates = await apiCall('/certificates');
        
        const stats = {
            pending: 0,
            in_progress: 0,
            ready: 0,
            issued: 0,
        };

        certificates.forEach(cert => {
            if (cert.status in stats) {
                stats[cert.status]++;
            }
        });

        document.getElementById('stat-pending').textContent = stats.pending;
        document.getElementById('stat-in-progress').textContent = stats.in_progress;
        document.getElementById('stat-ready').textContent = stats.ready;
        document.getElementById('stat-completed').textContent = stats.issued;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load certificates
async function loadCertificates() {
    const listDiv = document.getElementById('certificates-list');
    listDiv.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const certificates = await apiCall('/certificates');
        
        if (certificates.length === 0) {
            listDiv.innerHTML = '<div class="empty-state">Нет справок</div>';
            return;
        }

        listDiv.innerHTML = certificates.map(cert => {
            // Маппинг статусов для CSS классов
            const statusClassMap = {
                pending: 'badge-pending',
                in_progress: 'badge-in-progress',
                ready: 'badge-ready',
                issued: 'badge-completed',
                rejected: 'badge-rejected',
            };
            const statusClass = statusClassMap[cert.status] || `badge-${cert.status}`;
            const statusLabels = {
                pending: 'Ожидает',
                in_progress: 'В процессе',
                ready: 'Готова',
                issued: 'Выдана',
                rejected: 'Отклонена',
            };

            const certType = escapeHtml(cert.type || 'Не указан');
            const certDate = formatDate(cert.created_at);
            const statusLabel = escapeHtml(statusLabels[cert.status] || cert.status);

            return `
                <div class="certificate-item">
                    <div class="certificate-info">
                        <div class="certificate-header">
                            <span class="badge ${statusClass}">${statusLabel}</span>
                            <span>Справка #${cert.id}</span>
                        </div>
                        <div class="certificate-details">
                            Тип: ${certType} | 
                            Создана: ${certDate}
                            ${cert.user_id ? `<br>Пользователь ID: ${cert.user_id}` : ''}
                            ${cert.rejection_reason ? `<br><span style="color: #dc2626;">Причина отклонения: ${escapeHtml(cert.rejection_reason)}</span>` : ''}
                        </div>
                    </div>
                    ${currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin') ? `
                        <div class="certificate-actions">
                            ${cert.status === 'pending' ? `
                                <button class="btn btn-primary" onclick="assignCertificate(${cert.id})">Назначить себе</button>
                            ` : ''}
                            ${cert.status === 'in_progress' ? `
                                <button class="btn btn-primary" onclick="openStatusModal(${cert.id})">Изменить статус</button>
                            ` : ''}
                            ${cert.status === 'ready' ? `
                                <button class="btn btn-primary" onclick="openStatusModal(${cert.id})">Изменить статус</button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        listDiv.innerHTML = `<div class="error-message show">Ошибка загрузки: ${error.message}</div>`;
    }
}

// Assign certificate
async function assignCertificate(certId) {
    if (!confirm('Назначить эту справку себе?')) {
        return;
    }
    
    try {
        await apiCall(`/certificates/${certId}/assign`, {
            method: 'POST',
        });
        loadCertificates();
        loadDashboard(); // Обновляем статистику
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Status modal
function openStatusModal(certId) {
    currentCertificateId = certId;
    document.getElementById('status-modal').classList.add('show');
}

function closeStatusModal() {
    document.getElementById('status-modal').classList.remove('show');
    currentCertificateId = null;
    document.getElementById('status-form').reset();
    document.getElementById('rejection-reason-group').style.display = 'none';
}

async function handleStatusChange(e) {
    e.preventDefault();
    const status = document.getElementById('status-select').value;
    const rejectionReason = document.getElementById('rejection-reason').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Проверка причины отклонения
    if (status === 'rejected' && !rejectionReason.trim()) {
        alert('Укажите причину отклонения');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        await apiCall(`/certificates/${currentCertificateId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                rejection_reason: status === 'rejected' ? rejectionReason : null,
            }),
        });
        
        closeStatusModal();
        loadCertificates();
        loadDashboard();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Load users
async function loadUsers() {
    const listDiv = document.getElementById('users-list');
    listDiv.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const users = await apiCall('/users');
        
        if (users.length === 0) {
            listDiv.innerHTML = '<div class="empty-state">Нет пользователей</div>';
            return;
        }

        listDiv.innerHTML = users.map(user => {
            const roleLabels = {
                student: 'Студент',
                staff: 'Сотрудник',
                admin: 'Администратор',
            };

            const firstName = escapeHtml(user.first_name);
            const lastName = escapeHtml(user.last_name);
            const middleName = escapeHtml(user.middle_name || '');
            const email = escapeHtml(user.email);
            const roleLabel = escapeHtml(roleLabels[user.role] || user.role);

            let additionalInfo = '';
            if (user.role === 'student') {
                additionalInfo = `
                    <div class="user-details">
                        <span>Студ. билет: ${escapeHtml(user.student_id || 'не указан')}</span>
                        ${user.group_name ? `<span>Группа: ${escapeHtml(user.group_name)}</span>` : ''}
                        ${user.faculty ? `<span>Факультет: ${escapeHtml(user.faculty)}</span>` : ''}
                        ${user.specialty ? `<span>Специальность: ${escapeHtml(user.specialty)}</span>` : ''}
                        ${user.year_of_study ? `<span>Курс: ${user.year_of_study}</span>` : ''}
                    </div>
                `;
            } else if (user.role === 'staff' || user.role === 'admin') {
                additionalInfo = `
                    <div class="user-details">
                        <span>Должность: ${escapeHtml(user.position || 'не указана')}</span>
                        ${user.department ? `<span>Отдел: ${escapeHtml(user.department)}</span>` : ''}
                    </div>
                `;
            }

            return `
                <div class="user-item">
                    <div class="user-info-item">
                        <div class="user-name">${firstName} ${lastName} ${middleName}</div>
                        <div class="user-email">${email}</div>
                        ${additionalInfo}
                    </div>
                    <div class="user-actions">
                        <span class="user-role">${roleLabel}</span>
                        ${user.id !== currentUser.id ? `
                            <button class="btn btn-secondary" onclick="deleteUser(${user.id})" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">Удалить</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        listDiv.innerHTML = `<div class="error-message show">Ошибка загрузки: ${error.message}</div>`;
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }

    try {
        await apiCall(`/users/${userId}`, {
            method: 'DELETE',
        });
        loadUsers();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Toggle role fields
function toggleRoleFields() {
    const roleSelect = document.getElementById('user-role');
    if (!roleSelect) return;
    
    const role = roleSelect.value;
    const studentFields = document.getElementById('student-fields');
    const staffFields = document.getElementById('staff-fields');
    
    if (role === 'student') {
        studentFields.style.display = 'block';
        staffFields.style.display = 'none';
        // Обязательные поля для студента
        document.getElementById('user-student-id').required = true;
        document.getElementById('user-group-name').required = true;
        document.getElementById('user-faculty').required = true;
        // Необязательные поля для сотрудника
        document.getElementById('user-position').required = false;
        document.getElementById('user-department').required = false;
    } else if (role === 'staff') {
        studentFields.style.display = 'none';
        staffFields.style.display = 'block';
        // Обязательные поля для сотрудника
        document.getElementById('user-position').required = true;
        document.getElementById('user-department').required = true;
        // Необязательные поля для студента
        document.getElementById('user-student-id').required = false;
        document.getElementById('user-group-name').required = false;
        document.getElementById('user-faculty').required = false;
    } else {
        // Роль не выбрана
        studentFields.style.display = 'none';
        staffFields.style.display = 'none';
        document.getElementById('user-student-id').required = false;
        document.getElementById('user-group-name').required = false;
        document.getElementById('user-faculty').required = false;
        document.getElementById('user-position').required = false;
        document.getElementById('user-department').required = false;
    }
}

// Create user
async function handleCreateUser(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const role = document.getElementById('user-role').value;
    
    // Проверка выбора роли
    if (!role) {
        alert('Выберите роль пользователя');
        return;
    }
    
    const formData = {
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: role,
        first_name: document.getElementById('user-first-name').value,
        last_name: document.getElementById('user-last-name').value,
        middle_name: document.getElementById('user-middle-name').value || undefined,
        phone: document.getElementById('user-phone').value || undefined,
    };

    // Добавляем поля в зависимости от роли
    if (role === 'student') {
        const studentId = document.getElementById('user-student-id').value;
        const groupName = document.getElementById('user-group-name').value;
        const faculty = document.getElementById('user-faculty').value;
        
        // Валидация обязательных полей
        if (!studentId || !groupName || !faculty) {
            alert('Заполните все обязательные поля для студента:\n- Номер студенческого билета\n- Номер группы\n- Факультет');
            return;
        }
        
        formData.student_id = studentId;
        formData.group_name = groupName;
        formData.faculty = faculty;
        formData.specialty = document.getElementById('user-specialty').value || undefined;
        
        const yearOfStudy = document.getElementById('user-year-of-study').value;
        if (yearOfStudy) {
            formData.year_of_study = parseInt(yearOfStudy);
        }
    } else if (role === 'staff') {
        const position = document.getElementById('user-position').value;
        const department = document.getElementById('user-department').value;
        
        // Валидация обязательных полей
        if (!position || !department) {
            alert('Заполните все обязательные поля для сотрудника:\n- Должность\n- Кафедра');
            return;
        }
        
        formData.position = position;
        formData.department = department;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        await apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        
        document.getElementById('create-user-modal').classList.remove('show');
        document.getElementById('create-user-form').reset();
        toggleRoleFields(); // Сброс полей
        loadUsers();
        alert('Пользователь успешно создан!');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    try {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Make functions global for onclick handlers
window.assignCertificate = assignCertificate;
window.openStatusModal = openStatusModal;
window.deleteUser = deleteUser;
window.toggleRoleFields = toggleRoleFields;

