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
    const termTranslations = {
      monthly: "Bulanan",
      quarterly: "Per 3 Bulan",
      semi_annual: "Per 6 Bulan",
      yearly: "Tahunan",
    };

    // Populate price list dengan radio button tanpa bullet
    const priceList = document.getElementById("price-list");
    if (priceList) {
      priceList.innerHTML = "";

      if (roomData.price && typeof roomData.price === "object") {
        Object.entries(roomData.price).forEach(([duration, price], index) => {
          const container = document.createElement("div"); // Gunakan div agar tidak ada bullet point

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "rental_price"; // Semua radio button harus memiliki name yang sama
          radio.value = duration;
          radio.id = `price-${index}`;
          if (index === 0) radio.checked = true; // Default pilih opsi pertama

          const label = document.createElement("label");
          label.setAttribute("for", `price-${index}`);
          label.textContent = `${
            termTranslations[duration] || duration
          }: Rp ${price.toLocaleString("id-ID")}`;

          container.appendChild(radio);
          container.appendChild(label);
          priceList.appendChild(container);
        });
      }
    } else {
      console.error("Element price-list tidak ditemukan di halaman.");
    }

    // Populate custom facilities dengan checkbox tanpa bullet
    const facilitiesList = document.getElementById("custom-facilities");
    if (facilitiesList) {
      facilitiesList.innerHTML = "";

      if (Array.isArray(roomData.custom_facilities)) {
        roomData.custom_facilities.forEach((facility, index) => {
          const container = document.createElement("div"); // Gunakan div agar tidak ada bullet point

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "custom_facility";
          checkbox.value = facility._id;
          checkbox.id = `facility-${index}`;

          const label = document.createElement("label");
          label.setAttribute("for", `facility-${index}`);
          label.textContent = `${
            facility.name
          } - Rp ${facility.price.toLocaleString("id-ID")}`;

          container.appendChild(checkbox);
          container.appendChild(label);
          facilitiesList.appendChild(container);
        });
      }
    } else {
      console.error("Element custom-facilities tidak ditemukan di halaman.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
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
