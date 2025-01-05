// Data kamar kos
const roomsData = [
    {
        id: 1,
        category: "Kos Campur",
        type: "Single Room",
        address: "Jl. Mawar No. 10, Bandung",
        availableRooms: 3,
        price: 1000000,
        image: "img/kamar1.jpeg"
    },
    {
        id: 2,
        category: "Kost Putri",
        type: "Deluxe Room",
        address: "Jl. Melati No. 5, Bandung",
        availableRooms: 2,
        price: 1500000,
        image: "img/kamar1.jpeg"
    },
    {
        id: 3,
        category: "Kost Putra",
        type: "VIP Room",
        address: "Jl. Kenanga No. 8, Bandung",
        availableRooms: 5,
        price: 2000000,
        image: "img/kamar1.jpeg"
    },
    {
        id: 4,
        category: "Kos Campur",
        type: "Studio Room",
        address: "Jl. Anggrek No. 3, Bandung",
        availableRooms: 1,
        price: 3000000,
        image: "img/kamar1.jpeg"
    }
];

// Fungsi untuk merender kamar kos ke dalam menuGrid
function renderRooms() {
    const menuGrid = document.getElementById("menuGrid");
    menuGrid.innerHTML = ""; // Bersihkan elemen grid

    roomsData.forEach(room => {
        // Elemen kartu kamar
        const card = document.createElement("div");
        card.className = "room-card";

        // Gambar kamar
        const image = document.createElement("img");
        image.src = room.image;  // Ambil gambar dari data
        image.alt = room.type;   // Alt text untuk gambar
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
                cancelButtonText: "Batal"
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

function login() {
    // Redirect pengguna ke endpoint Google OAuth di backend
    window.location.href = 'https://kosconnect.github.io/login/';
  }
function register() {
    // Redirect pengguna ke endpoint Google OAuth di backend
    window.location.href = 'https://kosconnect.github.io/register/';
  }