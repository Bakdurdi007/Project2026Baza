// 1. Supabase sozlamalari
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elementlar
const productionForm = document.getElementById('productionForm');
const productionTableBody = document.getElementById('productionTableBody');
const startBtn = document.getElementById('startBtn');

// 2. Retseptlar (1 m2 uchun sarflanadigan xomashyo kg hisobida)
const recipes = {
    "Toshbaqa seriy rang": { "Oq sement": 3.5, "Qora sement": 10, "Oq tosh": 14, "Qora tosh": 23, "Kraska 750": 0.034, "Kraska Titan": 0.01, "Ximikat": 0.031 },
    "Toshbaqa sariq rang": { "Oq sement": 3.5, "Qora sement": 10, "Oq tosh": 14, "Qora tosh": 23, "Kraska 750": 0.010, "Kraska 313": 0.006, "Kraska Titan": 0.01, "Ximikat": 0.031 },
    "Astana": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.0107, "Ximikat": 0.0345 },
    "Samarqand": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.022, "Ximikat": 0.0345 },
    "Samarqand guli": { "Oq sement": 3, "Qora sement": 10.5, "Oq tosh": 13, "Qora tosh": 23, "Kraska 750": 0.016, "Kraska 313": 0.009, "Kraska 130": 0.001, "Ximikat": 0.031 },
    "Qo'smos": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.022, "Ximikat": 0.0345 },
    "Fayz": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.0107, "Ximikat": 0.0345 },
    "Samarqand och rang": { "Qora sement": 15, "Oq tosh": 19, "Qora tosh": 23, "Kraska 750": 0.08, "Kraska 313": 0.046, "Ximikat": 0.031 },
    "Ona bola malochnoy rang": { "Qora sement": 15, "Oq tosh": 19, "Qora tosh": 23, "Kraska 313": 0.046, "Kraska 130": 0.009, "Kraska 315": 0.05, "Kraska 686": 0.045, "Ximikat": 0.031 },
    "Ona bola oq rang": { "Oq sement": 4.2, "Qora sement": 9, "Oq tosh": 15.5, "Qora tosh": 23, "Kraska 750": 0.03, "Kraska Titan": 0.007, "Ximikat": 0.031 },
    "30 ga 15": { "Oq sement": 3, "Qora sement": 12, "Oq tosh": 19, "Qora tosh": 23, "Kraska Titan": 0.005, "Kraska Saja": 0.055, "Ximikat": 0.0345 },
    "Qabamchik": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.0107, "Ximikat": 0.0345 },
    "30 ga 30 qizil rang": { "Qora sement": 15, "Oq tosh": 19, "Qora tosh": 23, "Kraska 130": 0.24, "Ximikat": 0.0345 },
    "30 ga 30 seriy rang": { "Qora sement": 15, "Oq tosh": 19, "Qora tosh": 23, "Ximikat": 0.0345 },

    // YANGLI QO'SHILGAN RETSEPTLAR (1 kv.m uchun hisoblangan)
    "Shaxmat 40x40": { "Oq sement": 1.75, "Qora sement": 19.1, "Oq tosh": 13.5, "Qora tosh": 18, "Kraska 750": 0.11, "Kraska Titan": 0.01, "Ximikat": 0.049 },
    "Aka-uka 30x15 seriy": { "Qora sement": 5, "Oq tosh": 17, "Qora tosh": 23, "Kraska Saja": 0.022, "Ximikat": 0.0345 },
    "Aka-uka 30x15 oq": { "Oq sement": 5.4, "Qora sement": 9.35, "Oq tosh": 17, "Qora tosh": 23, "Kraska Titan": 0.01, "Kraska Saja": 0.012, "Ximikat": 0.0345 },
    "Ona bola qizil": { "Qora sement": 13, "Oq tosh": 12, "Qora tosh": 17, "Daryo qumi chaya": 3, "Kraska 750": 0.10125, "Kraska 130": 0.17, "Ximikat": 0.0345 },
    "Terma panel 50x25": { "Oq sement": 5.25, "Oq tosh": 10.5, "Kraska Titan": 0.0035, "Penaplast": 8, "Metal ilgich": 16, "Ximikat": 0.010055 }, // Izoh: Penaplast va Ilgich 1 kv.m ga dona hisobida
    "30x30 oq": { "Oq sement": 4.1, "Qora sement": 7, "Oq tosh": 11, "Qora tosh": 23, "Kraska Titan": 0.006, "Ximikat": 0.0345 }
};

