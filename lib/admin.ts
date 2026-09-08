import "server-only";

// 어드민 화면(서버 컴포넌트)이 쓰는 읽기 게이트웨이 (app → lib → server 경계 유지).
export {
  getMe,
  listPendingBusinesses,
  type AuthUser,
  type PendingBusiness,
} from "@/server/auth/service";

export {
  listMembersForAdmin,
  getMemberForAdmin,
  MEMBER_PAGE_SIZE,
  type AdminMemberRow,
  type AdminMemberListResult,
  type AdminMemberDetail,
  type MemberType,
  type MemberStatus,
  type MemberGrade,
} from "@/server/auth/admin";

export { getSiteSettings } from "@/server/settings/service";

// 회원 상세에서 사업자등록증(비공개 파일) 미리보기용 서명 URL.
export { signedPrivateUrl } from "@/server/storage";

export {
  getDashboardStats,
  type DashboardStats,
  type RecentOrder,
} from "@/server/dashboard/service";

export {
  listOrdersForAdmin,
  getOrderForAdmin,
  listTaxInvoicesForAdmin,
  ORDER_PAGE_SIZE,
  TAX_PAGE_SIZE,
  type AdminOrderRow,
  type AdminOrderListResult,
  type AdminOrderDetail,
  type AdminOrderItem,
  type TaxInvoiceState,
  type AdminTaxInvoiceRow,
  type AdminTaxInvoiceListResult,
  type TaxRowState,
} from "@/server/orders/admin";

export {
  listQuotesForAdmin,
  getQuoteForAdmin,
  QUOTE_PAGE_SIZE,
  type AdminQuoteRow,
  type AdminQuoteListResult,
  type AdminQuoteDetail,
  type AdminQuoteItem,
} from "@/server/quotes/admin";

export {
  listProductsForAdmin,
  getProductForAdmin,
  getProductOptions,
  getProductImages,
  getFeaturedForAdmin,
  getCategoriesForAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type AdminProductRow,
  type AdminProductDetail,
  type AdminProductOptions,
  type AdminVariant,
  type AdminProductImages,
  type AdminFeaturedCategory,
  type AdminFeaturedItem,
  type AdminCategoryRow,
  type CategoryMutationResult,
} from "@/server/catalog/admin";
