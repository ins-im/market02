import ProductGrid from "@/components/product/ProductGrid";
import type { FeaturedSection as Section } from "@/lib/data";
import styles from "./FeaturedSection.module.css";

// 카테고리별 추천상품 세트(최대 8개). CategoryNav에서 #category-{slug}로 스크롤된다.
// 좌측에 카테고리명 열, 우측에 상품 그리드가 오는 2단 레이아웃.
export default function FeaturedSection({ section }: { section: Section }) {
  const { category, products } = section;

  return (
    <section id={`category-${category.slug}`} className={styles.section}>
      <aside className={styles.aside}>
        <h2 className={styles.title}>{category.name}</h2>
      </aside>
      <div className={styles.products}>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
