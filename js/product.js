// Supabase infratuzilmasi ulanishi
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// DOM Elementlarini olish (1-Forma)
const productNameInput = document.getElementById('productName');
const productMassaInput = document.getElementById('productMassa');
const productPriceInput = document.getElementById('productPrice');
const addProductBtn = document.getElementById('addProductBtn');
const btnText = document.getElementById('btnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const productsTableBody = document.getElementById('productsTableBody');
const formTitle = document.getElementById('formTitle');

// DOM Elementlarini olish (2-Forma: paving_stones)
const psNameSelect = document.getElementById('pavingStoneName');
const psSquareInput = document.getElementById('pavingStoneSquare');
const psPriceInput = document.getElementById('pavingStonePrice');
const addDirectProductBtn = document.getElementById('addDirectProductBtn');

// Tahrirlash holati uchun o'zgaruvchilar
let editProductId = null;

// Sahifa yuklanganda jadvalni to'ldirish
document.addEventListener('DOMContentLoaded', fetchProducts);

// ===============================================================
// 1-QISM: MAXSULOTLAR JADVALI (products) LOGIKASI
// ===============================================================

async function fetchProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderProductsTable(data);
    } catch (err) {
        console.error("Jadvalni yuklashda xatolik:", err);
    }
}

function renderProductsTable(products) {
    productsTableBody.innerHTML = '';

    if (!products || products.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">Ma'lumot topilmadi</td>
            </tr>`;
        return;
    }

    products.forEach((product, index) => {
        const date = product.created_at ? new Date(product.created_at).toLocaleDateString('uz-UZ') : '---';
        const formattedPrice = Number(product.product_price).toLocaleString('uz-UZ');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${date}</td>
            <td><strong>${product.product_name}</strong></td>
            <td>${product.product_massa}</td>
            <td>${formattedPrice} so'm</td>
            <td>
                <button class="action-btn edit-btn" title="Tahrirlash" onclick="editProduct('${product.id}', '${product.product_name}', '${product.product_massa}', '${product.product_price}')">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="action-btn delete-btn" title="O'chirish" onclick="deleteProduct('${product.id}', '${product.product_name}')">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        `;
        productsTableBody.appendChild(tr);
    });
}

window.editProduct = function(id, name, massa, price) {
    editProductId = id;
    productNameInput.value = name;
    productMassaInput.value = massa;
    productPriceInput.value = price;

    formTitle.innerHTML = `<i class="ph ph-pencil-simple"></i> <span data-translate="Maxsulotni tahrirlash">Maxsulotni tahrirlash</span>`;
    btnText.textContent = window.translateText ? window.translateText("O'zgarishlarni saqlash") : "O'zgarishlarni saqlash";
    cancelEditBtn.style.display = 'flex';
};

cancelEditBtn.addEventListener('click', () => {
    resetFormState();
});

function resetFormState() {
    editProductId = null;
    productNameInput.value = '';
    productMassaInput.value = '';
    productPriceInput.value = '';

    formTitle.innerHTML = `<i class="ph ph-plus-circle"></i> <span data-translate="Yangi maxsulot qo'shish">Yangi maxsulot qo'shish</span>`;
    btnText.textContent = window.translateText ? window.translateText("Maxsulotni saqlash") : "Maxsulotni saqlash";
    cancelEditBtn.style.display = 'none';
}

window.deleteProduct = async function(id, name) {
    const isConfirm = confirm(`Haqiqatan ham "${name}" ni o'chirmoqchimisiz?`);
    if (!isConfirm) return;

    const columnName = name.toLowerCase().trim().replace(/\s+/g, '_');

    try {
        const { error: deleteError } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);

        if (deleteError) throw new Error("Mahsulotni o'chirishda xatolik: " + deleteError.message);

        const { error: rpcError } = await supabaseClient.rpc('drop_product_column', {
            column_name: columnName
        });

        if (rpcError) throw new Error("Ustunni o'chirishda xatolik yuz berdi: " + rpcError.message);

        alert(window.translateText ? window.translateText("Mahsulot va tegishli ustun muvaffaqiyatli o'chirildi!") : "Mahsulot va tegishli ustun muvaffaqiyatli o'chirildi!");
        await fetchProducts();

        if(editProductId === id) resetFormState();

    } catch (err) {
        console.error("Xatolik:", err);
        alert(err.message);
    }
};

