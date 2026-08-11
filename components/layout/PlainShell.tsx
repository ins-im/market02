"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import CategoryNav from "@/components/layout/CategoryNav";
import type { NavCategory } from "@/lib/types";
import styles from "@/app/(plain)/layout.module.css";

// (plain) 그룹의 헤더 배치를 라우트별로 나눈다.
//  - 인트로(/): 헤더·카테고리 내비를 영상 위에 겹치도록 fixed 오버레이로 띄운다.
//  - 그 외(로그인·체크아웃·마이페이지 등): 원래대로 정적 헤더만(스크롤과 함께 흐름).
//    카테고리 내비는 탐색용이라 이들 페이지엔 두지 않는다.
export default function PlainShell({
  navCategories,
  children,
}: {
  navCategories: NavCategory[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIntro = pathname === "/";

  if (isIntro) {
    return (
      <>
        <div className={styles.headerNav}>
          <div className={styles.header}>
            <Header />
          </div>
          <div className={styles.categoryNav}>
            <CategoryNav categories={navCategories} />
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </>
    );
  }

  // 기본(비-인트로): 헤더 바만 정상 흐름에 둔다(겹침 없음).
  return (
    <>
      <Header />
      {children}
    </>
  );
}
