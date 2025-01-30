// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Fungsi untuk merender detail transaksi ke halaman
async function renderCheckoutDetail(roomId, userId) {
  const checkoutElement = document.getElementById("checkout");

  // Bersihkan elemen sebelumnya
  checkoutElement.innerHTML = "";

  if (!roomId || !userId) {
    checkoutElement.innerHTML =
      "<p>Informasi kamar atau user tidak ditemukan.</p>";
    return;
  }

  try {
    // Ambil detail user berdasarkan userId
    const userResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/users/${userId}`
    );

    if (!userResponse.ok) {
      console.error(`Error fetching user detail for user_id ${userId}`);
      checkoutElement.innerHTML =
        "<p>Gagal mengambil detail user untuk transaksi ini.</p>";
      return;
    }

    const userData = await userResponse.json();
    const { full_name, email } = userData;

    // Ambil detail kamar berdasarkan roomId
    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );

    if (!roomResponse.ok) {
      console.error(`Error fetching room detail for room_id ${roomId}`);
      checkoutElement.innerHTML =
        "<p>Gagal mengambil detail kamar untuk transaksi ini.</p>";
      return;
    }

    const roomDetail = await roomResponse.json();
    const { boarding_house, room_type, price } = roomDetail[0];
    const category = roomDetail[0].category_name || "Tidak Diketahui";
    const roomName = roomDetail[0]?.room_name || "Tidak Diketahui";

    // Tampilkan detail checkout
    const checkoutDetails = `
      <div>
        <h4>Checkout</h4>
        <p><strong>Nama Pemesan:</strong> ${full_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Kamar:</strong> ${roomName}</p>
        <p><strong>Kategori:</strong> ${category}</p>
        <p><strong>Harga:</strong> Rp ${price.toLocaleString("id-ID")}</p>
        <p><strong>Alamat Kos:</strong> ${
          boarding_house?.address || "Tidak Diketahui"
        }</p>
      </div>
    `;
    checkoutElement.innerHTML = checkoutDetails;

    // Setup header dan autentikasi
    const authToken = getCookie("authToken");
    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data checkout:", error);
  }
}

// Ambil data checkout saat halaman dimuat
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  const userId = urlParams.get("user_id");

  // Panggil fungsi untuk merender checkout detail
  renderCheckoutDetail(roomId, userId);
};
