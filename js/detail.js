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

// Fungsi untuk merender detail kamar
async function renderRoomDetail(data) {
  if (!data) return;

  document.getElementById("room-name").textContent = data.room_name;
  document.getElementById("gambarUtama").src =
    data.all_images[0] || "img/default.jpg";

  const thumbnailContainer = document.getElementById("thumbnailContainer");
  thumbnailContainer.innerHTML = "";

  data.all_images.forEach((imgSrc, index) => {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.classList.add("thumbnail");
    img.onclick = () => {
      document.getElementById("gambarUtama").src = imgSrc;
    };
    thumbnailContainer.appendChild(img);

    if (index === data.all_images.length - 1) {
      const viewAllButton = document.createElement("button");
      viewAllButton.textContent = "Lihat Semua Foto";
      viewAllButton.classList.add("view-all");
      viewAllButton.onclick = tampilkanModal;
      thumbnailContainer.appendChild(viewAllButton);
    }
  });

  document.getElementById(
    "size"
  ).textContent = `Kategori: ${data.category_name}`;
  document.getElementById(
    "availability"
  ).textContent = `Tersedia: ${data.number_available}`;
  document.getElementById(
    "owner"
  ).textContent = `Pemilik: ${data.owner_fullname}`;

  const priceList = document.getElementById("price-list");
  priceList.innerHTML = "";

  const priceTypes = {
    monthly: "bulan",
    quarterly: "3 bulan",
    semi_annual: "6 bulan",
    yearly: "tahun",
  };

  Object.entries(priceTypes).forEach(([key, label]) => {
    if (data.price[key]) {
      const priceItem = document.createElement("li");
      priceItem.textContent = `Rp ${data.price[key].toLocaleString(
        "id-ID"
      )} / ${label}`;
      priceList.appendChild(priceItem);
    }
  });

  document.querySelector("#desc p").textContent = data.description;
  document.querySelector("#rules p").textContent = data.rules;

  const generalFacilityList = document.querySelector("#generalFacility ul");
  generalFacilityList.innerHTML = data.facilities
    .map((facility) => `<li>${facility.name}</li>`)
    .join("");

  const roomFacilityList = document.querySelector("#roomFacility ul");
  roomFacilityList.innerHTML = data.room_facilities
    .map((facility) => `<li>${facility.name}</li>`)
    .join("");

  const customFacilityContainer = document.getElementById(
    "customFasilitasContainer"
  );
  customFacilityContainer.innerHTML = data.custom_facilities
    .map(
      (facility) => `
    <div class="custom-item">
      <span>${
        facility.name
      }</span> - <span>Rp ${facility.price.toLocaleString()}</span>
    </div>
  `
    )
    .join("");
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
      throw new Error("Gagal mengambil data kamar");
    }

    const roomData = await response.json();
    console.log("Room Data:", roomData.data);
    renderRoomDetail(roomData.data);

    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};