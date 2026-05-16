// Supabase sozlamalari (O'zingizning ma'lumotlaringizni kiriting)
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';

// Supabase mijozini yaratish
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = ''; // Xatolikni tozalash

    const phone = phoneInput.value;
    const password = passwordInput.value;

    // Uzunlikni tekshirish
    if (phone.length !== 12) {
        errorMessage.textContent = "Telefon raqam aniq 12 ta raqamdan iborat bo'lishi shart.";
        return;
    }

    loginBtn.textContent = 'Tekshirilmoqda...';
    loginBtn.disabled = true;

    try {
        const { data, error } = await _supabase
            .from('admins')
            .select('login, password, fullname')
            .eq('login', phone)
            .eq('password', password)
            .maybeSingle(); // Agar topolmasa, xatolik bermaydi, shunchaki null qaytaradi

        if (error || !data) {
            errorMessage.textContent = "Login yoki parol noto'g'ri!";
            loginBtn.textContent = 'Tizimga kirish';
            loginBtn.disabled = false;
        } else {
            // Muvaffaqiyatli kirish - Ma'lumotlarni xotiraga saqlash
            localStorage.setItem('is_auth', 'true');
            localStorage.setItem('admin_fullname', data.fullname);
            localStorage.setItem('admin_login', data.login);

            // Admin panelga yo'naltirish
            window.location.replace('admin_panel.html');
        }
    } catch (err) {
        errorMessage.textContent = "Tizimda xatolik yuz berdi.";
        loginBtn.textContent = 'Tizimga kirish';
        loginBtn.disabled = false;
        console.error(err);
    }
});