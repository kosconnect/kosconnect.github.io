document.addEventListener("DOMContentLoaded", () => {
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

  // Ambil token dan role dari cookie
  const authToken = getCookie("authToken");
  const userRole = getCookie("userRole");

  // Elemen header
  const headerDefault = document.querySelector(".header");
  const headerLogin = document.querySelector(".header-login");
  const userNameElement = document.getElementById("user-name");

  // Logika mengganti header berdasarkan authToken
  if (authToken) {
    headerDefault.style.display = "none";
    headerLogin.style.display = "block";

    // Fetch user data dari endpoint backend
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
        // Update nama pengguna di UI
        const user = data.user;
        if (user && user.fullname) {
          userNameElement.textContent = user.fullname;
        } else {
          console.warn("User data is incomplete. Falling back to user role.");
          if (userRole) {
            userNameElement.textContent = userRole;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        // Fallback to userRole from cookie if available
        if (userRole) {
          userNameElement.textContent = userRole;
        }
      });
  } else {
    headerDefault.style.display = "block";
    headerLogin.style.display = "none";
  }
  // function deleteCookie(name) {
  //   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // }

  // // Hapus cookie yang tidak diperlukan
  // deleteCookie("authToken"); // Optional: ganti jika ada cookie duplikat
  // deleteCookie("userRole");

  // Logout button logic
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
    });
  }
});

// Login and Register Redirect Functions
function login() {
  window.location.href = "https://kosconnect.github.io/login/";
}

function register() {
  window.location.href = "https://kosconnect.github.io/register/";
}

