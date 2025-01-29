import { getCookie} from "./header.js";
const authToken = getCookie("authToken");
const userRole = getCookie("userRole");

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
        const user = data.user;
        renderLoggedInMenu(user?.fullname || userRole);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
    }
    // Tambahkan event listener untuk logout
  document.getElementById("logout-btn")?.addEventListener("click", () => {
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