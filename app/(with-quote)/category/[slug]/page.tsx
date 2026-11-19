import { notFound } from "next/navigation";
import { getCategory, getProductsByCategory } from "@/lib/data";
import ProductListing from "@/components/product/ProductListing";
import styles from "../../listing.module.css";

// 회원도매가가 사용자별로 달라지므로 정적 생성(SSG)에서 동적 렌더로 전환.

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className={styles.page}>
      {/* shop 상단의 큰 "Products"와 동일한 대형 영문 제목 (맨 앞 글자만 대문자) */}
      <header className={styles.hero}>
        <h1 className={`${styles.heroTitle} ${styles.firstCap}`}>
          {category.en}
        </h1>
      </header>
      {/* shop 섹션처럼 좌측 헤더 열 + 우측 상품 2단 레이아웃 */}
      <section className={styles.catLayout}>
        <aside className={styles.catAside}>
          <h2 className={styles.catName}>{category.name}</h2>
          <p className={styles.count}>{products.length}개 상품</p>
        </aside>
        <div className={styles.catProducts}>
          <ProductListing products={products} />
        </div>
      </section>
    </div>
  );
}
