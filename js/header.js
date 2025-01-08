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
    function deleteCookie(name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    
    // Hapus cookie yang tidak diperlukan
    deleteCookie("authToken"); // Optional: ganti jika ada cookie duplikat
    deleteCookie("userRole");
    
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
    // Elemen kategori
    const categoryList = document.getElementById("category-list");
  
    // Fetch kategori dari backend
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
        // Render kategori ke dropdown
        categories.forEach((category) => {
          const categoryItem = document.createElement("a");
          categoryItem.classList.add("dropdown-item");
          categoryItem.textContent = category.name;
          categoryItem.setAttribute("data-id", category.id); // Set ID untuk filter berdasarkan ID
          categoryList.appendChild(categoryItem);
  
          // Tambahkan event listener untuk setiap kategori
          categoryItem.addEventListener("click", (e) => {
            e.preventDefault();
            const categoryId = e.target.getAttribute("data-id");
            filterDataByCategory(categoryId, category.name);
          });
        });
      })
      .catch((error) => console.error("Error fetching categories:", error));
  
    // Fungsi untuk memfilter data berdasarkan kategori
    function filterDataByCategory(categoryId, categoryName) {
      console.log(`Filter data untuk kategori: ${categoryName} (ID: ${categoryId})`);
      // Fetch data berdasarkan ID kategori
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
          // Lakukan manipulasi DOM untuk menampilkan data kategori sesuai kebutuhan
        })
        .catch((error) => console.error("Error filtering category data:", error));
    }
  });