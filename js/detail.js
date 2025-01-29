import { getCookie, renderHeader } from "./header.js";

// 🔹 Global Variables
window.allImages = [];
window.currentIndex = 0; // Pastikan variabel ini terdefinisi

// 🔹 Fungsi untuk mendekode JWT dan mengambil userId
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch (e) {
    console.error("Gagal mendekode token:", e);
    return null;
  }
}

// 🔹 Fungsi untuk merender nama kamar kos di title
document.addEventListener("DOMContentLoaded", function () {
  const roomNameElement = document.getElementById("room-name");

  if (roomNameElement) {
    document.title = `${roomNameElement.innerText} | KosConnect`;

    const observer = new MutationObserver(() => {
      document.title = `${roomNameElement.innerText} | KosConnect`;
    });

    observer.observe(roomNameElement, { childList: true, subtree: true });
  }
});

async function renderRoomDetail(detail, userId) {
  document.getElementById("room-name").textContent =
    detail.room_name || "Nama Kamar Tidak Diketahui";

  const mainImage = document.getElementById("mainImage");
  mainImage.src = detail.all_images?.[0] || ""; // Biarkan browser menangani jika kosong

  const thumbnailContainer = document.getElementById("thumbnailContainer");
  thumbnailContainer.innerHTML = "";

  let images = detail.all_images || [];
  window.allImages = images; // Simpan untuk modal

  if (images.length > 0) {
    mainImage.src = images[0] || "";

    images.slice(1, 3).forEach((imgSrc, index) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.classList.add("thumbnail");
      img.onclick = () => {
        mainImage.src = imgSrc;
        openModal(index + 1);
      };
      thumbnailContainer.appendChild(img);
    });
  }

  document.getElementById("category").innerHTML = `<p>${
    detail.category_name || "Tidak Ada"
  }</p>`;
  document.getElementById(
    "size"
  ).innerHTML = `<p><i class="fa-solid fa-ruler-combined"></i> ${
    detail.size || "Tidak Ada"
  } </p>`;
  document.getElementById(
    "availability"
  ).innerHTML = `<p><i class="fa-solid fa-door-open"></i> ${
    detail.number_available ?? "Tidak Diketahui"
  } Kamar Tersedia</p>`;
  document.getElementById(
    "address"
  ).innerHTML = `<p><i class="fa-solid fa-location-dot"></i> ${
    detail.address || "Tidak Diketahui"
  } </p>`;

  const priceList = document.getElementById("price-list");
  priceList.innerHTML = "";

  const priceTypes = {
    monthly: "bulan",
    quarterly: "3 bulan",
    semi_annual: "6 bulan",
    yearly: "tahun",
  };

  if (detail.price && typeof detail.price === "object") {
    Object.entries(priceTypes).forEach(([key, label]) => {
      if (detail.price[key]) {
        const priceItem = document.createElement("li");
        priceItem.textContent = `Rp ${detail.price[key].toLocaleString(
          "id-ID"
        )} / ${label}`;
        priceList.appendChild(priceItem);
      }
    });
  }

  document.querySelector("#desc p").textContent =
    detail.description || "Deskripsi tidak tersedia.";
  document.querySelector("#rules p").textContent =
    detail.rules || "Peraturan tidak tersedia.";

  document.querySelector("#generalFacility ul").innerHTML = detail.facilities
    ? detail.facilities.map((facility) => `<li>${facility.name}</li>`).join("")
    : "<li>Tidak ada fasilitas</li>";

  document.querySelector("#roomFacility ul").innerHTML = detail.room_facilities
    ? detail.room_facilities
        .map((facility) => `<li>${facility.name}</li>`)
        .join("")
    : "<li>Tidak ada fasilitas kamar</li>";

  document.getElementById("customFasilitasContainer").innerHTML =
    detail.custom_facilities
      ? detail.custom_facilities
          .map(
            (facility) =>
              `<div class="custom-item"><span>${
                facility.name
              }</span> - <span>Rp ${facility.price.toLocaleString()}</span></div>`
          )
          .join("")
      : "<div>Tidak ada fasilitas tambahan</div>";

  // 🔹 Tambahkan tombol Ajukan Sewa
  const rentButton = document.getElementById("rentButton");
  if (rentButton) {
    if (
      detail.owner_id &&
      detail.boarding_house_id &&
      detail.room_id &&
      userId
    ) {
      rentButton.style.display = "block";
      rentButton.onclick = () => {
        window.location.href = `https://kosconnect.github.io/checkout.html?owner_id=${detail.owner_id}&boarding_house_id=${detail.boarding_house_id}&room_id=${detail.room_id}&user_id=${userId}`;
      };
    } else {
      rentButton.style.display = "none";
    }
  }
}

// 🔹 Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const authToken = getCookie("authToken");
    const userId = authToken ? decodeToken(authToken) : null;
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room_id");

    if (!roomId) return console.error("room_id tidak ditemukan di URL.");

    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!response.ok) throw new Error(`Gagal mengambil data kamar`);

    const roomData = await response.json();
    if (!roomData || !Array.isArray(roomData) || roomData.length === 0)
      throw new Error("Data kamar kosong atau tidak valid.");

    renderRoomDetail(roomData[0], userId);
    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
});