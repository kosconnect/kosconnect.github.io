// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Variabel global untuk menyimpan data transaksi
let allOrderData = [];

// Fungsi untuk merender detail transaksi dari ID transaksi
async function fetchTransactionDetails(transactionId) {
  try {
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/${transactionId}`
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil detail transaksi dengan ID ${transactionId}`);
    }

    const transactionData = await response.json();
    return transactionData;
  } catch (error) {
    console.error("Gagal mengambil detail transaksi:", error);
    return null;
  }
}

// Fungsi untuk mengambil detail kos
async function fetchRoomDetails(roomId) {
  try {
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/detail`
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil detail kos untuk room_id ${roomId}`);
    }

    const roomDetails = await response.json();
    return roomDetails[0];
  } catch (error) {
    console.error("Gagal mengambil detail kos:", error);
    return null;
  }
}

// Fungsi untuk merender kartu transaksi ke halaman
async function renderOrderCards(orders) {
  const orderHistoryElement = document.getElementById("orderHistory");
  orderHistoryElement.innerHTML = ""; // Bersihkan elemen sebelumnya

  if (orders.length === 0) {
    orderHistoryElement.innerHTML = "<p>Tidak ada transaksi yang ditemukan.</p>";
    return;
  }

  for (const order of orders.data) {
    const roomDetail = await fetchRoomDetails(order.room_id);

    if (!roomDetail) continue; // Lewati jika roomDetail tidak ditemukan

    const formattedCheckInDate = new Date(order.check_in_date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedUpdatedAt = new Date(order.updated_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formattedCreatedAt = new Date(order.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const paymentStatusMap = {
      pending: "Menunggu",
      settlement: "Lunas",
      expire: "Kadaluarsa",
      deny: "Ditolak atau Gagal",
    };

    const paymentStatus = paymentStatusMap[order.payment_status] || "Tidak Diketahui";

    const kosDetails = `
      <p><strong>${roomDetail.room_name || "Tidak Diketahui"}</strong></p>
      <p><strong>Kategori:</strong> ${roomDetail.category_name || "Tidak Diketahui"}</p>
      <p><strong>Alamat:</strong> ${roomDetail.boarding_house?.address || "Tidak Diketahui"}</p>
      <p><strong>Nama Pemilik:</strong> ${roomDetail.owner?.fullname || "Tidak Diketahui"}</p>
    `;

    const biayaDetails = `
      <p><strong>Harga Sewa:</strong> Rp ${order.price.toLocaleString("id-ID")}</p>
      <p><strong>PPN 11%:</strong> Rp ${order.ppn.toLocaleString("id-ID")}</p>
      <p class="total"><strong>Total:</strong> Rp ${order.total.toLocaleString("id-ID")}</p>
    `;

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

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="left-section">
        <div class="brand-logo">
          <img src="/img/logokos.png" alt="Logo">
          <h4>KosConnect</h4>
          <h4> - </h4>
          <h4 class="order-title">${order.transaction_code}</h4>
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

    card.addEventListener("click", () => {
      window.location.href = `https://kosconnect.github.io/invoice.html?transaction_id=${order.transaction_id}`;
    });

    orderHistoryElement.appendChild(card);
  }

  setStatusIcons();
}

// Fungsi untuk mengatur ikon status pembayaran
function setStatusIcons() {
  document.querySelectorAll(".right-section").forEach((section) => {
    const statusIcon = section.querySelector(".status-icon");
    const statusText = section.getAttribute("data-status");

    statusIcon.className = "status-icon";

    switch (statusText) {
      case "pending":
        statusIcon.classList.add("fa-solid", "fa-hourglass-half");
        statusIcon.style.color = "#f1c40f";
        break;
      case "settlement":
        statusIcon.classList.add("fa-solid", "fa-circle-check");
        statusIcon.style.color = "#27ae60";
        break;
      case "expire":
      case "deny":
        statusIcon.classList.add("fa-solid", "fa-circle-xmark");
        statusIcon.style.color = "#e74c3c";
        break;
      default:
        statusIcon.classList.add("fa-solid", "fa-question");
        statusIcon.style.color = "#7f8c8d";
        break;
    }
  });
}

// Ambil data transaksi saat halaman dimuat
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