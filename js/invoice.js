// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Fungsi untuk merender detail transaksi ke halaman
async function renderTransactionDetail(order) {
  const orderHistoryElement = document.getElementById("orderHistory");

  // Bersihkan elemen sebelumnya
  orderHistoryElement.innerHTML = "";

  if (!order) {
    orderHistoryElement.innerHTML =
      "<p>Transaksi tidak ditemukan atau data kosong.</p>";
    return;
  }

  // Ambil detail kos langsung dari endpoint
  const response = await fetch(
    `https://kosconnect-server.vercel.app/api/rooms/${order.room_id}/pages`
  );

  if (!response.ok) {
    console.error(`Error fetching room detail for room_id ${order.room_id}`);
    orderHistoryElement.innerHTML =
      "<p>Gagal mengambil detail kos untuk transaksi ini.</p>";
    return;
  }

  const roomDetail = await response.json();

  // Data boarding house, room, category, owner langsung diambil dari roomDetail
  const { boarding_house, owner, room_type } = roomDetail[0];
  const category = boarding_house?.category || null;

  // Format tanggal
  const formattedCheckInDate = new Date(order.check_in_date).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

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
  const formattedCreatedAt = new Date(order.created_at).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const customFacilities = order.custom_facilities
    .map(
      (facility) =>
        `<p>${facility.name} <span> Rp${facility.price.toLocaleString(
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

  // Mapping untuk payment term ke bahasa Indonesia
  const paymentTermMapping = {
    monthly: "Bulanan",
    quarterly: "Per 3 Bulan",
    semi_annual: "Per 6 Bulan",
    yearly: "Tahunan",
  };

  const paymentTermText =
    paymentTermMapping[order.payment_term] || "Tidak Diketahui";

  // Komponen informasi kos
  const kosDetails = `
<p><strong> ${roomDetail[0]?.room_name || "Tidak Diketahui"}</strong></p>
<p><strong>Kategori:</strong> ${
    roomDetail[0]?.category_name || "Tidak Diketahui"
  }</p>
<p><strong></strong> ${
    roomDetail[0]?.boarding_house?.address || "Tidak Diketahui"
  }</p>
<p><strong>Pemilik:</strong> ${
    roomDetail[0]?.owner?.fullname || "Tidak Diketahui"
  }</p>
`;

  // Komponen rincian biaya
  const biayaDetails = ` 
  <p><strong>Tanggal Masuk ${formattedCheckInDate}</strong></p>
    <p><strong>Fasilitas Custom</strong> 
      ${customFacilities}</p>
      <p><strong>Biaya Fasilitas</strong> Rp ${order.facilities_price.toLocaleString(
        "id-ID"
      )}</p>
      <p><strong>Harga Sewa</strong>
      ${paymentTermText} Rp ${order.price.toLocaleString("id-ID")}</p>
      <p><strong>PPN 11%</strong> Rp ${order.ppn.toLocaleString("id-ID")}</p>
      <p class="total"><strong>Total</strong> Rp ${order.total.toLocaleString(
        "id-ID"
      )}</p>
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
  <div class="invoice-header">
    <div class="left-header">
      <div class="brand-logo">
        <img src="/img/logokos.png" alt="Logo">
        <h4>KosConnect</h4>
      </div>
    </div>
    <div class="right-header">
      <h4 class="order-title">${order.transaction_code}</h4>
    </div>
  </div>
  <div class="order-details">
  <div class="left-section">
    <div class="left-top">
      <p><strong class="title">Informasi Kos</strong></p>
      <div class="kos-details">${kosDetails}</div>
    </div>
    <div class="left-bottom">
      <div class="user-details">
      <p><strong class="title">Informasi Pemesan</strong></p>
        <p><strong>${order.personal_info.full_name}</strong> </p>
        <p>${order.personal_info.gender}</p>
        <p>${order.personal_info.email}</p>
        <p>${order.personal_info.phone_number}</p>
        <p>${order.personal_info.address}</p>
      </div>
    </div>
    </div>
    <div class="center">
    <p><strong class="title">Rincian Pesanan</strong></p>
      <div class="biaya-details">${biayaDetails}</div>
    </div>
    <div class="right">
    <p><strong class="title">Rincian Pembayaran</strong></p>
    <p><strong>${formattedCreatedAt}</strong></p>
    <div data-status="${order.payment_status}"> </div>
    <i class="status-icon"></i>
    <p class="status">${paymentStatus}</p>
    ${actionElement}
  </div>
  </div>
  
`;

  orderHistoryElement.appendChild(card);

  // Atur ikon status setelah rendering
  setStatusIcons();
}

// Fungsi untuk mengatur ikon status pembayaran
function setStatusIcons() {
  const rightSections = document.querySelectorAll(".right");

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
//a
// Ambil data kos saat halaman dimuat
window.onload = async () => {
  try {
    const authToken = getCookie("authToken");
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get("transaction_id");
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/${transactionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi");
    }

    const transactionData = await response.json();
    console.log("Transaction Data:", transactionData.data); // Log untuk debugging
    await renderTransactionDetail(transactionData.data);

    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};
