import { getCookie } from "./header.js";

const authToken = getCookie("authToken");
const userRole = getCookie("userRole");

// Ambil roomId dari URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

window.onload = async () => {
  try {
    if (authToken) {
      await fetchUserData(authToken);
    }
    if (roomId) {
      await fetchRoomData(roomId);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat halaman:", error);
  }
};

async function fetchUserData(token) {
  try {
    const response = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Gagal mengambil data user");

    const { user } = await response.json();
    if (!user) return;

    document.getElementById("full_name").value = user.fullname || "";
    document.getElementById("full_name").setAttribute("autocomplete", "name");

    document.getElementById("email").value = user.email || "";
    document.getElementById("email").setAttribute("autocomplete", "email");

    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = user.fullname;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

async function fetchRoomData(roomId) {
  try {
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );
    if (!response.ok) throw new Error("Gagal mengambil data kamar");

    const detail = await response.json();
    document.querySelector(".room-name").textContent = detail.room_name;
    document.querySelector(".address").textContent = detail.address;

    // Harga sewa
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
          const li = document.createElement("li");
          li.innerHTML = `
            <label>
              <input type="radio" name="price" value="${detail.price[key]}">
              Rp ${detail.price[key].toLocaleString("id-ID")} / ${label}
            </label>
          `;
          priceList.appendChild(li);
        }
      });
    }

    // Fasilitas custom
    const customFasilitasContainer = document.getElementById(
      "customFasilitasContainer"
    );
    customFasilitasContainer.innerHTML = detail.custom_facilities.length
      ? detail.custom_facilities
          .map(
            (facility) => `
        <label>
          <input type="checkbox" name="facility[]" value="${facility.name}">
          ${facility.name} - Rp ${facility.price.toLocaleString("id-ID")}
        </label>
      `
          )
          .join("")
      : "<div>Tidak ada fasilitas tambahan</div>";
  } catch (error) {
    console.error("Error fetching room data:", error);
  }
}

// Tombol kembali
const backButton = document.querySelector(".back-button");
if (backButton) {
  backButton.addEventListener("click", () => window.history.back());
}

// Logout
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
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
        document.cookie =
          "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "https://kosconnect.github.io/";
      }
    });
  });
}
