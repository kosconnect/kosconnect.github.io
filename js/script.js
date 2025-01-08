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
        if (user && user.FullName) {
          userNameElement.textContent = user.FullName;
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

// Data kamar kos
const roomsData = [
  {
    id: 1,
    category: "Kos Campur",
    type: "Single Room",
    address: "Jl. Mawar No. 10, Bandung",
    availableRooms: 3,
    price: 1000000,
    image: "img/kamar1.jpeg",
  },
  {
    id: 2,
    category: "Kost Putri",
    type: "Deluxe Room",
    address: "Jl. Melati No. 5, Bandung",
    availableRooms: 2,
    price: 1500000,
    image: "img/kamar1.jpeg",
  },
  {
    id: 3,
    category: "Kost Putra",
    type: "VIP Room",
    address: "Jl. Kenanga No. 8, Bandung",
    availableRooms: 5,
    price: 2000000,
    image: "img/kamar1.jpeg",
  },
  {
    id: 4,
    category: "Kos Campur",
    type: "Studio Room",
    address: "Jl. Anggrek No. 3, Bandung",
    availableRooms: 1,
    price: 3000000,
    image: "img/kamar1.jpeg",
  },
];

// Fungsi untuk merender kamar kos ke dalam menuGrid
function renderRooms() {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = ""; // Bersihkan elemen grid

  roomsData.forEach((room) => {
    // Elemen kartu kamar
    const card = document.createElement("div");
    card.className = "room-card";

    // Gambar kamar
    const image = document.createElement("img");
    image.src = room.image; // Ambil gambar dari data
    image.alt = room.type; // Alt text untuk gambar
    card.appendChild(image);

    // Kategori kamar
    const category = document.createElement("p");
    category.textContent = `Kategori: ${room.category}`;
    card.appendChild(category);

    // Tipe kamar
    const type = document.createElement("h3");
    type.textContent = room.type;
    card.appendChild(type);

    // Alamat
    const address = document.createElement("p");
    address.textContent = `Alamat: ${room.address}`;
    card.appendChild(address);

    // Jumlah kamar tersedia
    const available = document.createElement("p");
    available.textContent = `Jumlah Kamar Tersedia: ${room.availableRooms}`;
    card.appendChild(available);

    // Harga kamar
    const price = document.createElement("p");
    price.textContent = `Harga: Rp ${room.price.toLocaleString()} / bulan`;
    card.appendChild(price);

    // Tombol Pesan
    const button = document.createElement("button");
    button.textContent = "Booking";
    button.className = "order-button";
    button.onclick = () => {
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
          window.location.href = "/auth/login.html";
        }
      });
    };
    card.appendChild(button);

    // Tambahkan kartu ke grid
    menuGrid.appendChild(card);
  });
}

// Panggil fungsi untuk merender kamar saat halaman dimuat
document.addEventListener("DOMContentLoaded", renderRooms);
