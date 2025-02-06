import CarCard from "./CarCard";

const FeaturedCars = () => {
  const cars = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80",
      name: "Mercedes-Benz S-Class",
      price: "$85,000",
      year: 2023,
      mileage: "15,000 mi"
    },
    {
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
      name: "BMW 7 Series",
      price: "$78,500",
      year: 2022,
      mileage: "22,000 mi"
    },
    {
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      name: "Audi A8",
      price: "$82,000",
      year: 2023,
      mileage: "18,000 mi"
    }
  ];

  return (
    <section className="py-16 bg-silver">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-navy mb-8">Featured Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <CarCard key={index} {...car} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;