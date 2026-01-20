'use client'

import { useState } from 'react'
import { Box, Typography, CircularProgress, Stack } from '@mui/material'
import { CheckCircle2, UserPlus } from 'lucide-react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal'
import Button from '../ui/Button'
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import CustomerSummaryBar from './customer-detail/CustomerSummaryBar'
import CustomerOverviewTab from './customer-detail/CustomerOverviewTab'
import CustomerTransactionsTab from './customer-detail/CustomerTransactionsTab'
import CustomerTimelineTab from './customer-detail/CustomerTimelineTab'
import type { Customer } from '@/types/entities'
import { useCustomerDetail } from './customer-detail/useCustomerDetail'

export default function CustomerDetailModal({
  open,
  onClose,
  item,
  onSaved
}: {
  open: boolean
  onClose: () => void
  item: Customer | null
  onSaved: () => void
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'timeline'>('overview')

  const {
    form, setForm,
    loading,
    saving,
    error,
    features, setFeatures,
    fieldErrors,
    pointsBalance,
    pointsDelta, setPointsDelta,
    pointsReason, setPointsReason,
    pointsLedger,
    holdings,
    products,
    newProductId, setNewProductId,
    newQty, setNewQty,
    newReason, setNewReason,
    addingProduct,
    holdingDelta, setHoldingDelta,
    holdingReason, setHoldingReason,
    productLedger,
    createAndClose,
    handleAddPoints,
    handleDeductPoints,
    handleAddProduct,
    handleIncreaseHolding,
    handleDecreaseHolding,
    handleDeleteHolding,
    handleUpdateLedgerNote,
    removeItem
  } = useCustomerDetail(item, open, onSaved, onClose)

  if (!open || !form) return null

  const isNew = !form?.id

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader
        title={isNew ? "신규 고객 추가" : `고객 정보: ${form.name}`}
        onClose={onClose}
      >
        {!isNew && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            {saving ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={14} thickness={6} />
                <Typography variant="caption" color="text.secondary">저장 중...</Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <Typography variant="caption" color="text.secondary">자동 저장됨</Typography>
              </Stack>
            )}
          </Box>
        )}
      </ModalHeader>

      <ModalBody>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Box sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 1.5, border: '1px solid', borderColor: 'error.100' }}>
              <Typography variant="body2" color="error.main">{error}</Typography>
            </Box>
          )}

          {/* 상단 요약 바 - 기존 고객만 */}
          {!isNew && (
            <CustomerSummaryBar
              name={form.name}
              phone={form.phone ?? null}
              email={form.email ?? null}
              pointsBalance={pointsBalance}
              holdingsCount={holdings.length}
            />
          )}

          {isNew ? (
            // 신규 고객: 탭 없이 기본정보만 표시
            <Box sx={{ mt: 1 }}>
              <CustomerOverviewTab
                form={form ? {
                  id: form.id,
                  name: form.name,
                  phone: form.phone ?? null,
                  email: form.email ?? null,
                  address: form.address ?? null,
                  skin_type: form.skin_type ?? null,
                  allergy_info: form.allergy_info ?? null,
                  memo: form.memo ?? null,
                } : null}
                features={features}
                fieldErrors={fieldErrors}
                onChangeForm={(updater) => {
                  setForm(f => {
                    const result = updater(f ? {
                      id: f.id,
                      name: f.name,
                      phone: f.phone ?? null,
                      email: f.email ?? null,
                      address: f.address ?? null,
                      skin_type: f.skin_type ?? null,
                      allergy_info: f.allergy_info ?? null,
                      memo: f.memo ?? null,
                    } : null)
                    if (!result) return null
                    return {
                      ...f!,
                      name: result.name || '',
                      phone: result.phone ?? null,
                      email: result.email ?? null,
                      address: result.address ?? null,
                      skin_type: result.skin_type ?? null,
                      allergy_info: result.allergy_info ?? null,
                      memo: result.memo ?? null,
                    } as Customer
                  })
                }}
                onChangeFeatures={setFeatures}
                isNewCustomer={true}
              />
            </Box>
          ) : (
            // 기존 고객: 탭 표시
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'transactions' | 'timeline')}>
              <TabsList>
                <TabsTrigger value="overview">
                  기본 정보
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  포인트 & 보유상품
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  타임라인
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <CustomerOverviewTab
                  form={form ? {
                    id: form.id,
                    name: form.name,
                    phone: form.phone ?? null,
                    email: form.email ?? null,
                    address: form.address ?? null,
                    skin_type: form.skin_type ?? null,
                    allergy_info: form.allergy_info ?? null,
                    memo: form.memo ?? null,
                  } : null}
                  features={features}
                  fieldErrors={fieldErrors}
                  onChangeForm={(updater) => {
                    setForm(f => {
                      const result = updater(f ? {
                        id: f.id,
                        name: f.name,
                        phone: f.phone ?? null,
                        email: f.email ?? null,
                        address: f.address ?? null,
                        skin_type: f.skin_type ?? null,
                        allergy_info: f.allergy_info ?? null,
                        memo: f.memo ?? null,
                      } : null)
                      if (!result) return null
                      return {
                        ...f!,
                        name: result.name || '',
                        phone: result.phone ?? null,
                        email: result.email ?? null,
                        address: result.address ?? null,
                        skin_type: result.skin_type ?? null,
                        allergy_info: result.allergy_info ?? null,
                        memo: result.memo ?? null,
                      } as Customer
                    })
                  }}
                  onChangeFeatures={setFeatures}
                  onDelete={removeItem}
                  isNewCustomer={false}
                />
              </TabsContent>

              <TabsContent value="transactions">
                <CustomerTransactionsTab
                  customerId={form?.id || ''}
                  pointsBalance={pointsBalance}
                  pointsDelta={pointsDelta}
                  pointsReason={pointsReason}
                  pointsLedger={pointsLedger}
                  onChangePointsDelta={setPointsDelta}
                  onChangePointsReason={setPointsReason}
                  onAddPoints={handleAddPoints}
                  onDeductPoints={handleDeductPoints}
                  holdings={holdings}
                  products={products}
                  newProductId={newProductId}
                  newQty={newQty}
                  newReason={newReason}
                  holdingDelta={holdingDelta}
                  holdingReason={holdingReason}
                  addingProduct={addingProduct}
                  productLedger={productLedger}
                  onChangeNewProduct={setNewProductId}
                  onChangeNewQty={setNewQty}
                  onChangeNewReason={setNewReason}
                  onChangeHoldingDelta={(id: string, v: number) => setHoldingDelta(s => ({ ...s, [id]: v }))}
                  onChangeHoldingReason={(id: string, v: string) => setHoldingReason(s => ({ ...s, [id]: v }))}
                  onAddProduct={handleAddProduct}
                  onIncrease={(holding) => handleIncreaseHolding(holding)}
                  onDecrease={(holding) => handleDecreaseHolding(holding)}
                  onDelete={(id: string) => handleDeleteHolding(id)}
                  onUpdateLedgerNote={handleUpdateLedgerNote}
                />
              </TabsContent>

              <TabsContent value="timeline">
                <CustomerTimelineTab customerId={form?.id || ''} />
              </TabsContent>
            </Tabs>
          )}
        </Box>
      </ModalBody>

      {isNew && (
        <ModalFooter>
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={onClose} disabled={loading}>취소</Button>
            <Button
              variant="primary"
              onClick={createAndClose}
              loading={loading}
              disabled={loading}
              leftIcon={<UserPlus size={18} />}
            >
              고객 등록
            </Button>
          </Box>
        </ModalFooter>
      )}
    </Modal>
  )
}
