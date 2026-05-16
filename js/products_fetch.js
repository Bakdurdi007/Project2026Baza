// Supabase sozlamalari
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mahsulot nomiga qarab ikonka klassini qaytaruvchi funksiya
function getMaterialIcon(name) {
    const iconMap = {
        'Oq sement': 'ph-cube-transparent',
        'Qora sement': 'ph-cube',
        'Oq tosh': 'ph-mountains',
        'Qora tosh': 'ph-mountains',
        'Kraska 750': 'ph-drop-half-bottom',
        'Kraska 313': 'ph-drop-half-bottom',
        'Kraska Titan': 'ph-drop-half-bottom',
        'Kraska 130': 'ph-drop-half-bottom',
        'Kraska 315': 'ph-drop-half-bottom',
        'Kraska 686': 'ph-drop-half-bottom',
        'Kraska Saja': 'ph-drop-half-bottom',
        'Ximikat': 'ph-flask'
    };
    return iconMap[name] || 'ph-package';
}

// Mahsulot zaxirasi kam qolganini tekshiruvchi funksiya
function checkLowStock(productName, productMassa) {
    const mass = Number(productMassa) || 0;

    const sementlar = ['Oq sement', 'Qora sement'];
    if (sementlar.includes(productName) && mass <= 2000) return true;

    const toshlar = ['Oq tosh', 'Qora tosh'];
    if (toshlar.includes(productName) && mass <= 10000) return true;

    const kraskalarVaXimikat = [
        'Kraska 750', 'Kraska 313', 'Kraska Titan', 'Kraska 130',
        'Kraska 315', 'Kraska 686', 'Kraska Saja', 'Ximikat'
    ];
    if (kraskalarVaXimikat.includes(productName) && mass <= 5) return true;

    return false;
}

async function fetchAndDisplayProducts() {
    const productGrid = document.getElementById('productGrid');

    try {
        // Yuklanish jarayoni matnini joriy tilda chiqarish
        productGrid.innerHTML = `<div class="loader">${window.translateText("Ma'lumotlar yuklanmoqda...")}</div>`;

        const { data: products, error } = await supabaseClient
            .from('products')
            .select('product_name, product_massa, product_price');

        if (error) throw error;

        if (products.length === 0) {
            productGrid.innerHTML = `<div class="no-data">${window.translateText("Mahsulotlar topilmadi.")}</div>`;
            return;
        }

        productGrid.innerHTML = '';

        products.forEach(product => {
            const iconClass = getMaterialIcon(product.product_name);
            const isLowStock = checkLowStock(product.product_name, product.product_massa);
            const warningClass = isLowStock ? 'warning-red' : '';

            // Dinamik maydonlar va o'lchov birliklarini tarjima qilish
            const displayedName = window.translateText(product.product_name);
            const labelStock = window.translateText("Qancha bor");
            const labelPrice = window.translateText("Narxi");
            const unitKg = window.translateText("kg");
            const unitSum = window.translateText("so'm");

            const cardHTML = `
                <div class="product-card ${warningClass}">
                    <div class="card-icon-circle">
                        <i class="ph ${iconClass}"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="product-title">${displayedName}</h3>
                        <div class="card-stats">
                            <div class="stat-item">
                                <span class="stat-label">${labelStock}</span>
                                <span class="stat-value">${Number(product.product_massa).toLocaleString('uz-UZ')} ${unitKg}</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-label">${labelPrice}</span>
                                <span class="stat-value">${Number(product.product_price).toLocaleString('uz-UZ')} ${unitSum}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error('Xatolik:', error.message);
        productGrid.innerHTML = `<div class="error">${window.translateText("Ma'lumot yuklashda xatolik yuz berdi.")}</div>`;
    }
}

// Sahifa yuklanganda va foydalanuvchi tilni o'zgartirganda ma'lumotlarni qayta yuklash
document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);
window.addEventListener('appLanguageChanged', fetchAndDisplayProducts);