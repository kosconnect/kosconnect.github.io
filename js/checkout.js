// Import getCookie dan renderMinimalHeader dari header.js
import { getCookie, renderMinimalHeader } from "./header.js";

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

    // Render header setelah autentikasi sukses
    renderMinimalHeader(authToken);

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
    const { fullname, email, phoneNumber, address } = userData?.user;

    // Isi form dengan data user
    document.getElementById("full_name").value = fullname || "";
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
    console.log("Room Detail:", roomDetail); // Debugging

    // Pastikan apakah API mengembalikan array atau objek
    const roomData = Array.isArray(roomDetail) ? roomDetail[0] : roomDetail;

    const { room_name, boarding_house, priceList, custom_facilities } =
      roomData;

    // Update informasi kamar di halaman
    document.querySelector(".room-name").textContent =
      room_name || "Tidak Diketahui";
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