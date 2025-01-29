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
        const fullName = user.fullname || "Pengguna"; // Sesuai dengan respons API
        document.getElementById("full_name").value = fullName;
        document.getElementById("email").value = user.email || "";
        document
          .getElementById("full_name")
          .setAttribute("autocomplete", "name");
        document.getElementById("email").setAttribute("autocomplete", "email");

        // Menampilkan nama user di dropdown
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
          userNameElement.textContent = fullName;
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Fetch data kamar
if (roomId) {
  fetch(`https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch room data");
      return response.json();
    })
    .then((roomData) => {
      document.querySelector(".room-name").textContent = roomData.name;
      document.querySelector(".address").textContent = roomData.address;

      // Isi harga sewa
      const priceOptionsContainer = document.querySelector(".price-options");
      priceOptionsContainer.innerHTML = "";
      roomData.prices.forEach((price) => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="radio" name="price" value="${price.amount}">
          <ul>Rp ${price.amount.toLocaleString()} / ${price.term}</ul>
        `;
        priceOptionsContainer.appendChild(label);
      });

      // Isi fasilitas custom
      const facilitiesContainer = document.querySelector(".facilities");
      facilitiesContainer.innerHTML = "";
      roomData.customFacilities.forEach((facility) => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" name="facility[]" value="${facility.name}">
          <ul>${facility.name}</ul>
        `;
        facilitiesContainer.appendChild(label);
      });
    })
    .catch((error) => {
      console.error("Error fetching room data:", error);
    });
}

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