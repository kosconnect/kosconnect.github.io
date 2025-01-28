//percobaan
import { getCookie, renderHeader } from "./header.js";
// Variabel global untuk menyimpan semua data kos
let allKosData = [];

// Fungsi untuk merender kamar ke halaman
function renderRooms(rooms) {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = ""; // Bersihkan elemen grid sebelum render ulang
  if (rooms.length === 0) {
    menuGrid.innerHTML = "<p>Tidak ada kamar yang sesuai dengan pencarian.</p>";
    return;
  }
  rooms.forEach((room) => {
    const card = document.createElement("div");
    card.className = "room-card";

    // Gambar kamar
    const image = document.createElement("img");
    image.src = room.images[0] || "placeholder-image-url.jpg"; // Placeholder jika tidak ada gambar
    image.alt = room.room_name;
    card.appendChild(image);

    // Kategori kamar
    const category = document.createElement("h4");
    category.textContent = room.category_name;
    category.className = "text-sm mb-2";
    card.appendChild(category);

    // Nama kos/room
    const type = document.createElement("h3");
    type.textContent = room.room_name;
    type.className = "font-bold text-lg";
    card.appendChild(type);

    // Alamat
    const address = document.createElement("p");
    address.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${room.address}`;
    card.appendChild(address);

    // Jumlah kamar tersedia
    const available = document.createElement("p");
    available.innerHTML = `<i class="fas fa-door-open"></i> ${room.status}`;
    card.appendChild(available);

    // Harga kamar
    const price = document.createElement("p");
    let priceText = "";
    if (room.price.quarterly) {
      priceText = `Rp ${room.price.quarterly.toLocaleString(
        "id-ID"
      )} / 3 bulan`;
    } else if (room.price.monthly) {
      priceText = `Rp ${room.price.monthly.toLocaleString("id-ID")} / bulan`;
    } else if (room.price.semi_annual) {
      priceText = `Rp ${room.price.semi_annual.toLocaleString(
        "id-ID"
      )} / 6 bulan`;
    } else if (room.price.yearly) {
      priceText = `Rp ${room.price.yearly.toLocaleString("id-ID")} / tahun`;
    }
    price.textContent = priceText;
    price.className = "price";
    card.appendChild(price);

    // Event handler untuk booking
    card.addEventListener("click", () => handleBooking(room.room_id));
    menuGrid.appendChild(card);
  });
}
// Fungsi untuk menangani booking
function handleBooking(ownerId) {
  const authToken = getCookie("authToken"); // Ambil authToken dari cookie
  if (!authToken) {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Anda harus login terlebih dahulu untuk melakukan pemesanan.",
      icon: "warning",
      confirmButtonText: "Login",
      showCancelButton: true,
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "https://kosconnect.github.io/login/";
      }
    });
  } else {
    console.log("Booking oleh user untuk owner ID:", ownerId);
    window.location.href = `https://kosconnect.github.io/detail.html?room_id=${room.room_id}`;
  }
}

// Fungsi pencarian
function searchKos(query) {
  const filteredData = allKosData.filter(
    (room) =>
      room.room_name.toLowerCase().includes(query) ||
      room.category_name.toLowerCase().includes(query)
  );
  renderRooms(filteredData);
}

// Fungsi filter kategori
function filterDataByCategory(categoryId, categoryName) {
  const welcomeText = document.getElementById("welcome-text");
  welcomeText.textContent = `Menampilkan hasil untuk kategori: ${categoryName}`;
  const filteredData = allKosData.filter(
    (room) => room.category_id === categoryId
  );
  renderRooms(filteredData);
}

// Ambil data kos saat halaman dimuat
window.onload = async () => {
  try {
    const response = await fetch(
      "https://kosconnect-server.vercel.app/api/rooms/home"
    );
    allKosData = await response.json();
    renderRooms(allKosData);

    const authToken = getCookie("authToken");
    const userRole = getCookie("userRole");
    renderHeader(authToken, userRole, searchKos, filterDataByCategory);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};
