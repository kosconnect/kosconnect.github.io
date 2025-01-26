// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Fungsi utama untuk booking
const displayOrders = () => {
  // Render header dengan memanggil renderHeader
  renderHeader();

  // Mendapatkan token dari cookie
  const token = getCookie("authToken");

  // Mendapatkan userID dari cookie atau sumber lain
  const userID = getCookie("userID"); // Pastikan userID disimpan dalam cookie

  if (!token || !userID) {
    console.error("Token autentikasi atau userID tidak ditemukan. Pengguna mungkin belum login.");
    return;
  }

  // Fetch data orders dari server
  fetchOrders(token, userID)
    .then((orders) => {
      // Tampilkan data orders
      displayOrderCards(orders);
    })
    .catch((error) => {
      console.error("Gagal mengambil data orders:", error);
    });
};

// Fungsi untuk fetch data orders dari server
const fetchOrders = async (token, userID) => {
  try {
    const url = `https://kosconnect-server.vercel.app/api/transaction/user/${userID}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk menampilkan data transaksi
const displayOrderCards = (orders) => {
  // Validasi bahwa orders adalah array
  if (!Array.isArray(orders.data)) {
    console.error("Data orders bukan array:", orders);
    return;
  }

  const orderHistoryElement = document.getElementById("orderHistory");

  // Validasi elemen
  if (!orderHistoryElement) {
    console.error("Elemen dengan ID 'orderHistory' tidak ditemukan di DOM.");
    return;
  }

  // Membersihkan konten sebelumnya
  orderHistoryElement.innerHTML = "";

  // Iterasi setiap transaksi
  orders.data.forEach((order) => {
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
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    orderCard.innerHTML = `
      <!-- Left Section -->
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

      <!-- Right Section -->
      <div class="right-section" data-status="${order.payment_status}">
          <i class="status-icon"></i>
          <p class="status">${paymentStatus}</p>
      </div>
    `;

    // Menambahkan card ke dalam container
    orderHistoryElement.appendChild(orderCard);
  });

  // Panggil fungsi untuk menambahkan ikon status
  setStatusIcons();
};

// Fungsi untuk mengatur ikon status pembayaran
const setStatusIcons = () => {
  const rightSections = document.querySelectorAll(".right-section");

  rightSections.forEach((section) => {
    const statusIcon = section.querySelector(".status-icon");
    const statusText = section.getAttribute("data-status");

    // Reset semua class ikon terlebih dahulu
    statusIcon.className = "status-icon";

    // Tambahkan ikon berdasarkan status pembayaran
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
        statusIcon.classList.add("fa-solid", "fa-circle-xmark");
        statusIcon.style.color = "#e74c3c"; // Merah
        break;
      case "deny":
        statusIcon.classList.add("fa-solid", "fa-circle-xmark");
        statusIcon.style.color = "#e74c3c"; // Merah
        break;
      default:
        statusIcon.classList.add("fa-solid", "fa-question");
        statusIcon.style.color = "#7f8c8d"; // Abu-abu untuk default
        break;
    }
  });
};

// Panggil fungsi utama
displayOrders();