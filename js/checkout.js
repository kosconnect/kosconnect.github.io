import { getCookie } from "./header.js";

const authToken = getCookie("authToken");
const userRole = getCookie("userRole");

// Ambil roomId dari URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

// Jika user sudah login, ambil data user
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
      if (user) {
        const fullname = user.fullname || "Pengguna"; // Sesuai dengan respons API
        document.getElementById("full_name").value = fullname;
        document.getElementById("email").value = user.email || "";
        document
          .getElementById("full_name")
          .setAttribute("autocomplete", "fullname");
        document.getElementById("email").setAttribute("autocomplete", "email");

        // Menampilkan nama user di dropdown
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
          userNameElement.textContent = fullname;
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Fetch data kamar
if (roomId) {
  fetch(`https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch room data");
      return response.json();
    })
    .then((detail) => {
      document.querySelector(".room-name").textContent = detail.room_name;
      document.querySelector(".address").textContent = detail.address;

      // Menampilkan harga sewa
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

      // Menampilkan fasilitas custom
      const customFasilitasContainer = document.getElementById(
        "customFasilitasContainer"
      );
      customFasilitasContainer.innerHTML = detail.custom_facilities.length
        ? detail.custom_facilities
            .map(
              (facility) =>
                `<label>
                  <input type="checkbox" name="facility[]" value="${
                    facility.name
                  }">
                  ${facility.name} - Rp ${facility.price.toLocaleString(
                  "id-ID"
                )}
                </label>`
            )
            .join("")
        : "<div>Tidak ada fasilitas tambahan</div>";
    })
    .catch((error) => {
      console.error("Error fetching room data:", error);
    });
}



//button back
const backButton = document.querySelector(".back-button");

backButton.addEventListener("click", () => {
  window.history.back();
});

// Tambahkan event listener untuk logout
document.querySelector(".logout-btn")?.addEventListener("click", () => {
  // Menampilkan konfirmasi sebelum logout
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
});