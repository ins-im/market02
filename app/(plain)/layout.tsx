import Header from "@/components/layout/Header";
import CategoryNav from "@/components/layout/CategoryNav";
import { getSiteSettings } from "@/lib/settings";
import { getNavCategories } from "@/lib/data";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import styles from "./layout.module.css";

// 견적서 셸을 쓰지 않는 페이지(로그인·회원가입·마이페이지·체크아웃·견적서·인트로 등):
// 로고와 아이콘을 한 줄짜리 헤더 바로 묶어 보여준다.
// 라우트 그룹이므로 URL에는 영향이 없다.
// 사이트 설정(공급자·계좌·유효기간·고객센터)을 서버에서 읽어 클라이언트 트리에 주입한다.
export default async function PlainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const navCategories = await getNavCategories();
  return (
    <SiteSettingsProvider value={settings}>
      <div className={styles.headerNav}>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.categoryNav}>
          <CategoryNav categories={navCategories} />
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </SiteSettingsProvider>
  );
}
