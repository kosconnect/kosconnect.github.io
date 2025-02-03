// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Variabel global untuk menyimpan semua data orders
let allOrderData = [];

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
    // Ambil detail kos langsung dari endpoint
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${order.room_id}/pages`
    );

    if (!response.ok) {
      console.error(`Error fetching room detail for room_id ${order.room_id}`);
      continue; // Lewati jika detail kos tidak ditemukan
    }

    const roomDetail = await response.json();

    // Data boarding house, room, category, owner langsung diambil dari roomDetail
    const { boarding_house} = roomDetail[0];
    const category = boarding_house?.category || null;

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
<p><strong>Alamat:</strong> ${roomDetail[0]?.address || "Tidak Diketahui"}</p>
<p><strong>Nama Pemilik:</strong> ${
      roomDetail[0]?.owner_fullname || "Tidak Diketahui"
    }</p>
`;

    // Komponen rincian biaya

    // Sekarang Anda bisa menggunakan transactionDetail.price, transactionDetail.ppn, dll.
    let biayaDetails = `
        <p><strong>Harga Sewa:</strong> Rp ${(order.price ?? 0).toLocaleString(
          "id-ID"
        )} / ${paymentTermText}</p>
        <p><strong>PPN 11%:</strong> Rp ${(order.ppn ?? 0).toLocaleString(
          "id-ID"
        )}</p>
        <p class="total"><strong>Total:</strong> Rp ${(
          order.total ?? 0
        ).toLocaleString("id-ID")}</p>`;

    if (order.facilities_price) {
      biayaDetails =
        `<p><strong>Biaya Fasilitas:</strong> Rp ${order.facilities_price.toLocaleString(
          "id-ID"
        )}</p>` + biayaDetails;
    }

    // Tombol bayar sekarang (jika status pending)
    let actionElement = `
  <form action="https://kosconnect-server.vercel.app/transactions/${
    order.transaction_id
  }/payment" method="POST">
    ${
      order.payment_status === "pending"
        ? `<button type="submit" class="pay-now-button">Bayar Sekarang</button>`
        : `<p><strong>Metode Pembayaran:</strong> ${order.payment_method}</p>
       <p class="updated-at">Diupdate: ${formattedUpdatedAt}</p>`
    }
  </form>
`;

    // Buat elemen order-card
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="left-section">
        <div class="left-header">
          <div class="brand-logo">
            <img src="/img/logokos.png" alt="Logo">
            <h4>KosConnect</h4>
            <h4> - </h4>
          <h4 class="order-title">${order.transaction_code}</h4>
          </div>
        </div>
        <div class="order-details">
          <div class="kos-details">${kosDetails}</div>
          <div class="biaya-details">${biayaDetails}</div>
        </div>
      </div>
      <div class="right-section" data-status="${order.payment_status}">
        <i class="status-icon"></i>
        <p class="status">${paymentStatus}</p>
        ${actionElement}
      </div>
    `;
    // Menambahkan event listener untuk klik kartu
    card.addEventListener("click", () => {
      // Arahkan ke halaman detail transaksi dengan ID transaksi
      window.location.href = `https://kosconnect.github.io/invoice.html?transaction_id=${order.transaction_id}`;
    });

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
    await renderOrderCards(allOrderData, authToken);

    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};