// 3. Bazadagi ustun nomlari xaritasi
const dbColumnsMap = {
    "Oq sement": "oq_sement", "Qora sement": "qora_sement", "Oq tosh": "oq_tosh",
    "Qora tosh": "qora_tosh", "Kraska 750": "kraska_750", "Kraska 313": "kraska_313",
    "Kraska Titan": "kraska_titan", "Kraska 130": "kraska_130", "Kraska 315": "kraska_315",
    "Kraska 686": "kraska_686", "Kraska Saja": "kraska_saja", "Ximikat": "ximikat",
    // Yangi qo'shilgan moddalar ustunlari xaritasi (bazada mos nomlar bo'lishi kerak):
    "Daryo qumi chaya": "daryo_qumi_chaya", "Penaplast": "penaplast", "Metal ilgich": "metal_ilgich"
};

let globalHistoryData = [];

// Sahifa yuklanganda tarixni olish
document.addEventListener('DOMContentLoaded', fetchProductionHistory);

async function fetchProductionHistory() {
    const { data, error } = await supabaseClient
        .from('paving_stones_history')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Ma'lumot olishda xatolik:", error);
        return;
    }

    globalHistoryData = data;
    renderTable(data);
}

function renderTable(data) {
    productionTableBody.innerHTML = '';
    if (!data || data.length === 0) {
        productionTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${window.translateText("Hozircha ma'lumot yo'q")}</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        const date = new Date(item.created_at).toLocaleString('uz-UZ');
        const displayedStoneName = window.translateText(item.paving_stones_name);
        const unitKvm = window.translateText("kv.m");
        const btnInfoText = window.translateText("Ma'lumot");

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${displayedStoneName}</strong></td>
                <td><span style="color: #10b981; font-weight: bold;">${item.quantity_produced || 0} ${unitKvm}</span></td>
                <td style="color: #6b7280;">${date}</td>
                <td>
                    <button class="info-btn" onclick="openInfoModal('${item.id}')">
                        <i class="ph ph-info"></i> ${btnInfoText}
                    </button>
                </td>
            </tr>
        `;
        productionTableBody.insertAdjacentHTML('beforeend', row);
    });
}

// 4. Ishlab chiqarish jarayoni
productionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stoneType = document.getElementById('stone_type').value;
    const square = parseFloat(document.getElementById('stone_square').value);

    if (!stoneType || !square || square <= 0) {
        alert(window.translateText("Iltimos, ma'lumotlarni to'g'ri kiriting!"));
        return;
    }

    startBtn.disabled = true;
    startBtn.textContent = window.translateText("Jarayonda...");

    try {
        const recipe = recipes[stoneType];
        let requiredMaterials = {};
        for (const [matName, valuePerMeter] of Object.entries(recipe)) {
            requiredMaterials[matName] = parseFloat((valuePerMeter * square).toFixed(3));
        }

        const { data: stockData, error: stockError } = await supabaseClient.from('products').select('*');
        if (stockError) throw stockError;

        let currentStock = {};
        stockData.forEach(item => currentStock[item.product_name] = parseFloat(item.product_massa || 0));

        let shortages = [];
        for (const [matName, req] of Object.entries(requiredMaterials)) {
            if (req > (currentStock[matName] || 0)) {
                shortages.push({
                    name: matName,
                    missing: (req - (currentStock[matName] || 0)).toFixed(3)
                });
            }
        }

        if (shortages.length > 0) {
            openWarningModal(shortages);
            throw new Error("Xomashyo yetarli emas!");
        }

        // B. Xomashyoni ayirish
        for (const [matName, used] of Object.entries(requiredMaterials)) {
            const currentItem = stockData.find(s => s.product_name === matName);
            const { error: updateErr } = await supabaseClient
                .from('products')
                .update({ product_massa: currentItem.product_massa - used })
                .eq('id', currentItem.id);
            if (updateErr) throw updateErr;
        }

        // C. Tayyor mahsulot omborini yangilash
        const { data: stoneStock, error: stoneErr } = await supabaseClient
            .from('paving_stones')
            .select('*')
            .eq('paving_stone_name', stoneType)
            .maybeSingle();

        if (stoneErr) throw stoneErr;

        if (stoneStock) {
            await supabaseClient
                .from('paving_stones')
                .update({ paving_stone_square: stoneStock.paving_stone_square + square })
                .eq('id', stoneStock.id);
        } else {
            await supabaseClient
                .from('paving_stones')
                .insert([{
                    paving_stone_name: stoneType,
                    paving_stone_square: square,
                    paving_stone_price: 0
                }]);
        }

        // D. Tarixga yozish
        let historyPayload = {
            paving_stones_name: stoneType,
            quantity_produced: square
        };

        for (const [matName, used] of Object.entries(requiredMaterials)) {
            const dbCol = dbColumnsMap[matName];
            if (dbCol) historyPayload[dbCol] = used;
        }

        const { error: histError } = await supabaseClient
            .from('paving_stones_history')
            .insert([historyPayload]);

        if (histError) throw histError;

        alert(window.translateText("Muvaffaqiyatli yakunlandi!"));
        productionForm.reset();
        fetchProductionHistory();

    } catch (err) {
        console.error("Xatolik yuz berdi:", err.message);
        if (err.message !== "Xomashyo yetarli emas!") alert("Xato: " + err.message);
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = window.translateText("Ishlab chiqarish");
    }
});

// 5. Modallar boshqaruvi
function openInfoModal(id) {
    const historyRow = globalHistoryData.find(h => String(h.id) === String(id));
    const listContainer = document.getElementById('modalMaterialList');
    listContainer.innerHTML = '';

    if (historyRow) {
        const unitKg = window.translateText("kg / dona");
        for (const [key, dbCol] of Object.entries(dbColumnsMap)) {
            const amount = historyRow[dbCol];
            if (amount && amount > 0) {
                const translatedMatName = window.translateText(key);
                listContainer.innerHTML += `
                    <li style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                        <span>${translatedMatName}</span>
                        <span style="color: #ef4444; font-weight: bold;">-${amount} ${unitKg}</span>
                    </li>`;
            }
        }
    }
    document.getElementById('infoModal').style.display = 'block';
}

function openWarningModal(shortages) {
    const listContainer = document.getElementById('warningMaterialList');
    listContainer.innerHTML = '';
    const txtMissing = window.translateText("yetishmayapti");
    const unitKg = window.translateText("kg / dona");

    shortages.forEach(item => {
        const translatedMatName = window.translateText(item.name);
        listContainer.innerHTML += `
            <li style="color: #b91c1c; padding: 5px 0;">
                <strong>${translatedMatName}</strong>: ${item.missing} ${unitKg} ${txtMissing}
            </li>`;
    });
    document.getElementById('warningModal').style.display = 'block';
}

// Modal yopish tugmalari
document.getElementById('closeInfoModal').onclick = () => document.getElementById('infoModal').style.display = 'none';
document.getElementById('closeWarningModal').onclick = () => document.getElementById('warningModal').style.display = 'none';

window.onclick = (event) => {
    if (event.target == document.getElementById('infoModal')) document.getElementById('infoModal').style.display = 'none';
    if (event.target == document.getElementById('warningModal')) document.getElementById('warningModal').style.display = 'none';
};

// 6. Til o'zgarganda jadvalni ham dinamik yangilash hodisasi
window.addEventListener('appLanguageChanged', () => {
    renderTable(globalHistoryData);
});