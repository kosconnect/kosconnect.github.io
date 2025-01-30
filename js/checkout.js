// Fungsi untuk merender detail transaksi ke halaman
async function renderCheckoutDetail(roomId) {
  const checkoutElement = document.getElementById("checkout");

  // Bersihkan elemen sebelumnya
  checkoutElement.innerHTML = "";

  if (!roomId) {
    checkoutElement.innerHTML = "<p>Informasi kamar tidak ditemukan.</p>";
    return;
  }

  try {
    const authToken = getCookie("authToken");
    if (!authToken) {
      checkoutElement.innerHTML =
        "<p>Anda harus login untuk melanjutkan checkout.</p>";
      return;
    }

    // Ambil detail user berdasarkan authToken
    const userResponse = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error("Error fetching user detail");
      checkoutElement.innerHTML =
        "<p>Gagal mengambil detail pengguna untuk transaksi ini.</p>";
      return;
    }

    const userData = await userResponse.json();
    const { full_name, email, user_id } = userData?.user;

    if (!user_id) {
      checkoutElement.innerHTML =
        "<p>User ID tidak ditemukan, harap login terlebih dahulu.</p>";
      return;
    }

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

  // Panggil fungsi untuk merender checkout detail
  if (roomId) {
    renderCheckoutDetail(roomId);
  } else {
    console.error("room_id tidak ditemukan di URL.");
  }
};