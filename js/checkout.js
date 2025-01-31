// Import getCookie dan renderMinimalHeader dari header.js
import { getCookie, renderMinimalHeader, setCookie } from "./header.js";

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

    renderMinimalHeader(authToken);

    // Ambil data user dari API
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

    const userData = await userResponse.json();
    setCookie("userId", userData.user._id);

    document.getElementById("full_name").value = userData.user.fullname || "";
    document.getElementById("email").value = userData.user.email || "";

    // Ambil detail kamar berdasarkan roomId
    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );

    if (!roomResponse.ok) {
      console.error(`Error fetching room detail for room_id ${roomId}`);
      return;
    }

    const roomDetail = await roomResponse.json();
    const roomData = Array.isArray(roomDetail) ? roomDetail[0] : roomDetail;

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
    setCookie("boardingHouseId", roomData.boarding_house_id);
    setCookie("ownerId", roomData.owner_id);
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

  const fullName = document.getElementById("full_name").value;
  const email = document.getElementById("email").value;
  let phoneNumber = document.getElementById("phone_number").value.trim();
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = phoneNumber.startsWith("0")
      ? "+62" + phoneNumber.slice(1)
      : "+62" + phoneNumber;
  }

  const selectedPaymentTerm = document.querySelector(
    'input[name="rental_price"]:checked'
  )?.value;
  if (!selectedPaymentTerm) {
    alert("Pilih lama sewa sebelum melanjutkan transaksi.");
    return;
  }

  const selectedFacilities = Array.from(
    document.querySelectorAll('input[name="custom_facility"]:checked')
  ).map((checkbox) => checkbox.value);

  let checkInDate = document.getElementById("check_in_date").value;
  if (checkInDate) {
    const dateParts = checkInDate.split("/");
    if (dateParts.length === 3) {
      checkInDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
  }
  if (!checkInDate) {
    alert("Harap pilih tanggal check-in.");
    return;
  }

  const userId = getCookie("userId");
  const boardingHouseId = getCookie("boardingHouseId");
  const ownerId = getCookie("ownerId");

  if (!userId || !boardingHouseId || !ownerId) {
    alert("Data transaksi tidak lengkap.");
    return;
  }

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
    window.location.href = paymentResult.redirectURL;
  } catch (error) {
    console.error("Error saat mengirim transaksi:", error);
    alert("Terjadi kesalahan saat membuat transaksi.");
  }
}

document.getElementById("submit-button")?.addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  if (roomId) {
    submitTransaction(roomId);
  } else {
    alert("Room ID tidak ditemukan.");
  }
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");
  if (roomId) {
    renderCheckoutDetail(roomId);
  } else {
    console.error("room_id tidak ditemukan di URL.");
  }
};