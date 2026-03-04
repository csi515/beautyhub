'use client'

import { Box, Grid, Typography } from '@mui/material'
import Card from '../../components/ui/Card'
import { Package, AlertTriangle, TrendingDown } from 'lucide-react'
import type { Product } from '../hooks/useInventoryData'

interface InventorySummaryCardsProps {
    products: Product[]
}

export default function InventorySummaryCards({ products }: InventorySummaryCardsProps) {
    const lowStockProducts = products.filter(p => p.inventory_status === 'low_stock')
    const outOfStockProducts = products.filter(p => p.inventory_status === 'out_of_stock')

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Package size={20} color="#667eea" />
                        <Typography variant="body2" color="text.secondary">
                            총 제품 수
                        </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                        {products.length}개
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AlertTriangle size={20} color="#f59e0b" />
                        <Typography variant="body2" color="text.secondary">
                            재고 부족
                        </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                        {lowStockProducts.length}개
                    </Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingDown size={20} color="#ef4444" />
                        <Typography variant="body2" color="text.secondary">
                            품절
                        </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                        {outOfStockProducts.length}개
                    </Typography>
                </Card>
            </Grid>
        </Grid>
    )
}
