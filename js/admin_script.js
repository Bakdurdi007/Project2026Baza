// O'zbek Lotin tilidan Kirill tiliga o'giruvchi mukammal konvertor funksiyasi
function transliterateToCyrillic(str) {
    if (!str) return str;
    const mapping = {
        "sh": "ш", "Sh": "Ш", "SH": "Ш",
        "ch": "ч", "Ch": "Ч", "CH": "Ч",
        "o'": "ў", "O'": "Ў", "o`": "ў", "O`": "Ў",
        "g'": "ғ", "G'": "Ғ", "g`": "ғ", "G`": "Ғ",
        "yo": "ё", "Yo": "Ё", "YO": "Ё",
        "ya": "я", "Ya": "Я", "YA": "Я",
        "yu": "ю", "Yu": "Ю", "YU": "Ю",
        "ts": "ц", "Ts": "Ц", "TS": "Ц",
        "a": "а", "A": "А", "b": "б", "B": "Б", "d": "д", "D": "Д", "e": "е", "E": "Е",
        "f": "ф", "F": "Ф", "g": "г", "G": "Г", "h": "ҳ", "H": "Ҳ", "i": "и", "I": "И",
        "j": "ж", "J": "Ж", "k": "к", "K": "К", "l": "л", "L": "Л", "m": "м", "M": "М",
        "n": "н", "N": "Н", "o": "о", "O": "О", "p": "п", "P": "П", "q": "қ", "Q": "Қ",
        "r": "р", "R": "Р", "s": "с", "S": "С", "t": "т", "T": "Т", "u": "у", "U": "У",
        "v": "в", "V": "В", "x": "х", "X": "Х", "y": "й", "Y": "Й", "z": "з", "Z": "З", "'": "ъ"
    };

    let result = str;
    const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    for (let key of sortedKeys) {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, mapping[key]);
    }
    return result;
}

// Matnni joriy tilga moslab qaytaruvchi global yordamchi funksiya
window.translateText = function(text) {
    const currentLang = localStorage.getItem('app_lang') || 'latin';
    return currentLang === 'cyrillic' ? transliterateToCyrillic(text) : text;
};

document.addEventListener('DOMContentLoaded', () => {

    // 1. TILNI BOSHQRISH (LOTIN / KIRILL)
    const langToggleBtn = document.getElementById('langToggle');

    function applyDOMTranslation() {
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(el => {
            if (!el.hasAttribute('data-origin-text')) {
                el.setAttribute('data-origin-text', el.textContent.trim());
            }
            const original = el.getAttribute('data-origin-text');
            el.textContent = window.translateText(original);
        });
    }

    langToggleBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('app_lang') || 'latin';
        const newLang = currentLang === 'latin' ? 'cyrillic' : 'latin';
        localStorage.setItem('app_lang', newLang);

        applyDOMTranslation();
        // Dinamik mahsulot kartochkalarini ham yangilash uchun event trigger qilamiz
        window.dispatchEvent(new CustomEvent('appLanguageChanged'));
    });


    // 2. SHRIFT O'LCHAMINI BOSHQARISH (A+ va A-)
    const fontIncreaseBtn = document.getElementById('fontIncrease');
    const fontDecreaseBtn = document.getElementById('fontDecrease');

    let currentScale = parseFloat(localStorage.getItem('app_font_scale')) || 1.0;
    document.documentElement.style.setProperty('--font-scale', currentScale);

    fontIncreaseBtn.addEventListener('click', () => {
        if (currentScale < 1.4) { // Maksimal kattalashish chegarasi
            currentScale = parseFloat((currentScale + 0.1).toFixed(1));
            localStorage.setItem('app_font_scale', currentScale);
            document.documentElement.style.setProperty('--font-scale', currentScale);
        }
    });

    fontDecreaseBtn.addEventListener('click', () => {
        if (currentScale > 0.8) { // Minimal kichiklashish chegarasi
            currentScale = parseFloat((currentScale - 0.1).toFixed(1));
            localStorage.setItem('app_font_scale', currentScale);
            document.documentElement.style.setProperty('--font-scale', currentScale);
        }
    });


    // 3. DARK / LIGHT REJIMINI BOSHQARISH
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('app_theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app_theme', newTheme);
        updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'ph ph-sun';
            themeIcon.style.color = '#f1c40f';
            themeText.textContent = window.translateText('Light Mode');
        } else {
            themeIcon.className = 'ph ph-moon';
            themeIcon.style.color = '#f39c12';
            themeText.textContent = window.translateText('Dark Mode');
        }
    }


    // 4. ADMIN ISMI VA TIZIMDAN CHIQISH
    const adminFullName = localStorage.getItem('admin_fullname') || 'Admin';
    const adminNameEl = document.getElementById('adminName');
    adminNameEl.setAttribute('data-origin-text', adminFullName);

    // Dastlabki tarjimani amalga oshirish
    applyDOMTranslation();
    updateThemeUI(localStorage.getItem('app_theme') || 'light');

    document.getElementById('logoutBtn').addEventListener('click', () => {
        const confirmMsg = window.translateText("Tizimdan rostdan ham chiqmoqchimisiz?");
        if(confirm(confirmMsg)) {
            localStorage.removeItem('is_auth');
            localStorage.removeItem('admin_fullname');
            localStorage.removeItem('admin_login');
            window.location.replace('index.html');
        }
    });

});