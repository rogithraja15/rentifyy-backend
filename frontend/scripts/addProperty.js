const authToken = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", () => {
  const addPropertyForm = document.getElementById("add-property-form");
  if (addPropertyForm) {
    addPropertyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleImageUpload();
    });
  }
});

function handleImageUpload() {
  const imageInput = document.getElementById("image");
  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  fetch("https://rentify-afji.onrender.com/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const imageUrl = data.data;
        addProperty(imageUrl);
      } else {
        const responseMessage = document.getElementById("response-message");
        responseMessage.textContent = data.message;
        responseMessage.style.color = "red";
      }
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      const responseMessage = document.getElementById("response-message");
      responseMessage.textContent =
        "An error occurred while uploading the image.";
      responseMessage.style.color = "red";
    });
}

function addProperty(imageUrl) {
  const propertyType = document.getElementById("propertyType").value;
  const location = document.getElementById("location").value.split(",");
  const amenitiesSelect = document.getElementById("amenities");
  const amenities = Array.from(amenitiesSelect.selectedOptions).map(
    (option) => option.value
  );
  const rent = document.getElementById("rent").value;
  const address = document.getElementById("address").value;
  const numberOfBedrooms = document.getElementById("numberOfBedrooms").value;
  const numberOfBathrooms = document.getElementById("numberOfBathrooms").value;
  const nearbyHospitals = document
    .getElementById("nearbyHospitals")
    .value.split(",");
  const nearbyColleges = document
    .getElementById("nearbyColleges")
    .value.split(",");

  const authToken = localStorage.getItem("authToken"); // Retrieve token from localStorage

  const propertyData = {
    propertyType,
    location,
    amenities,
    rent,
    address,
    image: [imageUrl],
    numberOfBedrooms,
    numberOfBathrooms,
    nearbyHospitals,
    nearbyColleges,
  };

  fetch("https://rentify-afji.onrender.com/Rentify/Property", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": authToken, // Use token from localStorage
    },
    body: JSON.stringify(propertyData),
  })
    .then((response) => response.json())
    .then((data) => {
      const responseMessage = document.getElementById("response-message");
      if (data.success) {
        responseMessage.textContent = "Property Saved Successfully";
        responseMessage.style.color = "green";
      } else {
        responseMessage.textContent = data.message;
        responseMessage.style.color = "red";
      }
    })
    .catch((error) => {
      console.error("Error saving property:", error);
      const responseMessage = document.getElementById("response-message");
      responseMessage.textContent =
        "An error occurred while saving the property.";
      responseMessage.style.color = "red";
    });
}
