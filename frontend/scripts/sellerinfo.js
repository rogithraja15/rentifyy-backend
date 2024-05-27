const authToken = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", () => {
  fetchSellerDetails();
});

function fetchSellerDetails() {
  fetch(`https://rentify-afji.onrender.com/Rentify/seller/details`, {
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

  if (!Array.isArray(sellers)) {
    // Convert single object to array
    sellers = [sellers];
  }

  sellers.forEach((seller) => {
    const sellerCard = document.createElement("div");
    sellerCard.className = "seller-card";
    sellerCard.innerHTML = `
          <h2>Seller: ${seller.sellerId.firstname}</h2>
          <p><strong>Phone Number:</strong> ${seller.sellerId.phonenumber}</p>
          <p><strong>Email:</strong> ${seller.sellerId.email}</p>
          <p><strong>Property Location:</strong> ${seller.propertyId.location.join(
            ", "
          )}</p>
          <p><strong>Rent:</strong> ₹${seller.propertyId.rent}</p>
          <p><strong>Created At:</strong> ${new Date(
            seller.createdAt
          ).toLocaleString()}</p>
        `;

    sellerDetails.appendChild(sellerCard);
  });
}
