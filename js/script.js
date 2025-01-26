// Variabel global untuk menyimpan semua data kos
let allKosData = [];
// Elemen search input
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", searchKos); // Tambahkan event listener
}

// Ambil data kos dari API saat halaman dimuat
window.onload = async () => {
  try {
    const response = await fetch(
      "https://kosconnect-server.vercel.app/api/rooms/home"
    );
    allKosData = await response.json(); // Simpan data global
    renderRooms(allKosData); // Render semua kos saat halaman dimuat
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};
// Fungsi untuk membaca nilai cookie berdasarkan nama
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Fungsi untuk mencari kos berdasarkan nama atau kategori
function searchKos() {
  const query = document.getElementById("search-input").value.toLowerCase(); // Ambil input pencarian
  const filteredData = allKosData.filter(
    (room) =>
      room.room_name.toLowerCase().includes(query) || // Pencarian berdasarkan nama kos
      room.category_name.toLowerCase().includes(query) // Pencarian berdasarkan kategori
  );
  renderRooms(filteredData); // Render hasil pencarian
}

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
    card.addEventListener("click", () => handleBooking(room.owner_id));
    menuGrid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
   // Ambil token dan role dari cookie
   const authToken = getCookie("authToken");
   const userRole = getCookie("userRole");
 
   // Elemen-elemen yang perlu dimodifikasi
   const navLinks = document.querySelector(".nav-links");
   
   // Fungsi untuk menampilkan menu setelah login
   const renderLoggedInMenu = (username) => {
     navLinks.innerHTML = `
       <a href="index.html"><i class="fa fa-house"></i> Beranda</a>
       <div class="dropdown" id="dropdown-category">
         <a href="#" class="profile-icon dropdown-toggle d-flex align-items-center mx-2" role="button">
           <div class="d-flex align-items-center">
             <i class="fa-solid fa-list"></i>
             <span id="kategori">Kategori</span>
           </div>
         </a>
         <div class="dropdown-category" id="category-list-header">
           <!-- Kategori akan dimuat di sini -->
         </div>
       </div>
       <a href="booking.html"><i class="fa-solid fa-receipt"></i> Pemesanan</a>
       <div class="dropdown">
         <a href="#" class="profile-icon dropdown-toggle d-flex align-items-center mx-2" id="profileDropdown" role="button">
           <div class="d-flex align-items-center">
             <i class="fa-solid fa-user me-2"></i>
             <span id="user-name">${username || "Pengguna"}</span>
           </div>
         </a>
         <div class="dropdown-menu">
           <a href="#" class="dropdown-item logout-btn" id="logout-btn">
             <i class="fa-solid fa-right-from-bracket"></i> Logout
           </a>
         </div>
       </div>
     `;
 
     // Logout logic
     const logoutBtn = document.getElementById("logout-btn");
     if (logoutBtn) {
       logoutBtn.addEventListener("click", () => {
         document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
         document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
         window.location.reload();
       });
     }
   };
 
   // Logika mengganti elemen berdasarkan authToken
   if (authToken) {
     // Fetch user data untuk mendapatkan nama pengguna
     fetch("https://kosconnect-server.vercel.app/api/users/me", {
       method: "GET",
       headers: {
         Authorization: `Bearer ${authToken}`,
       },
     })
       .then((response) => {
         if (!response.ok) {
           throw new Error("Failed to fetch user data");
         }
         return response.json();
       })
       .then((data) => {
         const user = data.user;
         renderLoggedInMenu(user?.fullname || userRole);
       })
       .catch((error) => {
         console.error("Error fetching user data:", error);
         renderLoggedInMenu(userRole);
       });
   } else {
     // Tampilkan tombol login dan register jika belum login
     navLinks.innerHTML = `
       <a href="index.html"><i class="fa fa-house"></i> Beranda</a>
       <div class="dropdown" id="dropdown-category">
         <a href="#" class="profile-icon dropdown-toggle d-flex align-items-center mx-2" role="button">
           <div class="d-flex align-items-center">
             <i class="fa-solid fa-list"></i>
             <span id="kategori">Kategori</span>
           </div>
         </a>
         <div class="dropdown-category" id="category-list-header">
           <!-- Kategori akan dimuat di sini -->
         </div>
       </div>
       <button class="btn-login" id="login-btn"><i class="fa-solid fa-user"></i> Masuk</button>
       <button class="btn-login" id="register-btn"><i class="fa-solid fa-id-card"></i> Daftar</button>
     `;
 
     // Login dan Register button logic
     const loginBtn = document.getElementById("login-btn");
     const registerBtn = document.getElementById("register-btn");
 
     if (loginBtn) {
       loginBtn.addEventListener("click", () => {
         window.location.href = "https://kosconnect.github.io/login/";
       });
     }
 
     if (registerBtn) {
       registerBtn.addEventListener("click", () => {
         window.location.href = "https://kosconnect.github.io/register/";
       });
     }
   }

  // Kategori dan Search
  // Dropdown kategori dan elemen lainnya
  const dropdownCategoryContainer = document.querySelector(
    "#dropdown-category .dropdown-category"
  );
  const welcomeText = document.getElementById("welcome-text");

  // Fungsi untuk mengambil data kategori
  function fetchCategories() {
    fetch("https://kosconnect-server.vercel.app/api/categories/", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      })
      .then((categories) => {
        if (categories && categories.length > 0) {
          renderCategories(categories);
        } else {
          console.error("No categories found");
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  // Fungsi untuk merender kategori ke dropdown
  function renderCategories(categories) {
    dropdownCategoryContainer.innerHTML = ""; // Bersihkan dropdown terlebih dahulu
    categories.forEach((category) => {
      const categoryLink = document.createElement("a");
      categoryLink.textContent = category.name;
      categoryLink.dataset.categoryId = category.category_id; // Simpan ID kategori di dataset
      categoryLink.href = "#";
      categoryLink.addEventListener("click", (e) => {
        e.preventDefault(); // Cegah reload halaman
        filterDataByCategory(category.category_id, category.name);
      });
      dropdownCategoryContainer.appendChild(categoryLink);
    });
  }

  // Filter data berdasarkan kategori
  function filterDataByCategory(categoryId, categoryName) {
    if (!categoryId) {
      console.error("Invalid categoryId passed to filterDataByCategory");
      return;
    }

    // Perbarui teks sambutan
    welcomeText.textContent = `Menampilkan hasil untuk kategori: ${categoryName}`;

    // Fetch semua data kamar dari endpoint rooms/home
    fetch("https://kosconnect-server.vercel.app/api/rooms/home", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch rooms data");
        }
        return response.json();
      })
      .then((rooms) => {
        // Filter data kamar berdasarkan category_id
        const filteredRooms = rooms.filter(
          (room) => room.category_id === categoryId
        );

        if (filteredRooms.length > 0) {
          renderRooms(filteredRooms);
        } else {
          console.warn("No rooms found for the selected category");
          welcomeText.textContent = `Tidak ada kamar yang ditemukan untuk kategori: ${categoryName}`;
          renderRooms([]); // Bersihkan tampilan jika tidak ada kamar
        }
      })
      .catch((error) =>
        console.error("Error filtering rooms by category:", error)
      );
  }
  // Panggil fetchCategories dan renderRooms saat halaman dimuat
  fetchCategories();
});
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
    window.location.href = `https://kosconnect.github.io/booking/${ownerId}`;
  }
}