import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1회성 정리 스크립트 — Payment.raw(감사용 JSON)에 남아있는 토스 결제 secret 제거.
//   node --env-file=.env scripts/strip-payment-secret.ts
// secret 은 "재조회" 방식 웹훅 검증을 쓰는 이 프로젝트에선 읽지 않는 값이라
// DB 에 남길 필요가 없다(데이터 최소화). 여러 번 돌려도 안전(멱등).

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const rows = await prisma.payment.findMany({ select: { id: true, raw: true } });
  let cleaned = 0;

  for (const row of rows) {
    const raw = row.raw;
    // raw 가 객체이고 secret 키를 가진 경우에만 제거 후 갱신.
    if (raw && typeof raw === "object" && !Array.isArray(raw) && "secret" in raw) {
      const cleanedRaw: Prisma.JsonObject = { ...(raw as Prisma.JsonObject) };
      delete cleanedRaw.secret;
      await prisma.payment.update({
        where: { id: row.id },
        data: { raw: cleanedRaw },
      });
      cleaned++;
    }
  }

  console.log(`전체 결제 ${rows.length}건 중 secret 제거: ${cleaned}건`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
