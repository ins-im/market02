"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import styles from "@/app/admin/admin.module.css";

// 어드민 사이드바 하단 로그아웃. 레이아웃은 서버 컴포넌트라 클릭을 못 받으므로
// 이 작은 client 조각이 담당한다. 세션 삭제 로직은 기존 API 를 그대로 재사용.
export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // 세션이 지워졌으니 관리자 로그인 화면으로. refresh 로 서버 상태도 갱신.
      router.replace("/admin-login");
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={styles.logout}>
      <LogOut size={15} strokeWidth={1.5} />
      로그아웃
    </button>
  );
}
