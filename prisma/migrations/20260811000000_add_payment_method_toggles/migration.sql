-- 결제수단 이원화: 토스 가상계좌(자동확인) + 고정계좌 무통장입금(관리자 수동확인)
-- 모두 추가(additive)이며 기본값이 있어 기존 행/코드에 영향 없음.

-- 1) 주문 결제수단에 고정계좌 무통장입금 값 추가
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'DIRECT_TRANSFER';

-- 2) 사이트 설정에 결제수단 노출 토글 추가
--    기존 운영은 가상계좌만 쓰고 있었으므로 virtual=true, direct=false 로 시작.
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "payEnableVirtual" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "payEnableDirect" BOOLEAN NOT NULL DEFAULT false;
