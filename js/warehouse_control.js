// Supabase sozlamalari
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const materialForm = document.getElementById('materialForm');
const materialsTableBody = document.getElementById('materialsTableBody');

// 1. Sahifa yuklanganda products_history jadvalidan tarixni ko'rsatamiz
document.addEventListener('DOMContentLoaded', fetchHistory);

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

// 2. Tarix jadvalini chizish
function renderHistoryTable(data) {
    materialsTableBody.innerHTML = '';

    if (!data || data.length === 0) {
        materialsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Hozircha xomashyo kiritilmagan</td></tr>';
        return;
    }

    data.forEach(item => {
        const date = item.created_at ? new Date(item.created_at).toLocaleString('uz-UZ') : '---';

        const row = `
            <tr>
                <td>${item.id}</td>
                <td><strong>${item.product_name}</strong></td>
                <td><span style="color: #2563eb; font-weight: bold;">${item.product_massa} kg</span></td>
                <td>${Number(item.product_price_per_1kg).toLocaleString()} so'm</td>
                <td>${Number(item.product_price).toLocaleString()} so'm</td>
                <td>${date}</td>
            </tr>
        `;
        materialsTableBody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. Formani saqlash mantiqi
materialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');

    const matName = document.getElementById('mat_name').value;
    const massa = parseFloat(document.getElementById('mat_stock').value);
    const pricePerKg = parseFloat(document.getElementById('mat_cost').value);

    // product_price = product_massa * product_price_per_1kg
    const totalPrice = Math.round(massa * pricePerKg);

    saveBtn.disabled = true;
    saveBtn.textContent = "Saqlanmoqda...";

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

        // B. Umumiy qoldiqni yangilash (products jadvalida)
        const { data: current, error: fetchError } = await supabaseClient
            .from('products')
            .select('*')
            .eq('product_name', matName)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (current) {
            // Mavjud mahsulotni yangilash
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
            // Yangi mahsulot qo'shish
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
        alert("Ma'lumotlar saqlandi!");

    } catch (err) {
        console.error("Xatolik:", err);
        alert("Xatolik yuz berdi!");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Saqlash hamda ro'yxatga qo'shish";
    }
});