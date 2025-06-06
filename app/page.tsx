import {
  CategoryMenu,
  Hero,
  Incentives,
  IntroducingSection,
  Newsletter,
  ProductsSection,
} from '@/components/index';

export default function Home() {
  return (
    <>
      <Hero />
      <IntroducingSection />
      <CategoryMenu />
      <ProductsSection />
    </>
  );
}
