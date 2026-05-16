// LocalStorage'da is_auth kaliti true ekanligini tekshiramiz
const isAuthenticated = localStorage.getItem('is_auth') === 'true';

// Agar tizimga kirmagan bo'lsa, majburan login sahifasiga qaytaramiz
if (!isAuthenticated) {
    window.location.replace('index.html');
}