// Fungsi untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

// Fungsi untuk merender detail transaksi ke halaman
async function renderCheckoutDetail(roomId) {
  if (!roomId) {
    console.error("room_id tidak ditemukan di URL.");
    return;
  }

  try {
    const authToken = getCookie("authToken");
    if (!authToken) {
      alert("Anda harus login untuk melanjutkan checkout.");
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
      return;
    }

    const userData = await userResponse.json();
    const { fullName, email, phoneNumber, address } = userData?.user;

    // Isi form dengan data user
    document.getElementById("full_name").value = fullName || "";
    document.getElementById("email").value = email || "";
    document.getElementById("whatsapp").value = phoneNumber || "";
    document.getElementById("address").value = address || "";

    // Ambil detail kamar berdasarkan roomId
    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );

    if (!roomResponse.ok) {
      console.error(`Error fetching room detail for room_id ${roomId}`);
      return;
    }

    const roomDetail = await roomResponse.json();
    const { boarding_house, priceList, custom_facilities } = roomDetail[0];

    // Update informasi kamar di halaman
    document.querySelector(".room-name").textContent =
      boarding_house?.name || "Tidak Diketahui";
    document.querySelector(".address").textContent =
      boarding_house?.address || "Alamat tidak tersedia";

    // Menampilkan daftar harga sewa
    const priceListElement = document.getElementById("price-list");
    priceListElement.innerHTML = priceList
      .map(
        (price) =>
          `<li>${price.duration}: Rp ${price.amount.toLocaleString(
            "id-ID"
          )}</li>`
      )
      .join("");

    // Menampilkan fasilitas custom
    const facilitiesElement = document.getElementById("custom-facilities");
    facilitiesElement.innerHTML = custom_facilities
      .map(
        (facility) =>
          `<li>${facility.name} - Rp ${facility.price.toLocaleString(
            "id-ID"
          )}</li>`
      )
      .join("");

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
  }
};