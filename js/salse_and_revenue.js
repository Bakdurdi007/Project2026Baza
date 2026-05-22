// Supabase Infratuzilma Sozlamasi (Loyiha standartiga muvofiq supabaseClient ga o'zgartirildi)
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];
let currentIndex = 0;
let basket = [];

// DOM Elementlari
const titleEl = document.getElementById('cardTitle');
const priceEl = document.getElementById('cardPrice');
const stockEl = document.getElementById('cardStock');
const qtyInput = document.getElementById('orderQuantity');
const tableBody = document.getElementById('orderListBody');
const totalEl = document.getElementById('grandTotal');
const imgEl = document.getElementById('cardImage');

// Sahifa yuklanganda tizim mantiqini ishga tushirish
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateCardUI();
});

// Bazadan ma'lumotlarni yuklash
async function loadProducts() {
    const { data, error } = await supabaseClient
        .from('paving_stones')
        .select('*')
        .order('id', { ascending: true });

    if (!error && data) products = data;
}

// Kartochka UI interfeysini yangilash
function updateCardUI() {
    if (products.length === 0) return;
    const p = products[currentIndex];

    titleEl.innerText = window.translateText(p.paving_stone_name);
    priceEl.innerText = p.paving_stone_price.toLocaleString('uz-UZ') + " " + window.translateText("so'm");
    stockEl.innerText = p.paving_stone_square.toLocaleString('uz-UZ') + " m²";
    qtyInput.value = "";

    imgEl.src = `img/${p.id}.jpg`;
    imgEl.alt = p.paving_stone_name;
}

// Karusel Navigatsiyasi
document.getElementById('nextBtn').onclick = () => {
    if (products.length === 0) return;
    currentIndex = (currentIndex + 1) % products.length;
    updateCardUI();
};

document.getElementById('prevBtn').onclick = () => {
    if (products.length === 0) return;
    currentIndex = (currentIndex - 1 + products.length) % products.length;
    updateCardUI();
};

// Savatga mahsulot qo'shish va bazadagi joriy qoldiqni kamaytirish
document.getElementById('addToListBtn').onclick = async () => {
    const qty = parseFloat(qtyInput.value);
    const p = products[currentIndex];

    if (!qty || qty <= 0) {
        alert(window.translateText("To'g'ri miqdorni kiriting!"));
        return;
    }
    if (qty > p.paving_stone_square) {
        alert(window.translateText("Omborda yetarli mahsulot yo'q!"));
        return;
    }

    const newStock = p.paving_stone_square - qty;

    const { error } = await supabaseClient
        .from('paving_stones')
        .update({ paving_stone_square: newStock })
        .eq('id', p.id);

    if (error) {
        alert(window.translateText("Xatolik yuz berdi: ") + error.message);
        return;
    }

    p.paving_stone_square = newStock;

    basket.push({
        id: p.id,
        name: p.paving_stone_name,
        price: p.paving_stone_price,
        qty: qty,
        total: p.paving_stone_price * qty
    });

    updateCardUI();
    renderBasket();
};

// Savatdan mahsulot o'chirish va zaxirani omborga qaytarish
window.removeItem = async (index) => {
    const item = basket[index];
    const p = products.find(prod => prod.id === item.id);
    const restoredStock = p.paving_stone_square + item.qty;

    const { error } = await supabaseClient
        .from('paving_stones')
        .update({ paving_stone_square: restoredStock })
        .eq('id', item.id);

    if (error) {
        alert(window.translateText("Qoldiqni qaytarishda xatolik: ") + error.message);
        return;
    }

    p.paving_stone_square = restoredStock;
    basket.splice(index, 1);

    updateCardUI();
    renderBasket();
};

