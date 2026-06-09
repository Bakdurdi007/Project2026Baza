// Supabase Infratuzilma Sozlamasi
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

// Modal DOM Elementlari
const customerModal = document.getElementById('customerModal');
const customerPhoneInput = document.getElementById('customerPhone');
const customerAddressInput = document.getElementById('customerAddress');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmModalBtn = document.getElementById('confirmModalBtn');

// ==========================================
// M² LARDAN DONA(DONA)GA O'GIRISH UCHUN LUG'AT (MAPPING)
// ==========================================
const pieceMapping = {
    "Toshbaqa seriy rang": { default: 11 },
    "Toshbaqa sariq rang": { default: 11 },
    "Astana": { kichik: 11, katta: 11 },
    "Samarqand": { kichik: 14, katta: 14 },
    "Samarqand guli": { default: 11 },
    "Fayz": { kichik: 12, katta: 25 },
    "Samarqand och rang": { kichik: 14, katta: 14 },
    "Ona bola malochnoy rang": { kichik: 12, katta: 12 },
    "Ona bola oq rang": { kichik: 12, katta: 12 },
    "30 ga 15": { default: 22 },
    "Qabamchik": { kichik: 40, katta: 40 },
    "30 ga 30 qizil rang": { default: 11 },
    "30 ga 30 seriy rang": { default: 11 },
    "Qo'smos": { kichik: 13, katta: 13 }
};

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

// Savatga mahsulot qo'shish
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
function runReceiptPrint(customerPhone, customerAddress) {
    const receiptArea = document.getElementById('receiptArea');
    const now = new Date();
    const dateStr = now.toLocaleDateString('uz-UZ');
    const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

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
            <div class="receipt-divider" style="border-top: 1px dotted #000; margin: 4px 0;"></div>
            <div class="receipt-meta-full">
                <strong>${window.translateText("Tel:")}</strong> ${customerPhone}
            </div>
            <div class="receipt-meta-full">
                <strong>${window.translateText("Manzil:")}</strong> ${customerAddress}
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

        // Dona (dona) larni hisoblash mantig'i
        let piecesHtml = "";
        const pMap = pieceMapping[item.name];
        if (pMap) {
            if (pMap.default) {
                const totalPieces = Math.round(item.qty * pMap.default);
                piecesHtml = `<div class="receipt-pieces">Yuklash uchun: ${totalPieces} dona</div>`;
            } else {
                const totalSmall = Math.round(item.qty * pMap.kichik);
                const totalLarge = Math.round(item.qty * pMap.katta);
                piecesHtml = `<div class="receipt-pieces">Yuklash uchun: ${totalSmall} ta kichik, ${totalLarge} ta katta</div>`;
            }
        }

        receiptHTML += `
            <div class="receipt-item">
                <div class="receipt-item-name">${window.translateText(item.name)}</div>
                <div class="receipt-item-details">
                    <span>${item.qty.toLocaleString('uz-UZ')} m² x ${item.price.toLocaleString('uz-UZ')}</span>
                    <span style="font-weight: bold;">${item.total.toLocaleString('uz-UZ')}</span>
                </div>
                ${piecesHtml}
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

    receiptArea.innerHTML = receiptHTML;

    setTimeout(() => {
        window.print();
    }, 150);
}

// ==========================================
// MODAL VA BUYURTMANI YAKUNLASH LOGIKASI
// ==========================================

function openCustomerModal() {
    if (basket.length === 0) {
        alert(window.translateText("Savat bo'sh! Amalni bajarish uchun mahsulot qo'shing."));
        return;
    }
    customerModal.style.display = 'flex';
}

function closeCustomerModal() {
    customerModal.style.display = 'none';
    customerPhoneInput.value = '';
    customerAddressInput.value = '';
}

// Har ikki tugma ham mijoz ma'lumotlarini so'raydi
document.getElementById('placeOrderBtn').onclick = openCustomerModal;
document.getElementById('printBtn').onclick = openCustomerModal;

// Modalni yopish
cancelModalBtn.onclick = closeCustomerModal;

// Modal tasdiqlanganda bazaga yozish va chek chiqarish
confirmModalBtn.onclick = async () => {
    const phone = customerPhoneInput.value.trim();
    const address = customerAddressInput.value.trim();

    if (!phone || !address) {
        alert(window.translateText("Iltimos, telefon raqami va manzilni to'liq kiriting!"));
        return;
    }

    // Orders jadvaliga yangi ustunlar bilan ma'lumot qo'shish
    const { error } = await supabaseClient.from('orders').insert(
        basket.map(i => ({
            paving_stone_name: i.name,
            paving_stone_price: i.price,
            paving_stone_square: i.qty,
            paving_stone_full_price: i.total,
            customer_phone_number: phone,      // Yangi ustun
            customer_address: address          // Yangi ustun
        }))
    );

    if (error) {
        alert(window.translateText("Buyurtmani saqlashda xatolik: ") + error.message);
    } else {
        // Muvaffaqiyatli saqlangach chekni chop etamiz
        runReceiptPrint(phone, address);

        // Jarayon yakunlangach tozalash
        closeCustomerModal();
        basket = [];
        renderBasket();
    }
};