// Supabase Loyiha Sozlamalari (Loyiha standarti: supabaseClient)
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const materialForm = document.getElementById('materialForm');
const materialsTableBody = document.getElementById('materialsTableBody');
const matNameSelect = document.getElementById('mat_name');

// Sahifa yuklanganda bazadan ma'lumotlarni chaqirish
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductNames(); // Select uchun maxsulot nomlarini yuklash
    await fetchHistory();     // Jadval uchun tarixni yuklash
});

// Products jadvalidan maxsulot nomlarini olib kelish funksiyasi
async function loadProductNames() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('product_name');

        if (error) {
            console.error("Maxsulot nomlarini yuklashda xatolik:", error);
            return;
        }

        // Dastlab "Tanlang..." option'ini saqlab, qolganini tozalash
        matNameSelect.innerHTML = '<option value="" disabled selected data-translate="Tanlang...">Tanlang...</option>';

        if (data && data.length > 0) {
            // Bir xil nomlar qaytarilmasligi uchun Set orqali filtrlaymiz
            const uniqueNames = [...new Set(data.map(item => item.product_name))];

            uniqueNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.setAttribute('data-translate', name); // Ko'p tilli tizim ishlashi uchun
                matNameSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Xatolik:', err);
    }
}

// Tarixni bazadan olib kelish
async function fetchHistory() {
    const { data, error } = await supabaseClient
        .from('products_history')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Xatolik:', error);
        return;
    }

    renderHistoryTable(data);
}

// Tarix jadvalini ko'p tilli tizim asosida chizish
function renderHistoryTable(data) {
    materialsTableBody.innerHTML = '';

    if (!data || data.length === 0) {
        materialsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;" data-translate="Hozircha xomashyo kiritilmagan">
                    ${window.translateText ? window.translateText("Hozircha xomashyo kiritilmagan") : "Hozircha xomashyo kiritilmagan"}
                </td>
            </tr>`;
        return;
    }

    const txtSom = window.translateText ? window.translateText("so'm") : "so'm";
    const txtKg = window.translateText ? window.translateText("kg") : "kg";

    data.forEach(item => {
        const date = item.created_at ? new Date(item.created_at).toLocaleString('uz-UZ') : '---';
        const translatedName = window.translateText ? window.translateText(item.product_name) : item.product_name;

        const row = `
            <tr>
                <td>${item.id}</td>
                <td><strong>${translatedName}</strong></td>
                <td><span class="text-massa">${item.product_massa.toLocaleString('uz-UZ')} ${txtKg}</span></td>
                <td>${Number(item.product_price_per_1kg).toLocaleString('uz-UZ')} ${txtSom}</td>
                <td>${Number(item.product_price).toLocaleString('uz-UZ')} ${txtSom}</td>
                <td>${date}</td>
            </tr>
        `;
        materialsTableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Xomashyoni saqlash hamda hisoblash mantig'i
materialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');

    const matName = document.getElementById('mat_name').value;
    const massa = parseFloat(document.getElementById('mat_stock').value);
    const pricePerKg = parseFloat(document.getElementById('mat_cost').value);

    // Umumiy summani hisoblash
    const totalPrice = Math.round(massa * pricePerKg);

    saveBtn.disabled = true;
    saveBtn.textContent = window.translateText ? window.translateText("Saqlanmoqda...") : "Saqlanmoqda...";

    try {
        // A. Tarixga yozish (products_history jadvaliga)
        const { error: historyError } = await supabaseClient
            .from('products_history')
            .insert([{
                product_name: matName,
                product_massa: massa,
                product_price_per_1kg: pricePerKg,
                product_price: totalPrice
            }]);

        if (historyError) throw historyError;

        // B. Umumiy qoldiqni yangilash yoki yangi qo'shish (products jadvalida)
        const { data: current, error: fetchError } = await supabaseClient
            .from('products')
            .select('*')
            .eq('product_name', matName)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (current) {
            // Mavjud xomashyo hajmini yangilash
            const newTotalMassa = parseFloat(current.product_massa || 0) + massa;
            const newTotalPrice = parseFloat(current.product_price || 0) + totalPrice;

            const { error: updateError } = await supabaseClient
                .from('products')
                .update({
                    product_massa: newTotalMassa,
                    product_price: newTotalPrice
                })
                .eq('id', current.id);

            if (updateError) throw updateError;
        } else {
            // Yangi turdagi xomashyoni bazaga birinchi marta kiritish
            const { error: insertError } = await supabaseClient
                .from('products')
                .insert([{
                    product_name: matName,
                    product_massa: massa,
                    product_price: totalPrice
                }]);

            if (insertError) throw insertError;
        }

        materialForm.reset();
        await fetchHistory();
        alert(window.translateText ? window.translateText("Ma'lumotlar muvaffaqiyatli saqlandi!") : "Ma'lumotlar muvaffaqiyatli saqlandi!");

    } catch (err) {
        console.error("Xatolik:", err);
        alert(window.translateText ? window.translateText("Xatolik yuz berdi!") : "Xatolik yuz berdi!");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = window.translateText ? window.translateText("Saqlash hamda ro'yxatga qo'shish") : "Saqlash hamda ro'yxatga qo'shish";
    }
});