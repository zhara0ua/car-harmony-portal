
// Sample mock HTML for fallback when Edge Functions fail
export const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Mock Car Listing Page</title>
</head>
<body>
  <h1>Car Listings</h1>
  <div class="car-listing">
    <div class="car-item">
      <h2>2022 BMW X5</h2>
      <p>Price: $65,000</p>
      <p>Mileage: 12,500 miles</p>
      <img src="bmw-x5.jpg" alt="BMW X5">
    </div>
    <div class="car-item">
      <h2>2023 Audi Q7</h2>
      <p>Price: $72,500</p>
      <p>Mileage: 5,800 miles</p>
      <img src="audi-q7.jpg" alt="Audi Q7">
    </div>
  </div>
</body>
</html>
`;
