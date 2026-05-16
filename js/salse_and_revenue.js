const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];
let currentIndex = 0;
let basket = [];

// DOM elementlar
const titleEl = document.getElementById('cardTitle');
const priceEl = document.getElementById('cardPrice');
const stockEl = document.getElementById('cardStock');
const qtyInput = document.getElementById('orderQuantity');
const tableBody = document.getElementById('orderListBody');
const totalEl = document.getElementById('grandTotal');
const imgEl = document.getElementById('cardImage');

// Sahifa yuklanganda ma'lumotlarni olish
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateCardUI();
});

async function loadProducts() {
    const { data, error } = await _supabase.from('paving_stones').select('*').order('id', { ascending: true });
    if (!error) products = data;
}

function updateCardUI() {
    if (products.length === 0) return;
    const p = products[currentIndex];

    titleEl.innerText = p.paving_stone_name;
    priceEl.innerText = p.paving_stone_price.toLocaleString() + " so'm";
    stockEl.innerText = p.paving_stone_square + " m²";
    qtyInput.value = "";

    imgEl.src = `img/${p.id}.jpg`;
    imgEl.alt = p.paving_stone_name;
}

// Navigatsiya
document.getElementById('nextBtn').onclick = () => {
    currentIndex = (currentIndex + 1) % products.length;
    updateCardUI();
};

document.getElementById('prevBtn').onclick = () => {
    currentIndex = (currentIndex - 1 + products.length) % products.length;
    updateCardUI();
};

// SAVATGA QO'SHISH VA OMBORDAN AYIRISH
document.getElementById('addToListBtn').onclick = async () => {
    const qty = parseFloat(qtyInput.value);
    const p = products[currentIndex];

    if (!qty || qty <= 0) return alert("To'g'ri miqdorni kiriting!");
    if (qty > p.paving_stone_square) return alert("Omborda yetarli mahsulot yo'q!");

    const newStock = p.paving_stone_square - qty;

    const { error } = await _supabase
        .from('paving_stones')
        .update({ paving_stone_square: newStock })
        .eq('id', p.id);

    if (error) {
        alert("Xatolik yuz berdi: " + error.message);
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

// SAVATDAN O'CHIRISH VA OMBORGA QAYTARISH
window.removeItem = async (index) => {
    const item = basket[index];

    const p = products.find(prod => prod.id === item.id);
    const restoredStock = p.paving_stone_square + item.qty;

    const { error } = await _supabase
        .from('paving_stones')
        .update({ paving_stone_square: restoredStock })
        .eq('id', item.id);

    if (error) {
        alert("Qoldiqni qaytarishda xatolik: " + error.message);
        return;
    }

    p.paving_stone_square = restoredStock;
    basket.splice(index, 1);

    updateCardUI();
    renderBasket();
};

function renderBasket() {
    tableBody.innerHTML = "";
    let grandTotal = 0;

    basket.forEach((item, index) => {
        grandTotal += item.total;
        tableBody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.qty} m²</td>
                <td>${item.total.toLocaleString()} so'm</td>
                <td>
                    <button onclick="removeItem(${index})" class="text-red">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    totalEl.innerText = grandTotal.toLocaleString() + " so'm";
}

// BUYURTMANI YAKUNLASH
document.getElementById('placeOrderBtn').onclick = async () => {
    if (basket.length === 0) return alert("Savat bo'sh!");

    const { error } = await _supabase.from('orders').insert(
        basket.map(i => ({
            paving_stone_name: i.name,
            paving_stone_price: i.price,
            paving_stone_square: i.qty,
            paving_stone_full_price: i.total
        }))
    );

    if (error) {
        alert("Buyurtmani saqlashda xatolik: " + error.message);
    } else {
        alert("Buyurtma muvaffaqiyatli saqlandi!");
        basket = [];
        renderBasket();
    }
};

// ==========================================
// CHEK CHOP ETISH (PRINT) MANTIQ QISMI
// ==========================================
document.getElementById('printBtn').onclick = () => {
    if (basket.length === 0) {
        alert("Chop etish uchun savatda mahsulot yo'q!");
        return;
    }

    const receiptArea = document.getElementById('receiptArea');

    // Hozirgi sana va vaqtni olish
    const now = new Date();
    const dateStr = now.toLocaleDateString('uz-UZ') + " " + now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    // Chekning "Shapka" qismi
    let receiptHTML = `
        <div class="receipt-header">
            <h2>Tizim 2026</h2>
            <p>Sotuv cheki</p>
            <p>Sana: ${dateStr}</p>
        </div>
        <div class="receipt-body">
    `;

    // Tanlangan mahsulotlarni chek ro'yxatiga yozish
    let grandTotal = 0;
    basket.forEach(item => {
        grandTotal += item.total;
        receiptHTML += `
            <div class="receipt-item">
                <div class="receipt-item-name">${item.name}</div>
                <div class="receipt-item-details">
                    <span>${item.qty} m² x ${item.price.toLocaleString()}</span>
                    <span>${item.total.toLocaleString()} so'm</span>
                </div>
            </div>
        `;
    });

    // Chekning pastki xulosa qismi
    receiptHTML += `
        </div>
        <div class="receipt-total">
            JAMI: ${grandTotal.toLocaleString()} so'm
        </div>
        <div class="receipt-footer">
            Xaridingiz uchun rahmat!<br>
            Tizim 2026 dasturiy ta'minoti
        </div>
    `;

    // Yig'ilgan HTML ni maxsus hududga joylash va print ga berish
    receiptArea.innerHTML = receiptHTML;
    window.print();
};