import Link from "next/link";
import styles from "./intro.module.css";

export default function IntroPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.videoContainer}>
          {/* 모바일: mobile 버전 (2.4MB), 데스크톱: desktop 버전 (66MB) */}
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/intro-mobile.mp4"
          >
            {/* 모바일 버전 */}
            <source
              src="/videos/intro-mobile.mp4"
              type="video/mp4"
              media="(max-width: 768px)"
            />
            {/* 데스크톱 버전 */}
            <source src="/videos/intro-desktop.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* 텍스트 가독성을 위한 다크 오버레이 */}
        <div className={styles.overlay} />

        {/* 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <h1 className={styles.title}>MMM MARKET</h1>
          <p className={styles.subtitle}>
            프리미엄 인테리어 자재를 한곳에서 만나세요.
            <br />
            전문가와 함께하는 신뢰할 수 있는 쇼핑 경험
          </p>
          <Link href="/shop" className={styles.cta}>
            쇼핑 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
