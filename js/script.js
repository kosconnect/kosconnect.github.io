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
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

  // Fetch categories dan render
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
        renderCategories(categories, headerCategoryList);
        renderCategories(categories, loginCategoryList);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  // Render kategori ke dropdown
  function renderCategories(categories, categoryListElement) {
    categoryListElement.innerHTML = ""; // Bersihkan dropdown sebelumnya
    categories.forEach((category) => {
      const categoryItem = document.createElement("a");
      categoryItem.classList.add("dropdown-item");
      categoryItem.textContent = category.name;
      categoryItem.setAttribute("data-id", category.id);
      categoryListElement.appendChild(categoryItem);

      categoryItem.addEventListener("click", (e) => {
        e.preventDefault();
        const categoryId = category.id;
        const categoryName = category.name;
        filterDataByCategory(categoryId, categoryName);
      });
    });
  }

  // Filter data berdasarkan kategori
  function filterDataByCategory(categoryId, categoryName) {
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
        renderRooms(categoryData.items || []);
      })
      .catch((error) => console.error("Error filtering category data:", error));
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
              priceText = `Rp ${room.price.quarterly.toLocaleString("id-ID")}`;
            } else if (room.price.monthly) {
              priceText = `Rp ${room.price.monthly.toLocaleString("id-ID")}`;
            } else if (room.price.semi_annual) {
              priceText = `Rp ${room.price.semi_annual.toLocaleString("id-ID")}`;
            } else if (room.price.yearly) {
              priceText = `Rp ${room.price.yearly.toLocaleString("id-ID")}`;
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
  // Fungsi untuk mencari kamar berdasarkan nama
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      fetch("https://kosconnect-server.vercel.app/api/rooms/home")
        .then((response) => response.json())
        .then((rooms) => {
          const filteredRooms = rooms.filter((room) =>
            room.room_name.toLowerCase().includes(query)
          );
          renderRooms(filteredRooms);
        })
        .catch((error) => console.error("Error searching rooms:", error));
    });
  }

  // Panggil fetchCategories dan renderRooms saat halaman dimuat
  fetchCategories();
  renderRooms();
});