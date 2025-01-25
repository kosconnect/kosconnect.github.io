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
        const user = data.user;
        if (user && user.fullname) {
          userNameElement.textContent = user.fullname;
        } else if (userRole) {
          userNameElement.textContent = userRole;
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        if (userRole) {
          userNameElement.textContent = userRole;
        }
      });
  } else {
    headerDefault.style.display = "block";
    headerLogin.style.display = "none";
  }

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

  // Login and Register Redirect Functions
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

  // Kategori dan Search
  const headerCategoryList = document.getElementById("category-list-header");
  const loginCategoryList = document.getElementById("category-list-login");
  const welcomeText = document.getElementById("welcome-text");
  const menuGrid = document.getElementById("menuGrid");
  const searchInput = document.getElementById("searchInput");

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
          // Pastikan data kategori valid sebelum dirender
          renderCategories(categories, headerCategoryList);
          renderCategories(categories, loginCategoryList);
        } else {
          console.error("No categories found");
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  // Fungsi untuk merender kategori ke elemen DOM
  function renderCategories(categories, targetElement) {
    targetElement.innerHTML = ""; // Bersihkan elemen target terlebih dahulu
    categories.forEach((category) => {
      const categoryButton = document.createElement("button");
      categoryButton.textContent = category.name;
      categoryButton.dataset.categoryId = category.category_id; // Simpan ID kategori di dataset
      categoryButton.addEventListener("click", () => {
        filterDataByCategory(category.category_id, category.name);
      });
      targetElement.appendChild(categoryButton);
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

  // Fungsi untuk mengambil data kamar dari backend dan render ke halaman
  function renderRooms() {
    const menuGrid = document.getElementById("menuGrid");
    menuGrid.innerHTML = ""; // Bersihkan elemen grid
    fetch("https://kosconnect-server.vercel.app/api/rooms/home")
      .then((response) => response.json())
      .then((roomsData) => {
        if (Array.isArray(roomsData)) {
          menuGrid.innerHTML = ""; // Bersihkan grid sebelum menambahkan kartu baru
          roomsData.forEach((room) => {
            // Elemen kartu kamar
            const card = document.createElement("div");
            card.className = "room-card";

            // Gambar kamar
            const image = document.createElement("img");
            image.src = room.images[0] || "placeholder-image-url.jpg"; // Gunakan placeholder jika tidak ada gambar
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

            // Alamat dengan ikon
            const address = document.createElement("p");
            address.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${room.address}`;
            card.appendChild(address);

            // Jumlah kamar tersedia dengan ikon
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
              priceText = `Rp ${room.price.monthly.toLocaleString(
                "id-ID"
              )} / bulan`;
            } else if (room.price.semi_annual) {
              priceText = `Rp ${room.price.semi_annual.toLocaleString(
                "id-ID"
              )} / 6 bulan`;
            } else if (room.price.yearly) {
              priceText = `Rp ${room.price.yearly.toLocaleString(
                "id-ID"
              )} / tahun`;
            }
            price.textContent = priceText;
            price.className = "price";
            card.appendChild(price);

            // Tambahkan event listener untuk handle booking
            card.addEventListener("click", () => handleBooking(room.owner_id));

            // Tambahkan kartu ke grid
            menuGrid.appendChild(card);
          });
        } else {
          console.error("Data kamar tidak dalam format array");
        }
      })
      .catch((error) => console.error("Error fetching rooms data:", error));
  }

  // Fungsi untuk merender kamar ke elemen menuGrid
  function renderRooms(rooms) {
    const menuGrid = document.getElementById("menuGrid");
    menuGrid.innerHTML = ""; // Bersihkan elemen menuGrid sebelum menampilkan hasil pencarian

    if (rooms.length === 0) {
      menuGrid.innerHTML = "<p>Tidak ada hasil ditemukan.</p>";
      return;
    }

    rooms.forEach((room) => {
      const roomCard = document.createElement("div");
      roomCard.className = "room-card";

      roomCard.innerHTML = `
      <h3>${room.room_name}</h3>
      <p>${room.address}</p>
      <p>Harga: ${Object.values(room.price)[0]} / ${
        Object.keys(room.price)[0]
      }</p>
      <p>Kategori: ${room.category_name}</p>
      <p>Status: ${room.status}</p>
    `;

      menuGrid.appendChild(roomCard);
    });
  }

  // Fungsi untuk mencari kamar berdasarkan semua atribut
  function searchKos() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
      console.warn("Query kosong, menampilkan semua data.");
      fetchRooms(); // Jika input kosong, tampilkan semua data
      return;
    }

    fetch("https://kosconnect-server.vercel.app/api/rooms/home")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data kamar.");
        }
        return response.json();
      })
      .then((rooms) => {
        // Filter kamar berdasarkan semua atribut
        const filteredRooms = rooms.filter((room) =>
          Object.values(room).some((value) =>
            value.toString().toLowerCase().includes(query)
          )
        );
        renderRooms(filteredRooms); // Tampilkan hasil pencarian
      })
      .catch((error) => console.error("Error searching rooms:", error));
  }

  // Fungsi untuk mengambil semua data kamar
  function fetchRooms() {
    fetch("https://kosconnect-server.vercel.app/api/rooms/home")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data kamar.");
        }
        return response.json();
      })
      .then((rooms) => renderRooms(rooms))
      .catch((error) => console.error("Error fetching rooms:", error));
  }

  // Event listener untuk pencarian
  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");

    // Ambil semua data kamar saat halaman dimuat
    fetchRooms();

    // Event listener untuk pencarian dengan tombol
    const searchButton = document.querySelector(".search-button");
    searchButton.addEventListener("click", searchKos);

    // Event listener untuk pencarian dengan tombol Enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchKos();
      }
    });
  });

  // Panggil fetchCategories dan renderRooms saat halaman dimuat
  fetchCategories();
  renderRooms();
});
