// Supabase sozlamalari (Mijoz arxitekturasiga moslab tuzatildi)
const SUPABASE_URL = 'https://xnyzlfzosefqvmqqrhnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXpsZnpvc2VmcXZtcXFyaG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM4MDQsImV4cCI6MjA4ODgxOTgwNH0.MQxKiR1T_cFlNFk_f4s3CkOOW8wMAawpkQf3Zh8PIJE';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sana va vaqtni milliy formatga o'tkazish (DD.MM.YYYY HH:MM)
function formatDate(dateString) {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Sarlavha uchun faqat sana formati (DD.MM.YYYY)
function formatOnlyDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

// Asosiy hisobot boshqaruv funksiyasi
async function generateReport(type) {
    let startDateId, endDateId, title, tableName;

    if (type === 'materials') {
        startDateId = 'start-date-1';
        endDateId = 'end-date-1';
        title = window.translateText("Kelib tushgan xomashyolar to'g'risida hisobot");
        tableName = "products_history";
    } else if (type === 'production') {
        startDateId = 'start-date-2';
        endDateId = 'end-date-2';
        title = window.translateText("Tayyor mahsulotlar ishlab chiqarish hisoboti");
        tableName = "paving_stones_history";
    } else if (type === 'sales') {
        startDateId = 'start-date-3';
        endDateId = 'end-date-3';
        title = window.translateText("Sotilgan mahsulotlar va tushumlar hisoboti");
        tableName = "orders";
    }

    const startDate = document.getElementById(startDateId).value;
    const endDate = document.getElementById(endDateId).value;

    if (!startDate || !endDate) {
        alert(window.translateText("Iltimos, boshlanish va tugash sanalarini kiriting!"));
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        alert(window.translateText("Boshlanish sanasi tugash sanasidan katta bo'lishi mumkin emas!"));
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .gte('created_at', startDate + 'T00:00:00Z')
            .lte('created_at', endDate + 'T23:59:59Z')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            alert(window.translateText("Ushbu davr oralig'ida ma'lumot topilmadi!"));
            return;
        }

        buildAndPrintReport(type, title, startDate, endDate, data);

    } catch (err) {
        console.error("Xatolik yuz berdi:", err);
        alert(window.translateText("Hisobot yuklashda xatolik: ") + err.message);
    }
}

