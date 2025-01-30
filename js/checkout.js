document.addEventListener("DOMContentLoaded", async () => {
  const userUrl = "https://kosconnect-server.vercel.app/api/users/me";
  const roomId = new URLSearchParams(window.location.search).get("roomId");
  const roomUrl = `https://kosconnect-server.vercel.app/api/rooms/${roomId}/pages`;

  try {
    // Fetch user data
    const userResponse = await fetch(userUrl, { credentials: "include" });
    if (!userResponse.ok) throw new Error("Failed to fetch user data");
    const user = await userResponse.json();

    document.getElementById("full_name").value = user.Fullname || "";
    document.getElementById("email").value = user.Email || "";

    // Fetch room data
    const roomResponse = await fetch(roomUrl);
    if (!roomResponse.ok) throw new Error("Failed to fetch room data");
    const room = await roomResponse.json();

    document.querySelector(".room-name").textContent = room.room_name;
    document.querySelector(".address").textContent = room.address;

    // Populate price list
    const priceList = document.getElementById("price-list");
    priceList.innerHTML = "";
    room.priceOptions.forEach((option) => {
      const li = document.createElement("li");
      li.textContent = `${
        option.duration
      }: Rp ${option.price.toLocaleString()}`;
      priceList.appendChild(li);
    });

    // Populate custom facilities
    const facilitiesList = document.getElementById("custom-facilities");
    facilitiesList.innerHTML = "";
    room.customFacilities.forEach((facility) => {
      const li = document.createElement("li");
      li.textContent = `${
        facility.name
      } - Rp ${facility.price.toLocaleString()}`;
      facilitiesList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});