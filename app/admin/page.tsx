import Link from "next/link";
import {
  BadgeCheck,
  Wallet,
  Truck,
  FileText,
  UserPlus,
  ClipboardList,
  TrendingUp,
  CalendarDays,
  ShoppingBag,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { getDashboardStats } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { formatDateTime } from "@/lib/datetime";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const s = await getDashboardStats();

  // 매출 요약 KPI (읽기 전용 집계)
  const kpis: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "오늘 매출", value: formatPrice(s.revenueToday), icon: TrendingUp },
    {
      label: "이번 달 매출",
      value: formatPrice(s.revenueMonth),
      icon: CalendarDays,
    },
    {
      label: "이번 달 주문",
      value: `${s.ordersMonth.toLocaleString("ko-KR")}건`,
      icon: ShoppingBag,
    },
    {
      label: "평균 주문금액",
      value: formatPrice(s.avgOrderMonth),
      icon: Receipt,
    },
  ];

  // 처리 대기 카드(0이 아니면 주목) — 각 카드에 의미 아이콘.
  const cards: {
    label: string;
    value: number;
    href: string;
    cta: string;
    alert: boolean;
    icon: LucideIcon;
  }[] = [
    {
      label: "사업자 승인 대기",
      value: s.pendingBusiness,
      href: "/admin/members?type=BUSINESS&status=PENDING",
      cta: "승인 처리",
      alert: s.pendingBusiness > 0,
      icon: BadgeCheck,
    },
    {
      label: "입금 대기",
      value: s.pendingDeposit,
      href: "/admin/orders?status=pending",
      cta: "입금 확인",
      alert: s.pendingDeposit > 0,
      icon: Wallet,
    },
    {
      label: "배송 처리 대기",
      value: s.toShip,
      href: "/admin/orders?status=paid",
      cta: "배송 처리",
      alert: s.toShip > 0,
      icon: Truck,
    },
    {
      label: "세금계산서 발행 대기",
      value: s.taxPending,
      href: "/admin/orders",
      cta: "발행 처리",
      alert: s.taxPending > 0,
      icon: FileText,
    },
    {
      label: "신규 가입 (7일)",
      value: s.newMembers7d,
      href: "/admin/members",
      cta: "회원 보기",
      alert: false,
      icon: UserPlus,
    },
    {
      label: "유효 견적서",
      value: s.validQuotes,
      href: "/admin/quotes?status=valid",
      cta: "견적 보기",
      alert: false,
      icon: ClipboardList,
    },
  ];

  // 상태 분포: 진행 순서(입금대기~배송완료)만 막대로. 최대값 기준 상대 폭.
  const counts = new Map(s.statusCounts.map((c) => [c.status, c.count]));
  const flow = STATUS_FLOW.map((st) => ({
    status: st,
    label: STATUS_LABEL[st],
    count: counts.get(st) ?? 0,
  }));
  const maxCount = Math.max(1, ...flow.map((f) => f.count));

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>대시보드</h1>
      <p className={styles.pageDesc}>매출·처리 현황을 한눈에 확인합니다.</p>

      {/* 매출 요약 KPI */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={styles.kpiCard}>
              <span className={styles.kpiIcon}>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div className={styles.kpiText}>
                <span className={styles.statLabel}>{k.label}</span>
                <span className={styles.kpiValue}>{k.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 처리 대기 카드 */}
      <h2 className={styles.sectionTitle}>처리 대기</h2>
      <div className={styles.statGrid}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className={`${styles.statCard} ${c.alert ? styles.statAlert : ""}`}
            >
              <span className={styles.statTop}>
                <span className={styles.statLabel}>{c.label}</span>
                <Icon size={16} strokeWidth={1.75} className={styles.statIcon} />
              </span>
              <span className={styles.statValue}>
                {c.value.toLocaleString("ko-KR")}
              </span>
              <span className={styles.statCta}>{c.cta} →</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.dashSplit}>
        {/* 주문 상태 분포 */}
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>주문 상태 분포</h2>
          <div className={styles.barList}>
            {flow.map((f) => (
              <div key={f.status} className={styles.barRow}>
                <span className={styles.barLabel}>{f.label}</span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{ width: `${(f.count / maxCount) * 100}%` }}
                  />
                </span>
                <span className={styles.barCount}>{f.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 최근 주문 */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.sectionTitle}>최근 주문</h2>
            <Link href="/admin/orders" className={styles.panelMore}>
              전체 보기 →
            </Link>
          </div>
          {s.recentOrders.length === 0 ? (
            <p className={styles.empty}>아직 주문이 없습니다.</p>
          ) : (
            <table className={styles.recentTable}>
              <tbody>
                {s.recentOrders.map((o) => (
                  <tr key={o.orderNo}>
                    <td>
                      <Link
                        href={`/admin/orders/${o.orderNo}`}
                        className={styles.recentNo}
                      >
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className={styles.recentName}>{o.ordererName}</td>
                    <td className={styles.recentAmount}>
                      {formatPrice(o.total)}
                    </td>
                    <td>
                      <OrderStatusBadge
                        status={o.status}
                        trackingNumber={o.trackingNumber}
                      />
                    </td>
                    <td className={styles.recentDate}>
                      {formatDateTime(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
