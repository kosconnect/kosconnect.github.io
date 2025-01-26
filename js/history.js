// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Variabel global untuk menyimpan semua data orders
let allOrderData = [];

// Fungsi untuk merender kartu transaksi ke halaman
function renderOrderCards(orders) {
  const orderHistoryElement = document.getElementById("orderHistory");

  // Bersihkan elemen sebelumnya
  orderHistoryElement.innerHTML = "";

  if (orders.length === 0) {
    orderHistoryElement.innerHTML = "<p>Tidak ada transaksi yang ditemukan.</p>";
    return;
  }

  // Render setiap transaksi
  orders.forEach((order) => {
    const formattedCheckInDate = new Date(order.check_in_date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedCreatedAt = new Date(order.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedUpdatedAt = new Date(order.updated_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const customFacilities = order.custom_facilities
      .map(
        (facility) =>
          `<p>${facility.name} <span>- Rp${facility.price.toLocaleString("id-ID")}</span></p>`
      )
      .join("");

    const paymentStatusMap = {
      pending: "Menunggu",
      settlement: "Lunas",
      expire: "Kadaluarsa",
      deny: "Ditolak atau Gagal",
    };

    const paymentStatus = paymentStatusMap[order.payment_status] || "Tidak Diketahui";

    // Buat elemen order-card
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="left-section">
        <div class="left-header">
          <h4 class="order-title">Kode Transaksi: ${order.transaction_code}</h4>
          <p class="order-date">Tanggal Check-in: ${formattedCheckInDate}</p>
        </div>
        <div class="order-details">
          <p><strong>Nama Pemesan:</strong> ${order.personal_info.full_name}</p>
          <p><strong>Alamat:</strong> ${order.personal_info.address}</p>
          <p><strong>Nomor HP:</strong> ${order.personal_info.phone_number}</p>
          <p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>
          <p><strong>Fasilitas Custom:</strong></p>
          ${customFacilities}
        </div>
        <p class="total">Total: Rp${order.total.toLocaleString("id-ID")}</p>
        <p class="created-at">Dibuat: ${formattedCreatedAt}</p>
        <p class="updated-at">Diupdate: ${formattedUpdatedAt}</p>
      </div>
      <div class="right-section" data-status="${order.payment_status}">
        <i class="status-icon"></i>
        <p class="status">${paymentStatus}</p>
      </div>
    `;

    orderHistoryElement.appendChild(card);
  });

  // Atur ikon status setelah rendering
  setStatusIcons();
}

// Fungsi untuk fetch data transaksi dari server
async function fetchOrders(token, userID) {
  try {
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/user/${userID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
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
      const response = await fetch(
        "https://kosconnect-server.vercel.app/api/rooms/home"
      );
      allKosData = await response.json();
      renderOrderCards(allOrderData);
  
      const authToken = getCookie("authToken");
      const userRole = getCookie("userRole");
      renderHeader(authToken, userRole);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };