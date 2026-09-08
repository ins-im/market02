import Link from "next/link";
import styles from "@/app/admin/admin.module.css";

// 관리자 목록 페이지 공통 페이지네이션(이전/다음 + "현재/전체").
// hrefWith: 각 페이지가 넘기는 "현재 필터를 유지하며 page 만 교체"한 URL 생성 함수.
//           (필터 키는 페이지마다 다르므로 URL 생성은 각 페이지가 담당하고,
//            여기서는 page 만 바꿔 호출한다.)
// totalPages 가 1 이하이면 아무것도 그리지 않는다.
export default function Pagination({
  page,
  totalPages,
  hrefWith,
}: {
  page: number;
  totalPages: number;
  hrefWith: (patch: { page: number }) => string;
}) {
  if (totalPages <= 1) return null;

  const disabled = { opacity: 0.5, cursor: "default" } as const;

  return (
    <div className={styles.pagination}>
      {page > 1 ? (
        <Link href={hrefWith({ page: page - 1 })} className={styles.button}>
          ← 이전
        </Link>
      ) : (
        <span className={styles.button} style={disabled} aria-disabled>
          ← 이전
        </span>
      )}
      <span className={styles.count}>
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefWith({ page: page + 1 })} className={styles.button}>
          다음 →
        </Link>
      ) : (
        <span className={styles.button} style={disabled} aria-disabled>
          다음 →
        </span>
      )}
    </div>
  );
}
