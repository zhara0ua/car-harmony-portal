
import { ScraperResult } from '@/types/scraped-car';

export const mockScraperResult: ScraperResult = {
  success: true,
  cars: [
    {
      id: '1',
      title: 'BMW X5 xDrive30d',
      price: '€45,900',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Ym13JTIweDV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      url: 'https://www.openlane.eu/en/findcar/detail/123456',
      details: {
        year: '2020',
        mileage: '45,000 km',
        engine: '3.0L 6-cylinder',
        transmission: 'Automatic',
        fuel: 'Diesel',
        color: 'Black'
      }
    },
    {
      id: '2',
      title: 'Mercedes-Benz GLE 350 d 4MATIC',
      price: '€52,500',
      image: 'https://images.unsplash.com/photo-1563720223809-b9c9c4b9eb56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWVyY2VkZXMlMjBnbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
      url: 'https://www.openlane.eu/en/findcar/detail/789012',
      details: {
        year: '2021',
        mileage: '30,000 km',
        engine: '3.0L V6',
        transmission: 'Automatic',
        fuel: 'Diesel',
        color: 'Silver'
      }
    },
    {
      id: '3',
      title: 'Audi Q7 55 TFSI quattro',
      price: '€58,900',
      image: 'https://images.unsplash.com/photo-1614377284368-a6d4f911egde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YXVkaSUyMHE3fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      url: 'https://www.openlane.eu/en/findcar/detail/345678',
      details: {
        year: '2022',
        mileage: '15,000 km',
        engine: '3.0L V6',
        transmission: 'Automatic',
        fuel: 'Petrol',
        color: 'White'
      }
    }
  ],
  html: `<div class="car-listings">
    <div class="car-card">
      <h3>BMW X5 xDrive30d</h3>
      <p>€45,900</p>
      <p>2020 | 45,000 km | Diesel | Automatic</p>
    </div>
    <div class="car-card">
      <h3>Mercedes-Benz GLE 350 d 4MATIC</h3>
      <p>€52,500</p>
      <p>2021 | 30,000 km | Diesel | Automatic</p>
    </div>
    <div class="car-card">
      <h3>Audi Q7 55 TFSI quattro</h3>
      <p>€58,900</p>
      <p>2022 | 15,000 km | Petrol | Automatic</p>
    </div>
  </div>`,
  timestamp: new Date().toISOString()
};
