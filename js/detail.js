import { getCookie, renderHeader } from "./header.js";

// Fungsi untuk merender nama kamar kos di title
document.addEventListener("DOMContentLoaded", function () {
  const roomNameElement = document.getElementById("room-name");

  if (roomNameElement) {
    // Setel judul awal
    document.title = `${roomNameElement.innerText} | KosConnect`;

    // Jika teks `room-name` diubah secara dinamis, perbarui title
    const observer = new MutationObserver(() => {
      document.title = `${roomNameElement.innerText} | KosConnect`;
    });

    observer.observe(roomNameElement, { childList: true, subtree: true });
  }
});

async function renderRoomDetail(detail) {
  document.getElementById("room-name").textContent =
    detail.room_name || "Nama Kamar Tidak Diketahui";
  document.getElementById("mainImage").src =
    detail.all_images?.[0] || "img/default.jpg";

  const thumbnailContainer = document.getElementById("thumbnailContainer");
  thumbnailContainer.innerHTML = "";

  if (Array.isArray(detail.all_images)) {
    detail.all_images.forEach((imgSrc, index) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.classList.add("thumbnail");
      img.onclick = () => {
        document.getElementById("mainImage").src = imgSrc;
      };
      thumbnailContainer.appendChild(img);

      if (index === detail.all_images.length - 1) {
        const viewAllButton = document.createElement("button");
        viewAllButton.textContent = "Lihat Semua Foto";
        viewAllButton.classList.add("view-all");
        viewAllButton.onclick = tampilkanModal;
        thumbnailContainer.appendChild(viewAllButton);
      }
    });
  }

  document.getElementById("category").innerHTML = `<p>Kategori: ${
    detail.category_name || "Tidak Ada"
  }</p>`;
  document.getElementById("size").innerHTML = `<p>Ukuran: ${
    detail.size || "Tidak Ada"
  }</p>`;
  document.getElementById("availability").innerHTML = `<p>Tersedia: ${
    detail.number_available ?? "Tidak Diketahui"
  }</p>`;
  document.getElementById("owner").innerHTML = `<p>Pemilik: ${
    detail.owner_fullname || "Tidak Diketahui"
  }</p>`;

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

  const generalFacilityList = document.querySelector("#generalFacility ul");
  generalFacilityList.innerHTML = detail.facilities
    ? detail.facilities.map((facility) => `<li>${facility.name}</li>`).join("")
    : "<li>Tidak ada fasilitas</li>";

  const roomFacilityList = document.querySelector("#roomFacility ul");
  roomFacilityList.innerHTML = detail.room_facilities
    ? detail.room_facilities
        .map((facility) => `<li>${facility.name}</li>`)
        .join("")
    : "<li>Tidak ada fasilitas kamar</li>";

  const customFacilityContainer = document.getElementById(
    "customFasilitasContainer"
  );
  customFacilityContainer.innerHTML = detail.custom_facilities
    ? detail.custom_facilities
        .map(
          (facility) =>
            `<div class="custom-item"><span>${
              facility.name
            }</span> - <span>Rp ${facility.price.toLocaleString()}</span></div>`
        )
        .join("")
    : "<div>Tidak ada fasilitas tambahan</div>";
}

function tampilkanModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
  document.getElementById("modal-img").src =
    document.getElementById("gambarUtama").src;
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const thumbnails = document.querySelectorAll(".thumbnail, .main-image");
  const closeModal = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let images = [];
  let currentIndex = 0;

  thumbnails.forEach((thumb, index) => {
    images.push(thumb.src);
    thumb.addEventListener("click", () => {
      openModal(index);
    });
  });

  function openModal(index) {
    currentIndex = index;
    modalImg.src = images[currentIndex];
    modal.style.display = "flex";
  }

  function closeModalFunc() {
    modal.style.display = "none";
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex];
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex];
  }

  closeModal.addEventListener("click", closeModalFunc);
  nextBtn.addEventListener("click", nextImage);
  prevBtn.addEventListener("click", prevImage);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModalFunc();
  });
});

window.onload = async () => {
  try {
    const authToken = getCookie("authToken");
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room_id");

    if (!roomId) {
      console.error("room_id tidak ditemukan di URL.");
      return;
    }

    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gagal mengambil data kamar: ${response.statusText}`);
    }

    const roomData = await response.json();
    if (!roomData || !Array.isArray(roomData) || roomData.length === 0) {
      throw new Error("Data kamar kosong atau tidak valid.");
    }

    console.log("Room Data:", roomData[0]);
    renderRoomDetail(roomData[0]); // Ambil objek pertama dari array

    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};