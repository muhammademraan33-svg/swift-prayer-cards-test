import Navbar from "@/components/Navbar";
import PrintWizard from "@/components/wizard/PrintWizard";
import Footer from "@/components/Footer";

const Create = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-4">
        <PrintWizard />
      </main>
      <Footer />
    </div>
  );
};

export default Create;
