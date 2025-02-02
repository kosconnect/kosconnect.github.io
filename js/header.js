// Fungsi untuk membaca nilai cookie berdasarkan nama
export function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Fungsi untuk memeriksa peran pengguna sebelum mengakses fitur
export function checkUserRole() {
  const userRole = getCookie("userRole");
  if (userRole !== "user") {
    window.location.href = "https://kosconnect.github.io/"; // Redirect jika bukan user
  }
}

// Fungsi untuk merender dropdown kategori
export function renderCategories(categories, onCategoryClick) {
  const dropdownCategoryContainer = document.querySelector(
    "#category-list-header"
  );
  if (!dropdownCategoryContainer) return;

  dropdownCategoryContainer.innerHTML = ""; // Bersihkan dropdown terlebih dahulu
  categories.forEach((category) => {
    const categoryLink = document.createElement("a");
    categoryLink.textContent = category.name;
    categoryLink.dataset.categoryId = category.category_id; // Simpan ID kategori di dataset
    categoryLink.href = "#";
    categoryLink.addEventListener("click", (e) => {
      e.preventDefault(); // Cegah reload halaman
      if (onCategoryClick) onCategoryClick(category.category_id, category.name);
    });
    dropdownCategoryContainer.appendChild(categoryLink);
  });
}

// Fungsi untuk mengambil data kategori dari server
export function fetchCategories(onCategoryClick) {
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
        renderCategories(categories, onCategoryClick);
      } else {
        console.error("No categories found");
      }
    })
    .catch((error) => console.error("Error fetching categories:", error));
}

// Fungsi untuk merender menu header (login/logout, kategori, pencarian)
export function renderHeader(authToken, userRole, onSearch, onCategoryClick) {
  checkUserRole(); // Validasi akses sebelum menampilkan header

  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  // Jika user sudah login
  if (authToken) {
    fetch("https://kosconnect-server.vercel.app/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch user data");
        return response.json();
      })

      .then((data) => {
        if (data.userRole !== "user") {
          window.location.href = "https://kosconnect.github.io/"; // Redirect jika bukan user
          return;
        }
        const user = data.user;
        renderLoggedInMenu(user?.fullname || userRole);
        fetchCategories(onCategoryClick); // Panggil kategori setelah login
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        renderLoggedInMenu(userRole);
        fetchCategories(onCategoryClick);
      });
  } else {
    // Jika user belum login
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

    // Tambahkan event listener untuk login dan register
    document.getElementById("login-btn")?.addEventListener("click", () => {
      window.location.href = "https://kosconnect.github.io/login/";
    });
    document.getElementById("register-btn")?.addEventListener("click", () => {
      window.location.href = "https://kosconnect.github.io/register/";
    });

    fetchCategories(onCategoryClick); // Panggil kategori tanpa login
  }

  // Tambahkan event listener untuk input pencarian
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      if (onSearch) onSearch(e.target.value.toLowerCase());
    });
  }
}

// Fungsi untuk merender menu jika user sudah login
function renderLoggedInMenu(fullName) {
  const navLinks = document.querySelector(".nav-links");
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
       <a href="history.html"><i class="fa-solid fa-receipt"></i> Pemesanan</a>
       <div class="dropdown">
         <a href="#" class="profile-icon dropdown-toggle d-flex align-items-center mx-2" id="profileDropdown" role="button">
           <div class="d-flex align-items-center">
             <i class="fa-solid fa-user me-2"></i>
             <span id="user-name">${fullName || "Pengguna"}</span>
           </div>
         </a>
         <div class="dropdown-menu">
           <a href="#" class="dropdown-item logout-btn" id="logout-btn">
             <i class="fa-solid fa-right-from-bracket"></i> Logout
           </a>
         </div>
       </div>
    `;

  // Tambahkan event listener untuk logout dengan memanggil handleLogout()
  document
    .getElementById("logout-btn")
    ?.addEventListener("click", handleLogout);
}

// Fungsi untuk merender header minimal (hanya akun pengguna & logout)
export function renderMinimalHeader(authToken, userRole) {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  // Jika userRole bukan "user", arahkan ke halaman utama
  if (userRole !== "user") {
    window.location.href = "https://kosconnect.github.io/";
    return;
  }
  
  if (authToken) {
    fetch("https://kosconnect-server.vercel.app/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch user data");
        return response.json();
      })
      .then((data) => {
        const user = data.user;
        navLinks.innerHTML = `
          <div class="dropdown">
            <a href="#" class="profile-icon dropdown-toggle d-flex align-items-center mx-2" id="profileDropdown" role="button">
              <div class="d-flex align-items-center">
                <i class="fa-solid fa-user me-2"></i>
                <span id="user-name">${user?.fullname || "Pengguna"}</span>
              </div>
            </a>
            <div class="dropdown-menu">
              <a href="#" class="dropdown-item logout-btn" id="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
              </a>
            </div>
          </div>
        `;

        // Tambahkan event listener untuk logout dengan memanggil handleLogout()
        document
          .getElementById("logout-btn")
          ?.addEventListener("click", handleLogout);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }
}

// Fungsi untuk melakukan logout dengan konfirmasi
export function handleLogout() {
  Swal.fire({
    title: "Anda yakin ingin keluar?",
    text: "Anda akan keluar dari akun Anda!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, keluar",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      // Menghapus cookie dan logout
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "https://kosconnect.github.io/";
    }
  });
}
