
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";

const Regulations = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">{t("regulations.title")}</h1>
          
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("regulations.general.title")}</h2>
              <p className="mb-4">{t("regulations.general.description")}</p>
              <p className="mb-4">{t("regulations.general.scope")}</p>
              <Separator className="my-6" />
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("regulations.personalData.title")}</h2>
              <p className="mb-4">{t("regulations.personalData.collection")}</p>
              <p className="mb-4">{t("regulations.personalData.purpose")}</p>
              <p className="mb-4">{t("regulations.personalData.processing")}</p>
              <p className="mb-4">{t("regulations.personalData.rights")}</p>
              <Separator className="my-6" />
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("regulations.cookies.title")}</h2>
              <p className="mb-4">{t("regulations.cookies.description")}</p>
              <p className="mb-4">{t("regulations.cookies.types")}</p>
              <p className="mb-4">{t("regulations.cookies.management")}</p>
              <Separator className="my-6" />
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("regulations.terms.title")}</h2>
              <p className="mb-4">{t("regulations.terms.usage")}</p>
              <p className="mb-4">{t("regulations.terms.liability")}</p>
              <p className="mb-4">{t("regulations.terms.changes")}</p>
              <Separator className="my-6" />
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("regulations.contact.title")}</h2>
              <p className="mb-4">{t("regulations.contact.information")}</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Regulations;
