"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice, thumbUrl } from "@/lib/utils";
import styles from "./QuotePanel.module.css";

// 수량 조절 셀: −/＋ 버튼 + 직접 입력. 입력 중 빈 값을 허용하려고 로컬 문자열로 두고,
// 유효한 값(≥1)일 때만 실제 수량에 반영한다. +/−·외부 변경 시 입력창을 다시 동기화한다.
function QtyCell({
  productId,
  variantId,
  quantity,
  onChange,
}: {
  productId: string;
  variantId: string;
  quantity: number;
  onChange: (productId: string, variantId: string, quantity: number) => void;
}) {
  const [text, setText] = useState(String(quantity));
  // +/−·외부 변경으로 quantity 가 바뀌면 입력창을 다시 맞춘다.
  // (effect 대신 렌더 중 prop 변화 감지 — React 권장 패턴)
  const [prevQty, setPrevQty] = useState(quantity);
  if (quantity !== prevQty) {
    setPrevQty(quantity);
    setText(String(quantity));
  }

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1) onChange(productId, variantId, n);
  };

  return (
    <div className={styles.quantity}>
      <button
        type="button"
        onClick={() => onChange(productId, variantId, quantity - 1)}
        disabled={quantity <= 1}
        aria-label="수량 줄이기"
      >
        −
      </button>
      <input
        inputMode="numeric"
        value={text}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          setText(v);
          commit(v);
        }}
        onBlur={() => setText(String(quantity))}
        aria-label="수량"
      />
      <button
        type="button"
        onClick={() => onChange(productId, variantId, quantity + 1)}
        aria-label="수량 늘리기"
      >
        +
      </button>
    </div>
  );
}

// 리스트/상세 페이지 좌측에 항상 표시되는 견적서 패널
// (모바일 바텀시트에서도 재사용 — className으로 외곽선/높이 오버라이드)
export default function QuotePanel({ className }: { className?: string }) {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();

  return (
    <aside className={`${styles.panel} ${className ?? ""}`}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>견적서</span>
        <span className={styles.headerCount}>{totalCount} ITEMS</span>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          담긴 상품이 없습니다.
          <br />
          상품을 견적서에 담아보세요.
        </p>
      ) : (
        <>
          <ul className={styles.items}>
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className={styles.item}
              >
                <Link href={`/products/${item.productId}`}>
                  {/* 경량 썸네일(.thumb.webp) 우선, 없으면 onError 로 원본 폴백 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl(item.image)}
                    alt={item.productName}
                    className={styles.thumb}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallback) return;
                      img.dataset.fallback = "1";
                      img.src = item.image;
                    }}
                  />
                </Link>

                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <Link
                      href={`/products/${item.productId}`}
                      className={styles.itemName}
                    >
                      {item.productName}
                    </Link>
                    <span className={styles.itemVariant}>
                      {item.color && (
                        <span
                          className={styles.colorDot}
                          style={{ backgroundColor: item.color }}
                          aria-hidden
                        />
                      )}
                      {item.variantName}
                      {item.colorName ? ` / ${item.colorName}` : ""}
                    </span>
                  </div>

                  <div className={styles.itemRow}>
                    <QtyCell
                      productId={item.productId}
                      variantId={item.variantId}
                      quantity={item.quantity}
                      onChange={updateQuantity}
                    />
                    <span className={styles.itemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeItem(item.productId, item.variantId)}
                  aria-label={`${item.productName} 삭제`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <dl className={styles.totals}>
            <div className={styles.totalRow}>
              <dt>총 합계</dt>
              <dd>{formatPrice(totalPrice)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Link href="/quote" className={styles.primaryAction}>
              견적서 보기
            </Link>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={clearCart}
            >
              전체 비우기
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
