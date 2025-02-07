import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-navy mb-8">Адмін-панель</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-navy mb-4">Автомобілі</h2>
          <p className="text-gray-600 mb-4">Керування каталогом автомобілів</p>
          <Button 
            className="w-full bg-navy hover:bg-navy/90"
            onClick={() => navigate("/admin/cars")}
          >
            Керувати автомобілями
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-navy mb-4">Інспекції</h2>
          <p className="text-gray-600 mb-4">Керування інспекціями автомобілів</p>
          <Button 
            className="w-full bg-navy hover:bg-navy/90"
            onClick={() => navigate("/admin/inspections")}
          >
            Керувати інспекціями
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-navy mb-4">Користувачі</h2>
          <p className="text-gray-600 mb-4">Керування користувачами та ролями</p>
          <Button 
            className="w-full bg-navy hover:bg-navy/90"
            onClick={() => navigate("/admin/users")}
          >
            Керувати користувачами
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;