// Savat jadvalini shakllantirish
function renderBasket() {
    tableBody.innerHTML = "";
    let grandTotal = 0;
    const txtSom = window.translateText("so'm");

    basket.forEach((item, index) => {
        grandTotal += item.total;
        tableBody.innerHTML += `
            <tr>
                <td><strong>${window.translateText(item.name)}</strong></td>
                <td>${item.qty.toLocaleString('uz-UZ')} m²</td>
                <td>${item.total.toLocaleString('uz-UZ')} ${txtSom}</td>
                <td>
                    <button onclick="removeItem(${index})" class="text-red">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    totalEl.innerText = grandTotal.toLocaleString('uz-UZ') + " " + txtSom;
}

// ==========================================
// 80MM PRINTER UCHUN YANGILANGAN PROFESSIONAL CHEK MANTIQI
// ==========================================
function runReceiptPrint() {
    const receiptArea = document.getElementById('receiptArea');
    const now = new Date();
    const dateStr = now.toLocaleDateString('uz-UZ');
    const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    // Tizimdagi joriy foydalanuvchi ismini dinamik aniqlash
    const adminNameEl = document.getElementById('adminName');
    const cashierName = (adminNameEl && adminNameEl.innerText !== "Yuklanmoqda...") ? adminNameEl.innerText : window.translateText("Xodim");

    let receiptHTML = `
        <div class="receipt-header">
            <h2>${window.translateText("Tizim 2026")}</h2>
            <p>*** ${window.translateText("SOTUV CHEKI")} ***</p>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-meta">
            <div class="receipt-meta-row">
                <span>${window.translateText("Sana:")} ${dateStr}</span>
                <span>${window.translateText("Vaqt:")} ${timeStr}</span>
            </div>
            <div class="receipt-meta-row">
                <span>${window.translateText("Kassir:")} ${cashierName}</span>
            </div>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-table-header">
            <span>${window.translateText("Mahsulot / Miqdor")}</span>
            <span>${window.translateText("Summa")}</span>
        </div>
        
        <div class="receipt-body">
    `;

    let grandTotal = 0;
    const txtSom = window.translateText("so'm");

    basket.forEach(item => {
        grandTotal += item.total;
        receiptHTML += `
            <div class="receipt-item">
                <div class="receipt-item-name">${window.translateText(item.name)}</div>
                <div class="receipt-item-details">
                    <span>${item.qty.toLocaleString('uz-UZ')} m² x ${item.price.toLocaleString('uz-UZ')}</span>
                    <span style="font-weight: bold;">${item.total.toLocaleString('uz-UZ')}</span>
                </div>
            </div>
        `;
    });

    receiptHTML += `
        </div>
        
        <div class="receipt-double-divider"></div>
        
        <div class="receipt-total">
            <span>${window.translateText("JAMI:")}</span>
            <span>${grandTotal.toLocaleString('uz-UZ')} ${txtSom}</span>
        </div>
        
        <div class="receipt-double-divider"></div>
        
        <div class="receipt-footer">
            <p style="font-weight: bold; margin: 0 0 4px 0;">${window.translateText("Xaridingiz uchun rahmat!")}</p>
            <p style="font-size: 10px; margin: 0; color: #555;">${window.translateText("Tizim 2026 dasturiy ta'minoti")}</p>
        </div>
    `;

    // Chek hududini yangilash
    receiptArea.innerHTML = receiptHTML;

    // Render kechikmasligi va oq ekran chiqmasligi uchun kafolatlangan vaqtinchalik pauza
    setTimeout(() => {
        window.print();
    }, 150);
}

// Buyurtmani yakunlash va orders jadvaliga yozish (Yangi avtomatik chek chiqarish qo'shildi)
document.getElementById('placeOrderBtn').onclick = async () => {
    if (basket.length === 0) {
        alert(window.translateText("Savat bo'sh!"));
        return;
    }

    const { error } = await supabaseClient.from('orders').insert(
        basket.map(i => ({
            paving_stone_name: i.name,
            paving_stone_price: i.price,
            paving_stone_square: i.qty,
            paving_stone_full_price: i.total
        }))
    );

    if (error) {
        alert(window.translateText("Buyurtmani saqlashda xatolik: ") + error.message);
    } else {
        alert(window.translateText("Buyurtma muvaffaqiyatli saqlandi! Chek chop etilmoqda..."));

        // Muvaffaqiyatli yakunlangandan so'ng chek chop etish mantiqini ishga tushirish
        runReceiptPrint();

        // Savatni tozalash
        basket = [];
        renderBasket();
    }
};

// Qo'shimcha qo'lda chop etish tugmasi mantiqi (Savat tozalanishidan oldin chop etish uchun)
document.getElementById('printBtn').onclick = () => {
    if (basket.length === 0) {
        alert(window.translateText("Chop etish uchun savatda mahsulot yo'q!"));
        return;
    }
    runReceiptPrint();
};