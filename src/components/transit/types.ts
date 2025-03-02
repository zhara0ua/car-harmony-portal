
export interface TransitCar {
  id: number;
  make: string;
  model: string;
  year: number;
  image: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  status: "loading" | "in_transit" | "customs" | "delivery";
  progress: number;
  auctionPrice: number;
  marketPrice: number;
  discount: number;
}

export const mockTransitCars: TransitCar[] = [
  {
    id: 1,
    make: "BMW",
    model: "X5",
    year: 2021,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
    origin: "Мюнхен, Німеччина",
    destination: "Київ, Україна",
    departureDate: "2023-10-15",
    estimatedArrival: "2023-10-25",
    status: "in_transit",
    progress: 65,
    auctionPrice: 28500,
    marketPrice: 32000,
    discount: 11
  },
  {
    id: 2,
    make: "Audi",
    model: "Q7",
    year: 2022,
    image: "https://images.unsplash.com/photo-1606664922998-f180200bd25a?auto=format&fit=crop&q=80",
    origin: "Інгольштадт, Німеччина",
    destination: "Львів, Україна",
    departureDate: "2023-10-18",
    estimatedArrival: "2023-10-28",
    status: "loading",
    progress: 10,
    auctionPrice: 33200,
    marketPrice: 38500,
    discount: 14
  },
  {
    id: 3,
    make: "Mercedes-Benz",
    model: "GLE",
    year: 2023,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80",
    origin: "Штутгарт, Німеччина",
    destination: "Одеса, Україна",
    departureDate: "2023-10-12",
    estimatedArrival: "2023-10-22",
    status: "customs",
    progress: 85,
    auctionPrice: 45000,
    marketPrice: 51000,
    discount: 12
  },
  {
    id: 4,
    make: "Volkswagen",
    model: "Touareg",
    year: 2022,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80",
    origin: "Вольфсбург, Німеччина",
    destination: "Харків, Україна",
    departureDate: "2023-10-10",
    estimatedArrival: "2023-10-20",
    status: "delivery",
    progress: 95,
    auctionPrice: 30800,
    marketPrice: 35500,
    discount: 13
  }
];
