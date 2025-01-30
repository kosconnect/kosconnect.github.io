// Import fungsi yang diperlukan dari header.js
import { getCookie, renderMinimalHeader } from "./header.js";

// Render header minimal
renderMinimalHeader();

// Ambil elemen-elemen DOM yang diperlukan
const fullNameInput = document.getElementById("full_name");
const emailInput = document.getElementById("email");
const genderSelect = document.getElementById("gender");
const whatsappInput = document.getElementById("nomor-whatsapp");
const addressTextarea = document.getElementById("address-user");
const checkinDateInput = document.getElementById("checkin-date");
const priceList = document.getElementById("price-list");
const customFacilitiesList = document.getElementById("custom-facilities");
const tanggalPindahSpan = document.getElementById("tanggal-pindah");
const hargaSewaSpan = document.getElementById("harga-sewa");
const totalHargaSpan = document.getElementById("total-harga");
const submitButton = document.querySelector("button[type='submit']");

// Ambil data user untuk autofill
async function fetchUserData() {
  try {
    const response = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        headers: { Authorization: `Bearer ${getCookie("authToken")}` },
      }
    );
    if (!response.ok) throw new Error("Gagal mengambil data pengguna");
    const user = await response.json();

    fullNameInput.value = user.fullName || "";
    emailInput.value = user.email || "";
  } catch (error) {
    console.error(error);
  }
}

// Ambil data kamar berdasarkan roomId dari URL
async function fetchRoomData() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomId");
  if (!roomId) return;

  try {
    const response = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );
    if (!response.ok) throw new Error("Gagal mengambil data kamar");
    const roomData = await response.json();

    if (roomData.length === 0) throw new Error("Data kamar tidak ditemukan");
    const room = roomData[0];

    document.querySelector(".room-name").textContent = room.room_name;
    document.querySelector(".address").textContent =
      room.boarding_house.address;

    renderPriceOptions(room.price_options);
    renderCustomFacilities(room.custom_facilities || []);
  } catch (error) {
    console.error(error);
  }
}

// Render opsi harga sewa
function renderPriceOptions(priceOptions) {
  priceList.innerHTML = "";
  priceOptions.forEach((option) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="radio" name="price" value="${
      option.price
    }" data-term="${option.term}"> ${
      option.term
    } - Rp ${option.price.toLocaleString("id-ID")}`;
    priceList.appendChild(li);
  });
}

// Render fasilitas custom
function renderCustomFacilities(facilities) {
  customFacilitiesList.innerHTML = "";
  facilities.forEach((facility) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" name="facility" value="${
      facility.price
    }"> ${facility.name} - Rp ${facility.price.toLocaleString("id-ID")}`;
    customFacilitiesList.appendChild(li);
  });
}

// Hitung total harga
function calculateTotal() {
  const selectedPrice = document.querySelector("input[name='price']:checked");
  const selectedFacilities = document.querySelectorAll(
    "input[name='facility']:checked"
  );

  let total = selectedPrice ? parseInt(selectedPrice.value) : 0;
  selectedFacilities.forEach((facility) => {
    total += parseInt(facility.value);
  });

  hargaSewaSpan.textContent = selectedPrice
    ? `Rp ${parseInt(selectedPrice.value).toLocaleString("id-ID")}`
    : "-";
  totalHargaSpan.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

// Event listener untuk perubahan pilihan harga dan fasilitas
priceList.addEventListener("change", calculateTotal);
customFacilitiesList.addEventListener("change", calculateTotal);
checkinDateInput.addEventListener("change", () => {
  tanggalPindahSpan.textContent = checkinDateInput.value;
});

// Kirim transaksi
submitButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const selectedPrice = document.querySelector("input[name='price']:checked");
  if (!selectedPrice) {
    alert("Pilih harga sewa terlebih dahulu");
    return;
  }

  const selectedFacilities = [
    ...document.querySelectorAll("input[name='facility']:checked"),
  ].map((facility) => ({
    name: facility.nextSibling.textContent.trim(),
    price: parseInt(facility.value),
  }));

  const transactionData = {
    full_name: fullNameInput.value,
    gender: genderSelect.value,
    email: emailInput.value,
    phone_number: `+62${whatsappInput.value}`,
    address: addressTextarea.value,
    check_in_date: checkinDateInput.value,
    price: parseInt(selectedPrice.value),
    payment_term: selectedPrice.dataset.term,
    custom_facilities: selectedFacilities,
  };

  try {
    const response = await fetch(
      "https://kosconnect-server.vercel.app/api/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("authToken")}`,
        },
        body: JSON.stringify(transactionData),
      }
    );

    if (!response.ok) throw new Error("Gagal mengajukan transaksi");
    alert("Transaksi berhasil diajukan!");
    window.location.href = "invoice.html";
  } catch (error) {
    console.error(error);
    alert("Terjadi kesalahan, silakan coba lagi");
  }
});

// Inisialisasi data
fetchUserData();
fetchRoomData();