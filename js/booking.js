// Import getCookie dan renderHeader dari header.js
import { getCookie, renderHeader } from "./header.js";

// Fungsi utama untuk booking
const initializeBooking = () => {
  // Render header dengan memanggil renderHeader
  renderHeader();

  // Cek apakah user sudah login dengan mengambil cookie authToken
  const authToken = getCookie("authToken");

  if (!authToken) {
    alert("Silakan login terlebih dahulu untuk melanjutkan booking.");
    window.location.href = "/login.html"; // Redirect ke halaman login
    return;
  }

  // Jika user sudah login, lanjutkan proses booking
  console.log("User authenticated. Proceeding with booking...");

  // Ambil elemen form booking
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Mencegah reload halaman

      // Ambil data dari form
      const roomID = document.getElementById("roomID").value;
      const checkInDate = document.getElementById("checkInDate").value;
      const checkOutDate = document.getElementById("checkOutDate").value;

      // Validasi data form
      if (!roomID || !checkInDate || !checkOutDate) {
        alert("Mohon lengkapi semua data yang diperlukan.");
        return;
      }

      try {
        // Kirim data booking ke server
        const response = await fetch("https://kosconnect-server.vercel.app/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Sertakan token di header
          },
          body: JSON.stringify({ roomID, checkInDate, checkOutDate }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal melakukan booking.");
        }

        const result = await response.json();
        alert("Booking berhasil! ID transaksi Anda: " + result.transactionID);

        // Redirect ke halaman konfirmasi atau riwayat transaksi
        window.location.href = "/transactions.html";
      } catch (error) {
        console.error("Error during booking:", error.message);
        alert("Terjadi kesalahan: " + error.message);
      }
    });
  } else {
    console.error("Form booking tidak ditemukan di halaman.");
  }
};

// Jalankan fungsi initializeBooking saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", initializeBooking);