// kategori
document.addEventListener("DOMContentLoaded", () => {
  const headerCategoryList = document.getElementById("category-list-header");
  const loginCategoryList = document.getElementById("category-list-login");
  const welcomeText = document.getElementById("welcome-text"); //ganti sesuai kategori aktif
  const menuGrid = document.getElementById("menuGrid");

  // Fungsi fetch data kategori
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
        // Render kategori ke header dan header-login
        renderCategories(categories, headerCategoryList);
        renderCategories(categories, loginCategoryList);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  // Fungsi untuk merender kategori ke dropdown
  function renderCategories(categories, categoryListElement) {
    categories.forEach((category) => {
      const categoryItem = document.createElement("a");
      categoryItem.classList.add("dropdown-item");
      categoryItem.textContent = category.name;
      categoryItem.setAttribute("data-id", category.id);
      categoryListElement.appendChild(categoryItem);

      // Tambahkan event listener untuk setiap kategori
      categoryItem.addEventListener("click", (e) => {
        e.preventDefault();
        const categoryId = e.target.getAttribute("data-id");
        const categoryName = category.name;
        filterDataByCategory(categoryId, categoryName);
      });
    });
  }

  // Fungsi untuk memfilter data berdasarkan kategori
  function filterDataByCategory(categoryId, categoryName) {
    console.log(
      `Filter data untuk kategori: ${categoryName} (ID: ${categoryId})`
    );
    welcomeText.textContent = `Menampilkan hasil untuk kategori: ${categoryName}`;

    fetch(`https://kosconnect-server.vercel.app/api/categories/${categoryId}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch category data");
        }
        return response.json();
      })
      .then((categoryData) => {
        console.log("Filtered data:", categoryData);

        // Kosongkan menuGrid sebelum merender data baru
        menuGrid.innerHTML = "";

        // Sesuaikan rendering berdasarkan struktur data
        if (categoryData.items && Array.isArray(categoryData.items)) {
          categoryData.items.forEach((item) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("menu-item");
            itemElement.textContent = item.name; // Sesuaikan dengan struktur data
            menuGrid.appendChild(itemElement);
          });
        } else {
          console.warn("No items found in category data.");
          menuGrid.innerHTML = `<p>No items available for ${categoryName}</p>`;
        }
      })
      .catch((error) => console.error("Error filtering category data:", error));
  }

  // Panggil fetchCategories saat halaman dimuat
  fetchCategories();
});

// search-bar belum beres
// document.addEventListener("DOMContentLoaded", () => {
//   const menuGrid = document.getElementById("menuGrid");
//   const searchInput = document.getElementById("search-input");

//   // Data contoh untuk kos (bisa diganti dengan data dari API)
//   let kosData = [];

//   // Fungsi untuk memuat data kos (dari API atau data lokal)
//   function loadKosData() {
//     fetch("https://kosconnect-server.vercel.app/api/kos", {
//       method: "GET",
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to fetch kos data");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         kosData = data; // Simpan data kos ke variabel global
//         renderKos(data); // Render semua data kos
//       })
//       .catch((error) => console.error("Error loading kos data:", error));
//   }

//   // Fungsi untuk merender kos ke menuGrid
//   function renderKos(data) {
//     menuGrid.innerHTML = ""; // Kosongkan menuGrid

//     if (data.length === 0) {
//       menuGrid.innerHTML = "<p>Tidak ada hasil yang ditemukan.</p>";
//       return;
//     }

//     data.forEach((kos) => {
//       const kosElement = document.createElement("div");
//       kosElement.classList.add("menu-item");

//       // Sesuaikan dengan struktur data kos Anda
//       kosElement.innerHTML = `
//         <h3>${kos.name}</h3>
//         <p>Alamat: ${kos.address}</p>
//         <p>Harga: Rp${kos.price}</p>
//       `;

//       menuGrid.appendChild(kosElement);
//     });
//   }

//   // Fungsi untuk pencarian berdasarkan input
//   function searchKos() {
//     const query = searchInput.value.toLowerCase();

//     // Filter kosData berdasarkan query
//     const filteredKos = kosData.filter((kos) => {
//       return (
//         kos.name.toLowerCase().includes(query) || // Nama kos
//         kos.address.toLowerCase().includes(query) || // Alamat kos
//         kos.price.toString().includes(query) // Harga kos
//       );
//     });

//     renderKos(filteredKos); // Render hasil pencarian
//   }

//   // Event listener untuk pencarian dengan tombol Enter
//   searchInput.addEventListener("keyup", (e) => {
//     if (e.key === "Enter") {
//       searchKos();
//     }
//   });

//   // Panggil fungsi untuk memuat data kos saat halaman dimuat
//   loadKosData();
// });

// Data kamar kos
// const roomsData = [
//   {
//     id: 1,
//     category: "Kos Campur",
//     type: "Single Room",
//     address: "Jl. Mawar No. 10, Bandung",
//     availableRooms: 3,
//     price: 1000000,
//     image: "img/kamar1.jpeg",
//   },
//   {
//     id: 2,
//     category: "Kost Putri",
//     type: "Deluxe Room",
//     address: "Jl. Melati No. 5, Bandung",
//     availableRooms: 2,
//     price: 1500000,
//     image: "img/kamar1.jpeg",
//   },
//   {
//     id: 3,
//     category: "Kost Putra",
//     type: "VIP Room",
//     address: "Jl. Kenanga No. 8, Bandung",
//     availableRooms: 5,
//     price: 2000000,
//     image: "img/kamar1.jpeg",
//   },
//   {
//     id: 4,
//     category: "Kos Campur",
//     type: "Studio Room",
//     address: "Jl. Anggrek No. 3, Bandung",
//     availableRooms: 1,
//     price: 3000000,
//     image: "img/kamar1.jpeg",
//   },
// ];

async function fetchRooms() {
  try {
    const response = await fetch("https://kosconnect-server.vercel.app/api/rooms/home");

    // Cek jika respons tidak OK
    if (!response.ok) {
      throw new Error("Gagal mengambil data kamar dari server");
    }

    // Parse JSON dari respons
    const data = await response.json();

    // Pastikan data adalah array sebelum memproses
    if (!Array.isArray(data)) {
      throw new Error("Data yang diterima bukan array");
    }

    // Panggil fungsi render dengan data
    renderRooms(data);
  } catch (error) {
    console.error("Error saat mengambil data kamar:", error.message);
  }
}

function renderRooms(roomsData) {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = ""; // Bersihkan elemen grid

  roomsData.forEach((room) => {
    // Elemen kartu kamar
    const card = document.createElement("div");
    card.className = "room-card";

    // Gambar kamar
    const image = document.createElement("img");
    image.src = room.images[0]; // Ambil gambar pertama dari data
    image.alt = room.room_name; // Alt text untuk gambar
    card.appendChild(image);

    // Nama kamar
    const type = document.createElement("h3");
    type.textContent = room.room_name;
    card.appendChild(type);

    // Alamat
    const address = document.createElement("p");
    address.textContent = `Alamat: ${room.address}`;
    card.appendChild(address);

    // Kategori
    const category = document.createElement("p");
    category.textContent = `Kategori: ${room.category_name || "Tidak ada kategori"}`;
    card.appendChild(category);

    // Jumlah kamar tersedia
    const available = document.createElement("p");
    available.textContent = `Status: ${room.status}`;
    card.appendChild(available);

    // Harga kamar
    const price = document.createElement("p");
    let priceText = "";
    if (room.price.quarterly) {
      priceText = `Rp ${room.price.quarterly.toLocaleString("id-ID")} / 3 bulan`;
    } else if (room.price.monthly) {
      priceText = `Rp ${room.price.monthly.toLocaleString("id-ID")} / bulan`;
    } else if (room.price.semi_annual) {
      priceText = `Rp ${room.price.semi_annual.toLocaleString("id-ID")} / 6 bulan`;
    } else if (room.price.yearly) {
      priceText = `Rp ${room.price.yearly.toLocaleString("id-ID")} / tahun`;
    }
    price.textContent = `Harga: ${priceText}`;
    card.appendChild(price);

    // Tambahkan kartu ke grid
    menuGrid.appendChild(card);
  });
}

// Panggil fungsi untuk merender kamar saat halaman dimuat
document.addEventListener("DOMContentLoaded", renderRooms);

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
        // Arahkan pengguna ke halaman login
        window.location.href = "https://kosconnect.github.io/login/";
      }
    });
  } else {
    console.log("Booking oleh user untuk owner ID:", ownerId);
    // Misal arahkan ke halaman detail booking
    window.location.href = `https://kosconnect.github.io/booking/${ownerId}`;
  }
}