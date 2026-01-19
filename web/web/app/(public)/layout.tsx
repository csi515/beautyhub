import { Box } from '@mui/material'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <PublicHeader />
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            <PublicFooter />
        </Box>
    )
}
