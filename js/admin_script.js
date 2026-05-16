document.addEventListener('DOMContentLoaded', () => {

    // 1. Admin ismini chiqarish
    const adminFullName = localStorage.getItem('admin_fullname') || 'Admin';
    document.getElementById('adminName').textContent = adminFullName;

    // 2. Dark/Light rejimini boshqarish
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const htmlElement = document.documentElement;

    // Xotirada saqlangan rejimni tekshirish
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    // Tugma bosilganda rejimni o'zgartirish
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app_theme', newTheme); // Xotiraga saqlash
        updateThemeUI(newTheme);
    });

    // Tugma ichidagi yozuv va ikonkani moslashtirish
    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'ph ph-sun';
            themeIcon.style.color = '#f1c40f'; // Quyosh rangi
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'ph ph-moon';
            themeIcon.style.color = '#f39c12'; // Oy rangi
            themeText.textContent = 'Dark Mode';
        }
    }

    // 3. Tizimdan chiqish
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Tasdiqlash so'rash (ixtiyoriy, lekin yaxshi amaliyot)
        if(confirm("Tizimdan rostdan ham chiqmoqchimisiz?")) {
            localStorage.removeItem('is_auth');
            localStorage.removeItem('admin_fullname');
            localStorage.removeItem('admin_login');
            window.location.replace('index.html');
        }
    });

});