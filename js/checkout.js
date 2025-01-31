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
    const { fullname, email } = userData?.user;

    // Isi form dengan data user
    document.getElementById("full_name").value = fullname || "";
    document.getElementById("email").value = email || "";

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

    // Update informasi kamar di halaman
    document.querySelector(".room-name").textContent =
      roomData.room_name || "Tidak Diketahui";
    document.querySelector(".address").textContent =
      roomData.address || "Alamat tidak tersedia";

    // Mapping untuk terjemahan term pembayaran
    // Mapping untuk terjemahan term pembayaran
    const termTranslations = {
      monthly: "Bulanan",
      quarterly: "Per 3 Bulan",
      semi_annual: "Per 6 Bulan",
      yearly: "Tahunan",
    };

    // **Render Harga Sewa (Radio Button)**
    const priceList = document.getElementById("price-list");
    if (priceList) {
      priceList.innerHTML = "";

      if (roomData.price && typeof roomData.price === "object") {
        Object.entries(roomData.price).forEach(([duration, price], index) => {
          // Membuat wrapper div
          const radioWrapper = document.createElement("div");

          // Membuat input radio
          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = "rental_price";
          radioInput.value = duration;
          radioInput.id = `price-${index}`;
          if (index === 0) radioInput.checked = true;

          // Membuat label untuk radio
          const radioLabel = document.createElement("label");
          radioLabel.setAttribute("for", radioInput.id);
          radioLabel.textContent = `Rp ${price.toLocaleString("id-ID")} / ${
            termTranslations[duration] || duration
          }`;

          // Menyusun elemen
          radioWrapper.appendChild(radioInput);
          radioWrapper.appendChild(radioLabel);
          priceList.appendChild(radioWrapper);
        });
      }
    }

    // **Render Fasilitas Custom (Checkbox)**
    const facilitiesList = document.getElementById("custom-facilities");
    if (facilitiesList) {
      facilitiesList.innerHTML = "";

      if (Array.isArray(roomData.custom_facilities)) {
        roomData.custom_facilities.forEach((facility, index) => {
          // Membuat wrapper div
          const checkboxWrapper = document.createElement("div");

          // Membuat input checkbox
          const checkboxInput = document.createElement("input");
          checkboxInput.type = "checkbox";
          checkboxInput.name = "custom_facility";
          checkboxInput.value = facility._id;
          checkboxInput.id = `facility-${index}`;

          // Membuat label untuk checkbox
          const checkboxLabel = document.createElement("label");
          checkboxLabel.setAttribute("for", checkboxInput.id);
          checkboxLabel.textContent = `${
            facility.name
          } - Rp ${facility.price.toLocaleString("id-ID")}`;

          // Menyusun elemen
          checkboxWrapper.appendChild(checkboxInput);
          checkboxWrapper.appendChild(checkboxLabel);
          facilitiesList.appendChild(checkboxWrapper);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//button back
const backButton = document.querySelector(".back-button");

backButton.addEventListener("click", () => {
  window.history.back();
});

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
