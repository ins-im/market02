import { getSessionUser } from "@/lib/session";
import { cancelOwnOrder, getUserOrder } from "@/server/orders/service";

// 본인 주문 단건 조회(완료 페이지·주문 상세용). 소유자 검증은 서버에서 강제한다.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const { orderNo } = await params;
  const order = await getUserOrder(decodeURIComponent(orderNo), session.userId);
  if (!order) {
    return Response.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  return Response.json({ order });
}

// 본인 주문 취소(입금 전만). 소유자·상태 검증은 서버에서 강제한다.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || body.action !== "cancel") {
    return Response.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
  }
  const { orderNo } = await params;
  const result = await cancelOwnOrder(session.userId, decodeURIComponent(orderNo));
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({ ok: true });
}
