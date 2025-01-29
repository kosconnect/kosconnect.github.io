import { getCookie} from "./header.js";

document.addEventListener("DOMContentLoaded", async function () {
  const authToken = getCookie("authToken");
  if (!authToken) {
    window.location.href = "/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomId");
  if (!roomId) {
    window.location.href = "/index.html";
    return;
  }

  try {
    const userResponse = await fetch(
      "https://kosconnect-server.vercel.app/api/users/me",
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    if (!userResponse.ok) throw new Error("Failed to fetch user data");
    const userData = await userResponse.json();
    document.getElementById("checkoutFullName").textContent = userData.fullname;
    document.getElementById("inputFullName").value = userData.fullname;
    document.getElementById("inputEmail").value = userData.Email;

    const roomResponse = await fetch(
      `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`
    );
    if (!roomResponse.ok) throw new Error("Failed to fetch room data");
    const roomData = await roomResponse.json();
    document.getElementById("checkoutKosName").textContent =
      roomData.boardingHouseName;
    document.getElementById("checkoutAddress").textContent = roomData.address;

    const hargaSewaList = document.getElementById("hargaSewaList");
    hargaSewaList.innerHTML = "";
    roomData.prices.forEach((price) => {
      const li = document.createElement("li");
      li.textContent = `${price.duration}: Rp ${price.amount}`;
      hargaSewaList.appendChild(li);
    });

    const fasilitasList = document.getElementById("fasilitasList");
    fasilitasList.innerHTML = "";
    roomData.facilities.forEach((facility) => {
      const li = document.createElement("li");
      li.textContent = facility;
      fasilitasList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading checkout data:", error);
  }
});

//button back
const backButton = document.querySelector(".back-button");

backButton.addEventListener("click", () => {
  window.history.back();
});

document.getElementById("logoutButton").addEventListener("click", function () {
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login.html";
});