// Jadval HTML-kodini simmetrik qurish funksiyasi
function buildAndPrintReport(type, title, startDate, endDate, data) {
    const printArea = document.getElementById('printArea');
    let tableHeaders = "";
    let tableRows = "";

    // Umumiy lokalizatsiya yozuvlari
    const txtJami = window.translateText("JAMI YAKUN:");
    const txtSom = window.translateText("so'm");
    const txtKg = window.translateText("kg");
    const txtM2 = window.translateText("m²");

    // 1-BO'LIM: XOMASHYOLAR
    if (type === 'materials') {
        tableHeaders = `
            <tr>
                <th width="6%">№</th>
                <th width="18%">${window.translateText("Sana / Vaqt")}</th>
                <th>${window.translateText("Xomashyo nomi")}</th>
                <th width="15%">${window.translateText("Miqdori (kg)")}</th>
                <th width="15%">${window.translateText("1 kg narxi (so'm)")}</th>
                <th width="18%">${window.translateText("Umumiy qiymati (so'm)")}</th>
            </tr>
        `;
        let totalMassa = 0, totalPrice = 0;
        data.forEach((item, index) => {
            totalMassa += (item.product_massa || 0);
            totalPrice += (item.product_price || 0);
            tableRows += `
                <tr>
                    <td class="center">${index + 1}</td>
                    <td class="center">${formatDate(item.created_at)}</td>
                    <td style="font-weight: bold;">${window.translateText(item.product_name || '-')}</td>
                    <td class="num">${(item.product_massa || 0).toLocaleString('uz-UZ')}</td>
                    <td class="num">${(item.product_price_per_1kg || 0).toLocaleString('uz-UZ')}</td>
                    <td class="num">${(item.product_price || 0).toLocaleString('uz-UZ')}</td>
                </tr>
            `;
        });
        tableRows += `
            <tr class="total-row">
                <td colspan="3" class="center">${txtJami}</td>
                <td class="num">${totalMassa.toLocaleString('uz-UZ')} ${txtKg}</td>
                <td></td>
                <td class="num">${totalPrice.toLocaleString('uz-UZ')} ${txtSom}</td>
            </tr>
        `;
    }

    // 2-BO'LIM: ISHLAB CHIQARISH
    else if (type === 'production') {
        tableHeaders = `
            <tr>
                <th width="6%">№</th>
                <th width="18%">${window.translateText("Sana / Vaqt")}</th>
                <th>${window.translateText("Ishlab chiqarilgan mahsulot")}</th>
                <th width="16%">${window.translateText("Hajmi (m²)")}</th>
                <th width="18%">${window.translateText("Sement sarfi (kg)")}</th>
                <th width="18%">${window.translateText("Tosh sarfi (kg)")}</th>
            </tr>
        `;
        let totalSquare = 0, totalCement = 0, totalStone = 0;
        data.forEach((item, index) => {
            totalSquare += (item.quantity_produced || 0);
            let cement = (item.oq_sement || 0) + (item.qora_sement || 0);
            let stone = (item.oq_tosh || 0) + (item.qora_tosh || 0);
            totalCement += cement;
            totalStone += stone;

            tableRows += `
                <tr>
                    <td class="center">${index + 1}</td>
                    <td class="center">${formatDate(item.created_at)}</td>
                    <td style="font-weight: bold;">${window.translateText(item.paving_stones_name || '-')}</td>
                    <td class="num">${(item.quantity_produced || 0).toLocaleString('uz-UZ')} ${txtM2}</td>
                    <td class="num">${cement.toLocaleString('uz-UZ')}</td>
                    <td class="num">${stone.toLocaleString('uz-UZ')}</td>
                </tr>
            `;
        });
        tableRows += `
            <tr class="total-row">
                <td colspan="3" class="center">${txtJami}</td>
                <td class="num">${totalSquare.toLocaleString('uz-UZ')} ${txtM2}</td>
                <td class="num">${totalCement.toLocaleString('uz-UZ')} ${txtKg}</td>
                <td class="num">${totalStone.toLocaleString('uz-UZ')} ${txtKg}</td>
            </tr>
        `;
    }

    // 3-BO'LIM: SOTUV VA ORDERS
    else if (type === 'sales') {
        tableHeaders = `
            <tr>
                <th width="6%">№</th>
                <th width="18%">${window.translateText("Sana / Vaqt")}</th>
                <th>${window.translateText("Sotilgan mahsulot nomi")}</th>
                <th width="15%">${window.translateText("Miqdori (m²)")}</th>
                <th width="15%">${window.translateText("1 m² narxi (so'm)")}</th>
                <th width="18%">${window.translateText("Umumiy summa (so'm)")}</th>
            </tr>
        `;
        let totalSquare = 0, totalSum = 0;
        data.forEach((item, index) => {
            totalSquare += (item.paving_stone_square || 0);
            totalSum += (item.paving_stone_full_price || 0);
            tableRows += `
                <tr>
                    <td class="center">${index + 1}</td>
                    <td class="center">${formatDate(item.created_at)}</td>
                    <td style="font-weight: bold;">${window.translateText(item.paving_stone_name || '-')}</td>
                    <td class="num">${(item.paving_stone_square || 0).toLocaleString('uz-UZ')} ${txtM2}</td>
                    <td class="num">${(item.paving_stone_price || 0).toLocaleString('uz-UZ')}</td>
                    <td class="num">${(item.paving_stone_full_price || 0).toLocaleString('uz-UZ')}</td>
                </tr>
            `;
        });
        tableRows += `
            <tr class="total-row">
                <td colspan="3" class="center">${txtJami}</td>
                <td class="num">${totalSquare.toLocaleString('uz-UZ')} ${txtM2}</td>
                <td></td>
                <td class="num">${totalSum.toLocaleString('uz-UZ')} ${txtSom}</td>
            </tr>
        `;
    }

    // A4 Shablon konteynerini yig'ish
    printArea.innerHTML = `
        <div class="document-header">
            <table style="width:100%; border:none; border-collapse:collapse;">
                <tr style="border:none;">
                    <td style="border:none; padding:0;">
                        <h1>${title}</h1>
                        <p>${window.translateText("Ishlab chiqarish va sotuvni avtomatlashtirish tizimi v2.0")}</p>
                    </td>
                    <td style="border:none; padding:0; text-align:right; vertical-align:top; font-size:12px; font-weight:bold;">
                        ${window.translateText("MUDDAT:")} ${formatOnlyDate(startDate)} — ${formatOnlyDate(endDate)}
                    </td>
                </tr>
            </table>
        </div>
        
        <table class="print-table">
            <thead>
                ${tableHeaders}
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div class="document-footer">
            <p>${window.translateText("Hujjat shakllantirilgan vaqt:")} ${formatDate(new Date())}</p>
            
            <table class="signature-table">
                <tr>
                    <td>
                        <div class="sig-line">${window.translateText("Mas'ul shaxs (Ombor mudiri)")}</div>
                    </td>
                    <td>
                        <div class="sig-line">${window.translateText("Tekshirdi (Buxgalter)")}</div>
                    </td>
                    <td>
                        <div class="sig-line">${window.translateText("Tasdiqlayman (Korxona rahbari)")}</div>
                    </td>
                </tr>
            </table>
        </div>
    `;

    // Print oynasini chaqirish
    window.print();
}