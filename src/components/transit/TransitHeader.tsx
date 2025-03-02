
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const TransitHeader = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-navy mb-2">
        {t('nav.transit')}
      </h1>
      <p className="text-gray-600 mb-3">
        Ці автомобілі ми вже виграли на аукціоні, але вони ще в дорозі до України. 
        Ви можете придбати їх зараз зі знижкою до того, як вони прибудуть на наш майданчик.
      </p>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5" />
          <p className="font-medium">Вигідна пропозиція!</p>
        </div>
        <p>Купуючи автомобіль, який ще в дорозі, ви отримуєте значну знижку від ринкової вартості.</p>
      </div>
    </div>
  );
};

export default TransitHeader;
