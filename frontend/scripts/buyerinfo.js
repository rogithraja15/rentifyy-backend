const authToken = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", () => {
  fetchSellerDetails();
});

function fetchSellerDetails() {
  fetch(`https://rentify-afji.onrender.com/Rentify/interested/customers`, {
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": authToken, // Use token from localStorage
    },
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        displaySellerDetails(response.data);
      } else {
        console.error("Failed to fetch seller details:", response.message);
      }
    })
    .catch((error) => console.error("Error fetching seller details:", error));
}

function displaySellerDetails(sellers) {
  const sellerDetails = document.getElementById("seller-details");
  sellerDetails.innerHTML = ""; // Clear any existing content

  sellers.forEach((seller) => {
    const sellerCard = document.createElement("div");
    sellerCard.className = "seller-card";
    sellerCard.innerHTML = `
        <h2>Buyer: ${seller.buyerId.firstname}</h2>
        <p>Phone Number: ${seller.buyerId.phonenumber}</p>
        <p>Email: ${seller.buyerId.email}</p>
        <p>Property Location: ${seller.propertyId.location.join(", ")}</p>
        <p>Rent: ₹${seller.propertyId.rent}</p>
        <p>Created At: ${new Date(seller.createdAt).toLocaleString()}</p>
      `;

    sellerDetails.appendChild(sellerCard);
  });
}
