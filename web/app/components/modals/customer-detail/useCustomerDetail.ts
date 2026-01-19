import { useCustomerForm } from './useCustomerForm'
import { useCustomerPoints } from './useCustomerPoints'
import { useCustomerHoldings } from './useCustomerHoldings'
import type { Customer } from '@/types/entities'

export type { Holding } from './useCustomerHoldings'

/**
 * 고객 상세 정보 관리를 위한 통합 훅
 * 폼, 포인트, 보유상품 관리를 조합
 */
export function useCustomerDetail(
  item: Customer | null,
  open: boolean,
  onSaved: () => void,
  onClose: () => void
) {
  // 폼 관리
  const formHook = useCustomerForm(item, onSaved, onClose)
  
  // 포인트 관리
  const pointsHook = useCustomerPoints(formHook.form?.id, open)
  
  // 보유상품 관리
  const holdingsHook = useCustomerHoldings(formHook.form?.id, open)

  return {
    // 폼 관련
    form: formHook.form,
    setForm: formHook.setForm,
    loading: formHook.loading,
    saving: formHook.saving,
    error: formHook.error,
    features: formHook.features,
    setFeatures: formHook.setFeatures,
    fieldErrors: formHook.fieldErrors,
    createAndClose: formHook.createAndClose,
    removeItem: formHook.removeItem,
    
    // 포인트 관련
    pointsBalance: pointsHook.pointsBalance,
    pointsDelta: pointsHook.pointsDelta,
    setPointsDelta: pointsHook.setPointsDelta,
    pointsReason: pointsHook.pointsReason,
    setPointsReason: pointsHook.setPointsReason,
    pointsLedger: pointsHook.pointsLedger,
    handleAddPoints: pointsHook.handleAddPoints,
    handleDeductPoints: pointsHook.handleDeductPoints,
    
    // 보유상품 관련
    holdings: holdingsHook.holdings,
    products: holdingsHook.products,
    newProductId: holdingsHook.newProductId,
    setNewProductId: holdingsHook.setNewProductId,
    newQty: holdingsHook.newQty,
    setNewQty: holdingsHook.setNewQty,
    newReason: holdingsHook.newReason,
    setNewReason: holdingsHook.setNewReason,
    addingProduct: holdingsHook.addingProduct,
    holdingDelta: holdingsHook.holdingDelta,
    setHoldingDelta: holdingsHook.setHoldingDelta,
    holdingReason: holdingsHook.holdingReason,
    setHoldingReason: holdingsHook.setHoldingReason,
    productLedger: holdingsHook.productLedger,
    handleAddProduct: holdingsHook.handleAddProduct,
    handleIncreaseHolding: holdingsHook.handleIncreaseHolding,
    handleDecreaseHolding: holdingsHook.handleDecreaseHolding,
    handleDeleteHolding: holdingsHook.handleDeleteHolding,
    handleUpdateLedgerNote: holdingsHook.handleUpdateLedgerNote,
  }
}
