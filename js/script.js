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
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const logoutBtn = document.getElementById("logout-btn");

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
        const user = data.user;
        if (user && user.fullname) {
          userNameElement.textContent = user.fullname;
        } else {
          console.warn("User data is incomplete. Falling back to user role.");
          if (userRole) {
            userNameElement.textContent = userRole;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        if (userRole) {
          userNameElement.textContent = userRole;
        }
      });
  } else {
    headerDefault.style.display = "block";
    headerLogin.style.display = "none";
  }

  // Logout button logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
    });
  }

  // Login button logic
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "https://kosconnect.github.io/login/";
    });
  }

  // Register button logic
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "https://kosconnect.github.io/register/";
    });
  }

  // Fungsi untuk fetch kategori
  async function fetchCategories() {
    try {
      const response = await fetch(
        "https://kosconnect-server.vercel.app/api/categories"
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch categories");

      const categoryDropdown = document.getElementById("categoryDropdown");
      categoryDropdown.innerHTML = '<option value="">All Categories</option>';
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Fungsi untuk fetch rooms
  async function fetchRooms() {
    try {
      const response = await fetch(
        "https://kosconnect-server.vercel.app/api/rooms/home"
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch rooms");
      displayRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  // Fungsi untuk menampilkan rooms di UI
  function displayRooms(rooms) {
    const roomContainer = document.getElementById("roomContainer");
    roomContainer.innerHTML = ""; // Clear previous rooms
    rooms.forEach((room) => {
      const roomCard = document.createElement("div");
      roomCard.className = "room-card";
      roomCard.innerHTML = `
        <img src="${room.images[0] || 'placeholder-image-url.jpg'}" alt="${room.room_name}">
        <h3>${room.room_name}</h3>
        <p>${room.description}</p>
        <p><strong>Price:</strong> ${room.price}</p>
        <p><strong>Category:</strong> ${room.category_name}</p>
      `;
      roomCard.addEventListener("click", () => handleBooking(room.owner_id));
      roomContainer.appendChild(roomCard);
    });
  }

  // Fungsi booking
  function handleBooking(ownerId) {
    if (!authToken) {
      Swal.fire({
        title: "Login Required",
        text: "You must log in first to book a room.",
        icon: "warning",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "https://kosconnect.github.io/login/";
        }
      });
    } else {
      window.location.href = `https://kosconnect.github.io/booking/${ownerId}`;
    }
  }

  // Initialize categories and rooms
  fetchCategories();
  fetchRooms();
});