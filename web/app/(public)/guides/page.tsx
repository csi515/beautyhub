import { Metadata } from 'next'
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material'
import { FileText, TrendingUp, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: '가이드 - BeautyHub',
    description: 'BeautyHub 사용 가이드입니다. 효과적인 샵 운영을 위한 팁과 노하우를 확인하세요.',
    keywords: 'CRM 가이드, 고객 관리 방법, 피부관리샵 운영, 예약 관리 팁',
}

const guides = [
    {
        icon: FileText,
        title: '10분 만에 샵 운영 시작하기 (Quick Start)',
        category: '초기 세팅',
        excerpt: '가입 즉시 샵 운영을 정상화할 수 있는 핵심 세팅 4단계를 안내합니다.',
        content: `
      복잡한 매뉴얼을 뒤질 필요가 없습니다. 다음 4단계만 따라오시면 지금 당장 예약을 받을 수 있습니다.

      핵심 4단계 로드맵:
      1. 가게 정보 설정: 설정 메뉴에서 샵 이름을 입력하여 시스템 브랜딩을 완료합니다.
      2. 시술 메뉴 등록: 제공하시는 주력 시술의 이름과 소요 시간, 가격을 등록합니다.
      3. 직원/관리사 추가: 함께 근무하는 직원이 있다면 역할과 함께 계정을 생성합니다.
      4. 첫 예약 등록: 캘린더에서 빈 시간을 클릭하여 실제 고객 예약을 입력해 보세요.
    `
    },
    {
        icon: Calendar,
        title: '노쇼 제로(Zero)를 위한 예약 관리 전략',
        category: '예약 관리',
        excerpt: '예약 누락과 노쇼를 효과적으로 방지하는 실전 활용 가이드입니다.',
        content: `
      예약은 샵의 매출과 직결됩니다. BeautyHub의 알림 기능을 십분 활용하여 신뢰를 쌓으세요.

      실전 노하우:
      - 알림 자동화: "예약 전날 오후 3시"와 같이 고객이 가장 일정 확인을 많이 하는 시간에 리마인더를 발송하세요.
      - 시간 배분: 시술 간 10~15분의 여유 시간을 두어 환기 및 정비 시간을 캘린더에 미리 확보하세요.
      - 이력 기반 상담: 고객이 방문하기 전, 이전 방문 시 작성했던 메모를 미리 확인하여 맞춤형 인사로 대화를 시작하세요.
    `
    },
    {
        icon: TrendingUp,
        title: '재방문을 부르는 포인트 제도 운영법',
        category: '고객 관리',
        excerpt: '단골 고객을 만드는 포인트 적립 및 사용 기능 활용 팁입니다.',
        content: `
      신규 고객 유치보다 재방문 고객 관리가 훨씬 효율적입니다. 점진적으로 가치를 쌓는 포인트 제도를 시작하세요.

      활용 팁:
      - 회원권 연동: 선결제 회원권을 등록하고 차감식으로 관리하면 장기 고객 확보가 용이합니다.
      - 생일 축하 포인트: 고객 정보에 생일을 등록하면 시스템이 알림을 줍니다. 이때 감사 문자와 포인트를 지급해 보세요.
      - 장기 미방문 추적: 3개월 이상 방문이 없는 고객을 필터링하여 '보고 싶어요' 문자와 함께 웰컴 포인트를 제안하세요.
    `
    },
    {
        icon: Users,
        title: '직원 성과 지표와 동기부여 관리',
        category: '관리자 노하우',
        excerpt: '데이터를 근거로 투명한 인센티브 정산과 업무 효율을 높이는 방법입니다.',
        content: `
      데이터는 직원과의 신뢰를 쌓는 가장 투명한 도구입니다.

      데이터 활용법:
      - 직원별 기여도 분석: 특정 시술에 강점이 있는 직원을 파악하여 전담 시술자로 배치하세요.
      - 객단가 추이 확인: 제품 추천 판매 역량이 뛰어난 직원의 노하우를 팀 전체와 공유하는 계기로 삼으세요.
      - 권한 격리: 민감한 전체 샵의 월 매출 정보는 관리자만 확인하게 설정하여 직원들이 본연의 업무에 집중하게 돕습니다.
    `
    },
]

export default function GuidesPage() {
    return (
        <Box>
            {/* Hero Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: { xs: 8, md: 10 },
                textAlign: 'center'
            }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                        활용 가이드
                    </Typography>
                    <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.95 }}>
                        BeautyHub를 효과적으로 활용하여 샵 운영을 개선하는 방법을 안내합니다.
                        <br />
                        실전에서 바로 적용할 수 있는 유용한 팁과 노하우를 확인하세요.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
                <Grid container spacing={4}>
                    {guides.map((guide, index) => {
                        const Icon = guide.icon
                        return (
                            <Grid item xs={12} md={6} key={index}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            <Box sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 2,
                                                bgcolor: 'primary.light',
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <Icon size={28} />
                                            </Box>
                                            <Box>
                                                <Typography variant="overline" color="primary" fontWeight={700}>
                                                    {guide.category}
                                                </Typography>
                                                <Typography variant="h5" fontWeight={700}>
                                                    {guide.title}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                                            {guide.excerpt}
                                        </Typography>

                                        <Box sx={{
                                            pt: 2,
                                            borderTop: 1,
                                            borderColor: 'divider',
                                            '& p': { mb: 1, lineHeight: 1.6, fontSize: '0.95rem', color: 'text.secondary' },
                                            '& strong': { fontWeight: 700, color: 'text.primary', display: 'block', mt: 2, mb: 0.5 }
                                        }}>
                                            {guide.content.split('\n\n')[1]?.split('\n').map((line, i) => (
                                                <Typography key={i} component="p">
                                                    {line.trim()}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>

                <Box sx={{ mt: 8, p: { xs: 3, md: 4 }, bgcolor: 'grey.50', borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        더 많은 정보가 필요하신가요?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
                        FAQ 페이지에서 자주 묻는 질문을 확인하거나, 직접 문의해주시면 상세히 안내해 드립니다.
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Link href="/faq" passHref>
                            <Typography component="a" variant="button" color="primary" sx={{ textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }}>
                                FAQ 보러가기 →
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}
