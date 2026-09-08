import { prisma } from "@/server/db";
import { formatDate } from "@/lib/datetime";
import type { OrderStatus } from "@/lib/orders";

// DB 대문자 상태 → 소비자/어드민 공용 소문자 상태 (server/orders/admin 과 동일 규칙).
const TO_CLIENT: Record<string, OrderStatus> = {
  PENDING: "pending",
  PAID: "paid",
  PREPARING: "preparing",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// 매출로 인정하는 상태(입금확인~배송완료). 입금대기·취소는 제외.
const CONFIRMED = ["PAID", "PREPARING", "SHIPPING", "DELIVERED"] as const;

// 대시보드 최근 주문 한 줄(표시 전용 스냅샷).
export interface RecentOrder {
  orderNo: string;
  ordererName: string;
  total: number;
  status: OrderStatus; // 소문자
  trackingNumber: string | null;
  createdAt: string; // ISO
}

// 어드민 대시보드 지표. 각 대기 카드는 대응하는 관리 화면으로 연결된다.
export interface DashboardStats {
  // ── 처리 대기(0이 아니면 주목) ──
  pendingBusiness: number; // 사업자 승인 대기
  pendingDeposit: number; // 입금 대기 주문
  toShip: number; // 배송 처리 대기(입금확인·배송준비)
  taxPending: number; // 세금계산서 발행 대기
  newMembers7d: number; // 최근 7일 신규 가입(고객)
  validQuotes: number; // 유효한 견적서
  // ── 매출 요약(KST 기준) ──
  revenueToday: number; // 오늘 확정 매출 합계
  revenueMonth: number; // 이번 달 확정 매출 합계
  ordersMonth: number; // 이번 달 확정 주문 수
  avgOrderMonth: number; // 이번 달 평균 주문금액
  // ── 참고 지표 ──
  statusCounts: { status: OrderStatus; count: number }[]; // 주문 상태 분포
  recentOrders: RecentOrder[]; // 최근 주문 5건
}

// KST 자정을 가리키는 UTC 시각. (KST = UTC+9 이므로 KST 00:00 = 그날 UTC 15:00 전날)
// 날짜 조각은 이미 검증된 lib/datetime(KST)에서 얻어 중복 로직을 피한다.
function kstStart(now: Date, dayOfMonth?: number): Date {
  const [y, m, d] = formatDate(now).split(".").map(Number);
  const day = dayOfMonth ?? d;
  return new Date(Date.UTC(y, m - 1, day) - 9 * 3600 * 1000);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const todayStart = kstStart(now); // 오늘 0시(KST)
  const monthStart = kstStart(now, 1); // 이달 1일 0시(KST)

  const [
    pendingBusiness,
    pendingDeposit,
    toShip,
    taxPending,
    newMembers7d,
    validQuotes,
    today,
    month,
    grouped,
    recent,
  ] = await Promise.all([
    prisma.user.count({ where: { type: "BUSINESS", status: "PENDING" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "PREPARING"] } } }),
    prisma.taxInvoice.count({ where: { requested: true, status: "PENDING" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: weekAgo } },
    }),
    prisma.quote.count({ where: { validUntil: { gte: now } } }),
    // 오늘 확정 매출
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: [...CONFIRMED] }, createdAt: { gte: todayStart } },
    }),
    // 이번 달 확정 매출 + 건수
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { status: { in: [...CONFIRMED] }, createdAt: { gte: monthStart } },
    }),
    // 상태 분포(전체 주문)
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    // 최근 주문 5건
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        orderNo: true,
        ordererName: true,
        total: true,
        status: true,
        trackingNumber: true,
        createdAt: true,
      },
    }),
  ]);

  const revenueMonth = month._sum.total ?? 0;
  const ordersMonth = month._count;

  return {
    pendingBusiness,
    pendingDeposit,
    toShip,
    taxPending,
    newMembers7d,
    validQuotes,
    revenueToday: today._sum.total ?? 0,
    revenueMonth,
    ordersMonth,
    avgOrderMonth: ordersMonth > 0 ? Math.round(revenueMonth / ordersMonth) : 0,
    statusCounts: grouped.map((g) => ({
      status: TO_CLIENT[g.status] ?? "pending",
      count: g._count._all,
    })),
    recentOrders: recent.map((o) => ({
      orderNo: o.orderNo,
      ordererName: o.ordererName,
      total: o.total,
      status: TO_CLIENT[o.status] ?? "pending",
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
