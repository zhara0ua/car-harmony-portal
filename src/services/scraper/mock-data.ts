
// Sample mock data for car listings
const mockData = [
  {
    id: "mock-1",
    title: "2022 BMW X5 xDrive40i",
    price: "$65,000",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop",
    url: "https://example.com/bmw-x5",
    details: {
      year: "2022",
      mileage: "12,500 miles",
      engine: "3.0L Inline-6 Turbo",
      transmission: "Automatic",
      fuel: "Gasoline",
      color: "Alpine White"
    }
  },
  {
    id: "mock-2",
    title: "2023 Audi Q7 Premium Plus",
    price: "$72,500",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=2070&auto=format&fit=crop",
    url: "https://example.com/audi-q7",
    details: {
      year: "2023",
      mileage: "5,800 miles",
      engine: "3.0L V6 Turbo",
      transmission: "Automatic",
      fuel: "Gasoline",
      color: "Mythos Black"
    }
  },
  {
    id: "mock-3",
    title: "2021 Mercedes-Benz GLE 450",
    price: "$63,900",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop",
    url: "https://example.com/mercedes-gle",
    details: {
      year: "2021",
      mileage: "18,200 miles",
      engine: "3.0L Inline-6 Turbo",
      transmission: "Automatic",
      fuel: "Gasoline",
      color: "Selenite Grey"
    }
  }
];

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

export default mockData;
