// Supabase sozlamalari (O'zingizning URL va Key laringizni kiriting)
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Agar nom ro'yxatda bo'lsa o'shani, bo'lmasa standart 'ph-package' qaytaradi
    return iconMap[name] || 'ph-package';
}

async function fetchAndDisplayProducts() {
    const productGrid = document.getElementById('productGrid');

    try {
        const { data: products, error } = await _supabase
            .from('products')
            .select('product_name, product_massa, product_price');

        if (error) throw error;

        if (products.length === 0) {
            productGrid.innerHTML = '<div class="no-data">Mahsulotlar topilmadi.</div>';
            return;
        }

        // Konteynerni tozalash
        productGrid.innerHTML = '';

        products.forEach(product => {
            const iconClass = getMaterialIcon(product.product_name);

            const cardHTML = `
                <div class="product-card">
                    <div class="card-icon-circle">
                        <i class="ph ${iconClass}"></i>
                    </div>
                    <div class="card-content">
                        <h3 class="product-title">${product.product_name}</h3>
                        <div class="card-stats">
                            <div class="stat-item">
                                <span class="stat-label">Qancha bor</span>
                                <span class="stat-value">${product.product_massa} kg</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-label">Narxi</span>
                                <span class="stat-value">${Number(product.product_price).toLocaleString('uz-UZ')} so'm</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error('Xatolik:', error.message);
        productGrid.innerHTML = '<div class="error">Ma\'lumot yuklashda xatolik yuz berdi.</div>';
    }
}

// Sahifa yuklanganda funksiyani chaqirish
document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);