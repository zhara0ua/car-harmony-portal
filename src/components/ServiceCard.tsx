
interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl flex flex-col items-center">
      <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl text-gold">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

export default ServiceCard;
