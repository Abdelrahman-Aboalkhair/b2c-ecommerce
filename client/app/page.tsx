import { BenefitsSection, PromotionalBanner } from "./(public)/(home)";
import HeroSection from "./(public)/(home)/HeroSection";
import ProductSection from "./(public)/product/ProductSection";
import MainLayout from "./components/templates/MainLayout";

const Home = () => {
  return (
    <MainLayout>
      <HeroSection />
      <ProductSection title="Featured Products" showTitle />

      <PromotionalBanner />
      <BenefitsSection />
    </MainLayout>
  );
};

export default Home;