addProductBtn.addEventListener('click', async () => {
    const name = productNameInput.value.trim();
    const massa = productMassaInput.value.trim();
    const price = parseFloat(productPriceInput.value);

    if (!name || !massa || isNaN(price) || price <= 0) {
        alert(window.translateText ? window.translateText("Barcha maydonlarni to'g'ri to'ldiring!") : "Barcha maydonlarni to'g'ri to'ldiring!");
        return;
    }

    const columnName = name.toLowerCase().trim().replace(/\s+/g, '_');

    try {
        addProductBtn.disabled = true;
        btnText.textContent = window.translateText ? window.translateText("Saqlanmoqda...") : "Saqlanmoqda...";

        if (editProductId) {
            const { error: updateError } = await supabaseClient
                .from('products')
                .update({
                    product_name: name,
                    product_massa: massa,
                    product_price: price
                })
                .eq('id', editProductId);

            if (updateError) throw updateError;
            alert(window.translateText ? window.translateText("Mahsulot muvaffaqiyatli yangilandi!") : "Mahsulot muvaffaqiyatli yangilandi!");

        } else {
            const { error: insertError } = await supabaseClient
                .from('products')
                .insert([{ product_name: name, product_massa: massa, product_price: price }]);

            if (insertError) throw insertError;

            const { error: rpcError } = await supabaseClient.rpc('add_product_column', {
                column_name: columnName
            });

            if (rpcError) throw rpcError;
            alert(window.translateText ? window.translateText("Maxsulot saqlandi va tarix jadvaliga qo'shildi!") : "Maxsulot saqlandi va tarix jadvaliga qo'shildi!");
        }

        resetFormState();
        await fetchProducts();

    } catch (error) {
        console.error("Xatolik:", error);
        alert(error.message);
    } finally {
        addProductBtn.disabled = false;
        btnText.textContent = editProductId ?
            (window.translateText ? window.translateText("O'zgarishlarni saqlash") : "O'zgarishlarni saqlash") :
            (window.translateText ? window.translateText("Maxsulotni saqlash") : "Maxsulotni saqlash");
    }
});


// ===============================================================
// 2-QISM: TAYYOR MAXSULOTNI TO'G'RIDAN TO'G'RI QO'SHISH (paving_stones)
// ===============================================================

addDirectProductBtn.addEventListener('click', async () => {
    const name = psNameSelect.value;
    const square = parseFloat(psSquareInput.value);
    const price = parseFloat(psPriceInput.value);

    // Validatsiya
    if (!name || isNaN(square) || square <= 0 || isNaN(price) || price < 0) {
        alert(window.translateText ? window.translateText("Iltimos, barcha maydonlarni to'g'ri to'ldiring!") : "Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
        return;
    }

    try {
        addDirectProductBtn.disabled = true;
        addDirectProductBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> <span data-translate="Jarayonda...">Jarayonda...</span>';

        // 1. Bazada ushbu maxsulot borligini tekshiramiz
        const { data: existingProduct, error: fetchError } = await supabaseClient
            .from('paving_stones')
            .select('*')
            .eq('paving_stone_name', name)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingProduct) {
            // 2. Agar mavjud bo'lsa, ustiga qo'shamiz va yangi narxini yangilaymiz (UPDATE)
            const newTotalSquare = existingProduct.paving_stone_square + square;

            const { error: updateError } = await supabaseClient
                .from('paving_stones')
                .update({
                    paving_stone_square: newTotalSquare,
                    paving_stone_price: price
                })
                .eq('id', existingProduct.id);

            if (updateError) throw updateError;
        } else {
            // 3. Agar mavjud bo'lmasa, yangi qator yaratamiz (INSERT)
            const { error: insertError } = await supabaseClient
                .from('paving_stones')
                .insert([{
                    paving_stone_name: name,
                    paving_stone_square: square,
                    paving_stone_price: price
                }]);

            if (insertError) throw insertError;
        }

        // Muvaffaqiyatli bo'lsa inputlarni tozalaymiz
        alert(window.translateText ? window.translateText("Mahsulot omborga muvaffaqiyatli qo'shildi!") : "Mahsulot omborga muvaffaqiyatli qo'shildi!");
        psNameSelect.value = '';
        psSquareInput.value = '';
        psPriceInput.value = '';

    } catch (error) {
        console.error("Omborga qo'shishda xatolik:", error);
        alert("Xatolik yuz berdi: " + error.message);
    } finally {
        addDirectProductBtn.disabled = false;
        addDirectProductBtn.innerHTML = '<i class="ph ph-database"></i> <span data-translate="Omborga qo`shish">Omborga qo`shish</span>';
    }
});