// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Variabel global untuk menyimpan semua data orders
let allOrderData = [];

// Fungsi untuk mendapatkan data detail dari berbagai endpoint
async function fetchDetailData(endpoint, id) {
  try {
    const response = await fetch(`${endpoint}/${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Gagal mengambil data dari ${endpoint}/${id}:`, error);
    return null;
  }
}

// Fungsi untuk merender kartu transaksi ke halaman
async function renderOrderCards(orders) {
  const orderHistoryElement = document.getElementById("orderHistory");

  // Bersihkan elemen sebelumnya
  orderHistoryElement.innerHTML = "";

  if (orders.length === 0) {
    orderHistoryElement.innerHTML =
      "<p>Tidak ada transaksi yang ditemukan.</p>";
    return;
  }

  for (const order of orders.data) {
    // Ambil detail data dari berbagai endpoint
    const boardingHouse = await fetchDetailData(
      "https://kosconnect-server.vercel.app/api/boardingHouses",
      order.boarding_house_id
    );
    const room = await fetchDetailData(
      "https://kosconnect-server.vercel.app/api/rooms",
      order.room_id
    );
    const category = await fetchDetailData(
      "https://kosconnect-server.vercel.app/api/categories",
      boardingHouse?.category_id
    );
    const owner = await fetchDetailData(
      "https://kosconnect-server.vercel.app/api/users",
      boardingHouse?.owner_id
    );

    // Format tanggal
    const formattedCheckInDate = new Date(
      order.check_in_date
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedUpdatedAt = new Date(order.updated_at).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    const customFacilities = order.custom_facilities
      .map(
        (facility) =>
          `<p>${facility.name} <span>- Rp${facility.price.toLocaleString(
            "id-ID"
          )}</span></p>`
      )
      .join("");

    const paymentStatusMap = {
      pending: "Menunggu",
      settlement: "Lunas",
      expire: "Kadaluarsa",
      deny: "Ditolak atau Gagal",
    };

    const paymentStatus =
      paymentStatusMap[order.payment_status] || "Tidak Diketahui";

    // Komponen informasi kos
    const kosDetails = `
      <p><strong>Nama Kos:</strong> ${boardingHouse?.name || "Tidak Diketahui"}</p>
      <p><strong>Tipe Kamar:</strong> ${room?.room_type || "Tidak Diketahui"}</p>
      <p><strong>Kategori:</strong> ${category?.name || "Tidak Diketahui"}</p>
      <p><strong>Alamat:</strong> ${boardingHouse?.address || "Tidak Diketahui"}</p>
      <p><strong>Nama Pemilik:</strong> ${owner?.fullname || "Tidak Diketahui"}</p>
    `;

    // Komponen rincian biaya
    const biayaDetails = `
      <p><strong>Harga Sewa:</strong> Rp${order.price.toLocaleString("id-ID")} / ${order.payment_term}</p>
      <p><strong>Biaya Fasilitas:</strong> Rp${order.facilities_price.toLocaleString("id-ID")}</p>
      <p><strong>PPN:</strong> Rp${order.ppn.toLocaleString("id-ID")}</p>
      <p class="total"><strong>Total:</strong> Rp${order.total.toLocaleString("id-ID")}</p>
    `;

    // Tombol bayar sekarang (jika status pending)
    let actionElement = "";
    if (order.payment_status === "pending") {
      actionElement = `
        <a href="https://kosconnect-server.vercel.app/transactions/${order.transaction_id}/payment" class="pay-now-button">
          Bayar Sekarang
        </a>`;
    } else if (order.payment_status === "settlement") {
      actionElement = `
        <p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>
        <p class="updated-at">Diupdate: ${formattedUpdatedAt}</p>`;
    }

    // Buat elemen order-card
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="left-section">
        <div class="left-header">
          <div class="brand-logo">
            <img src="/img/logokos.png" alt="Logo">
            <h4>KosConnect</h4>
          </div>
          <h4 class="order-title">${order.transaction_code}</h4>
        </div>
        <div class="order-details">
          <div class="kos-details">${kosDetails}</div>
          <div class="user-details">
            <p><strong>Nama Pemesan:</strong> ${order.personal_info.full_name}</p>
            <p><strong>Jenis Kelamin:</strong> ${order.personal_info.gender}</p>
            <p><strong>Email:</strong> ${order.personal_info.email}</p>
            <p><strong>Nomor HP:</strong> ${order.personal_info.phone_number}</p>
            <p><strong>Alamat:</strong> ${order.personal_info.address}</p>
          </div>
          <div class="biaya-details">${biayaDetails}</div>
        </div>
      </div>
      <div class="right-section" data-status="${order.payment_status}">
        <i class="status-icon"></i>
        <p class="status">${paymentStatus}</p>
        ${actionElement}
      </div>
    `;

    orderHistoryElement.appendChild(card);
  }

  // Atur ikon status setelah rendering
  setStatusIcons();
}

// Fungsi untuk mengatur ikon status pembayaran
function setStatusIcons() {
  const rightSections = document.querySelectorAll(".right-section");

  rightSections.forEach((section) => {
    const statusIcon = section.querySelector(".status-icon");
    const statusText = section.getAttribute("data-status");

    // Reset class ikon
    statusIcon.className = "status-icon";

    // Atur ikon berdasarkan status
    switch (statusText) {
      case "pending":
        statusIcon.classList.add("fa-solid", "fa-hourglass-half");
        statusIcon.style.color = "#f1c40f"; // Kuning
        break;
      case "settlement":
        statusIcon.classList.add("fa-solid", "fa-circle-check");
        statusIcon.style.color = "#27ae60"; // Hijau
        break;
      case "expire":
      case "deny":
        statusIcon.classList.add("fa-solid", "fa-circle-xmark");
        statusIcon.style.color = "#e74c3c"; // Merah
        break;
      default:
        statusIcon.classList.add("fa-solid", "fa-question");
        statusIcon.style.color = "#7f8c8d"; // Abu-abu
        break;
    }
  });
}

// Ambil data kos saat halaman dimuat
window.onload = async () => {
  try {
    const authToken = getCookie("authToken");
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    allOrderData = await response.json();
    await renderOrderCards(allOrderData);

    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};