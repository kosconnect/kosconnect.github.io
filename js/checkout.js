// Import getCookie dan renderMinimalHeader dari header.js
import { getCookie, renderMinimalHeader } from "./header.js";

let cachedUserData = null;

// Fungsi untuk merender detail transaksi ke halaman
async function renderCheckoutDetail(roomId) {
  if (!roomId) {
    console.error("room_id tidak ditemukan di URL.");
    return;
  }

  try {
    const authToken = getCookie("authToken");
    if (!authToken) {
      alert("Anda harus login untuk melanjutkan checkout.");
      return;
    }

    // Render header (anggap header tidak membutuhkan user detail lengkap)
    renderMinimalHeader(authToken);

    // Cek apakah data user sudah ada di cache
    let userData;
    if (cachedUserData) {
      userData = cachedUserData;
    } else {
      const userResponse = await fetch(
        "https://kosconnect-server.vercel.app/api/users/me",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!userResponse.ok) {
        console.error("Error fetching user detail");
        return;
      }

      userData = await userResponse.json();
      cachedUserData = userData; // Simpan ke cache
    }

    const { fullname, email } = userData?.user;

    // Isi form dengan data user
    document.getElementById("full_name").value = fullname || "";
    document.getElementById("email").value = email || "";

    // Ambil detail kamar berdasarkan roomId
    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );

    if (!roomResponse.ok) {
      console.error(`Error fetching room detail for room_id ${roomId}`);
      return;
    }

    const roomDetail = await roomResponse.json();
    console.log("Room Detail:", roomDetail); // Debugging

    // Pastikan apakah API mengembalikan array atau objek
    const roomData = Array.isArray(roomDetail) ? roomDetail[0] : roomDetail;

    // Update informasi kamar di halaman
    document.querySelector(".room-name").textContent =
      roomData.room_name || "Tidak Diketahui";
    document.querySelector(".address").textContent =
      roomData.address || "Alamat tidak tersedia";

    // Mapping untuk terjemahan term pembayaran
    const termTranslations = {
      monthly: "Bulanan",
      quarterly: "Per 3 Bulan",
      semi_annual: "Per 6 Bulan",
      yearly: "Tahunan",
    };

    // **Render Harga Sewa (Radio Button)**
    const priceList = document.getElementById("price-list");
    if (priceList) {
      priceList.innerHTML = "";

      if (roomData.price && typeof roomData.price === "object") {
        Object.entries(roomData.price).forEach(([duration, price], index) => {
          // Membuat wrapper div
          const radioWrapper = document.createElement("div");
          radioWrapper.style.display = "flex";
          radioWrapper.style.alignItems = "center"; // Untuk membuat rata tengah vertikal
          radioWrapper.style.marginBottom = "5px"; // Optional: margin bawah
          radioWrapper.style.gap = "5px"; // Optional: margin bawah

          // Membuat input radio
          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.name = "rental_price";
          radioInput.value = duration;
          radioInput.id = `price-${index}`;
          if (index === 0) radioInput.checked = true;

          // Membuat label untuk radio
          const radioLabel = document.createElement("label");
          radioLabel.setAttribute("for", radioInput.id);
          radioLabel.textContent = `Rp ${price.toLocaleString("id-ID")} / ${
            termTranslations[duration] || duration
          }`;

          // Menyusun elemen
          radioWrapper.appendChild(radioInput);
          radioWrapper.appendChild(radioLabel);
          priceList.appendChild(radioWrapper);
        });
      }
    }

    // **Render Fasilitas Custom (Checkbox)**
    const facilitiesList = document.getElementById("custom-facilities");
    if (facilitiesList) {
      facilitiesList.innerHTML = "";

      if (Array.isArray(roomData.custom_facilities)) {
        roomData.custom_facilities.forEach((facility, index) => {
          // Membuat wrapper div
          const checkboxWrapper = document.createElement("div");
          checkboxWrapper.style.display = "flex";
          checkboxWrapper.style.alignItems = "center"; // Untuk membuat rata tengah vertikal
          checkboxWrapper.style.marginBottom = "5px"; // Optional: margin bawah
          checkboxWrapper.style.gap = "5px"; // Optional: margin bawah

          // Membuat input checkbox
          const checkboxInput = document.createElement("input");
          checkboxInput.type = "checkbox";
          checkboxInput.name = "custom_facility";
          checkboxInput.value = facility._id;
          checkboxInput.id = `facility-${index}`;

          // Membuat label untuk checkbox
          const checkboxLabel = document.createElement("label");
          checkboxLabel.setAttribute("for", checkboxInput.id);
          checkboxLabel.textContent = `${
            facility.name
          } - Rp ${facility.price.toLocaleString("id-ID")}`;

          // Menyusun elemen
          checkboxWrapper.appendChild(checkboxInput);
          checkboxWrapper.appendChild(checkboxLabel);
          facilitiesList.appendChild(checkboxWrapper);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//button back
const backButton = document.querySelector(".back-button");

backButton.addEventListener("click", () => {
  window.history.back();
});

async function submitTransaction(roomId) {
  const authToken = getCookie("authToken");
  if (!authToken) {
    alert("Anda harus login untuk melanjutkan transaksi.");
    return;
  }

  // Ambil data dari formulir
  const fullName = document.getElementById("full_name").value;
  const email = document.getElementById("email").value;
  let phoneNumber = document.getElementById("phone_number").value.trim();

  // Pastikan nomor telepon diawali +62
  if (!phoneNumber.startsWith("+")) {
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "+62" + phoneNumber.slice(1);
    } else {
      phoneNumber = "+62" + phoneNumber;
    }
  }

  // Ambil pilihan harga sewa (payment_term)
  const selectedPaymentTerm = document.querySelector(
    'input[name="rental_price"]:checked'
  )?.value;

  if (!selectedPaymentTerm) {
    alert("Pilih lama sewa sebelum melanjutkan transaksi.");
    return;
  }

  // Ambil fasilitas custom yang dipilih
  const selectedFacilities = Array.from(
    document.querySelectorAll('input[name="custom_facility"]:checked')
  ).map((checkbox) => checkbox.value);

  // Ambil dan konversi tanggal check-in
  let checkInDate = document.getElementById("check_in_date").value;
  if (checkInDate) {
    const dateParts = checkInDate.split("/");
    if (dateParts.length === 3) {
      checkInDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Ubah ke format yyyy-mm-dd
    }
  }

  if (!checkInDate) {
    alert("Harap pilih tanggal check-in.");
    return;
  }

  // Cek apakah user data sudah di-cache
  if (!cachedUserData) {
    const userResponse = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!userResponse.ok) {
      alert("Gagal mengambil data pengguna.");
      return;
    }

    cachedUserData = await userResponse.json();
  }

  const userId = cachedUserData?.user?._id;
  if (!userId) {
    alert("User ID tidak ditemukan.");
    return;
  }

  // Ambil room detail untuk mendapatkan boarding_house_id & owner_id
  const roomResponse = await fetch(
    `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
  );

  if (!roomResponse.ok) {
    alert("Gagal mengambil data kamar.");
    return;
  }

  const roomData = await roomResponse.json();
  const roomInfo = Array.isArray(roomData) ? roomData[0] : roomData;

  const boardingHouseId = roomInfo?.boarding_house_id;
  const ownerId = roomInfo?.owner_id;

  if (!boardingHouseId || !ownerId) {
    alert("Data kos atau pemilik tidak ditemukan.");
    return;
  }

  // Susun data transaksi
  const transactionData = {
    personal_info: {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
    },
    custom_facilities: selectedFacilities || [],
    payment_term: selectedPaymentTerm,
    check_in_date: checkInDate,
  };

  try {
    // Kirim transaksi ke backend
    const transactionResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/transaction/?room_id=${roomId}&boarding_house_id=${boardingHouseId}&owner_id=${ownerId}&user_id=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(transactionData),
      }
    );

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.json();
      alert(`Gagal membuat transaksi: ${errorData.error}`);
      return;
    }

    const transactionResult = await transactionResponse.json();
    const transactionId = transactionResult.transaction_id;

    console.log("Transaksi berhasil dibuat:", transactionResult);

    // **Langsung request ke endpoint payment**
    const paymentResponse = await fetch(
      `https://kosconnect-server.vercel.app/transactions/${transactionId}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      alert(`Gagal membuat pembayaran: ${paymentError.error}`);
      return;
    }

    const paymentResult = await paymentResponse.json();
    const redirectURL = paymentResult.redirectURL;

    console.log("Pembayaran berhasil dibuat:", paymentResult);

    // **Redirect user ke halaman pembayaran**
    window.location.href = redirectURL;
  } catch (error) {
    console.error("Error saat mengirim transaksi:", error);
    alert("Terjadi kesalahan saat membuat transaksi.");
  }
}

document.getElementById("submit-button").addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  if (roomId) {
    submitTransaction(roomId);
  } else {
    alert("Room ID tidak ditemukan.");
  }
});

// Ambil data checkout saat halaman dimuat
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");

  // Panggil fungsi untuk merender checkout detail
  if (roomId) {
    renderCheckoutDetail(roomId);
  } else {
    console.error("room_id tidak ditemukan di URL.");
  }
};
