import { Metadata } from 'next'
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Stack, Chip } from '@mui/material'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
    title: 'FAQ - 자주 묻는 질문 | BeautyHub',
    description: 'BeautyHub에 대해 자주 묻는 질문과 답변을 확인하세요. 사용법, 기능, 가격, 보안 등 궁금한 모든 것을 안내합니다.',
    keywords: 'FAQ, 자주 묻는 질문, CRM 사용법, 고객센터',
}

const faqCategories = {
    general: {
        title: '일반',
        items: [
            {
                q: 'BeautyHub가 무엇인가요?',
                a: 'BeautyHub는 1인 샵부터 중소규모 뷰티 비즈니스까지 아우르는 전문 고객 관리(CRM) 솔루션입니다. 예약, 고객 이력, 매출 정산, 재고 관리를 비전문가도 쉽게 사용할 수 있도록 설계되었습니다. 특히 자신의 샵 이름으로 맞춤 브랜딩이 가능하여 원장님만의 전용 관리 보조 도구처럼 활용하실 수 있습니다.'
            },
            {
                q: '기존에 수기나 엑셀로 관리하던 데이터를 옮길 수 있나요?',
                a: '네, 가능합니다. 고객 매스 업로드(Excel/CSV) 기능을 통해 수백 명의 고객 정보를 한 번에 등록하실 수 있습니다.'
            },
            {
                q: '오프라인 상태에서도 사용할 수 있나요?',
                a: '본 서비스는 실시간 데이터 동기화를 위해 인터넷 연결이 필요합니다. 매장 인터넷이 일시적으로 중단된 경우, 스마트폰 태블릿의 모바일 핫스팟 기능을 통해 접속하시면 중단 없이 예약을 확인하고 관리하실 수 있습니다.'
            },
            {
                q: '설치가 필요한가요?',
                a: '전혀 필요 없습니다. 웹 표준 기술을 사용하여 크롬, 사파리 등 현대적인 브라우저만 있다면 어디서든 접속 가능합니다. 또한 PWA(Progressive Web App) 기술을 지원하여, 모바일 환경에서 홈 화면에 추가하면 마치 앱처럼 간편하게 실행하실 수 있습니다.'
            },
        ]
    },
    usage: {
        title: '사용 및 설정',
        items: [
            {
                q: '1인 샵인데 혼자서도 관리하기 쉬울까요?',
                a: '네, BeautyHub는 원장님이 시술에만 집중할 수 있도록 복잡한 입력 과정을 생략했습니다. 예약 등록부터 결제 처리까지 단 몇 번의 터치로 완료되며, 일일 매출도 자동으로 집계되어 정산의 수고를 덜어드립니다.'
            },
            {
                q: '추천하는 하드웨어가 있나요?',
                a: '데스크탑 PC도 좋지만, 시술 중 이동성이 좋은 아이패드(iPad)나 갤럭시 탭(Galaxy Tab) 같은 태블릿 환경을 강력히 추천합니다. 넓은 화면에서 시술 이력을 보며 직접 메모하기에 최적화되어 있습니다.'
            },
            {
                q: '직원들과 함께 쓸 때 매출 정보를 숨기고 싶어요.',
                a: '직원 계정별 권한 설정 기능을 제공합니다. 일반 직원 계정은 본인의 예약 일정만 확인하고, 전체 매출 현황이나 민감한 초기 설정 정보는 관리자 계정에서만 접근 가능하도록 제한할 수 있어 정보 보안이 철저합니다.'
            },
        ]
    },
    features: {
        title: '강력한 기능',
        items: [

            {
                q: '고객별 시술 주기 관리가 가능한가요?',
                a: '네, 고객 상세 페이지에서 과거 시술 이력을 타임라인 형태로 확인하실 수 있습니다. 특정 시술 후 재방문 주기가 지난 고객을 별도로 필터링하여 맞춤형 재방문 유도 문자를 발송하는 기능도 활용해 보세요.'
            },
            {
                q: '재고 관리가 어려운 비전문가도 쓸 수 있나요?',
                a: '단순히 숫자를 맞추는 재고 관리가 아닙니다. 제품 사용 시 버튼 하나로 소모량이 차감되며, 설정한 안전 재고 이하로 떨어지면 대시보드에서 알림을 띄워주어 주문 시기를 놓치지 않게 도와드립니다.'
            },
        ]
    },
    pricing: {
        title: '가격 및 정책',
        items: [
            {
                q: '가격 정책이 어떻게 되나요?',
                a: '기본적인 샵 운영에 필요한 핵심 기능(예약, 고객관리, 통계)은 무료로 제공됩니다. 저희는 소규모 뷰티 비즈니스의 성장을 응원하며, 비즈니스가 커짐에 따라 필요한 대량 문자 발송 등 일부 고급 기능은 유료로 선택적으로 이용하실 수 있습니다.'
            },
        ]
    },
    security: {
        title: '보안 및 안정성',
        items: [
            {
                q: '제 샵의 정보가 외부에 노출될 걱정은 없나요?',
                a: '모든 데이터는 하이엔드 암호화 알고리즘으로 보호되며, 각 샵의 데이터는 철저히 격리되어 운영됩니다. BeautyHub 운영팀조차 원장님의 허락 없이는 상세 정보에 접근할 수 없는 엄격한 보안 프로토콜을 준수합니다.'
            },
            {
                q: '휴대폰을 분실하거나 컴퓨터가 고장나면 데이터도 사라지나요?',
                a: '아니요, 데이터는 기기가 아닌 중앙 보안 클라우드에 실시간으로 저장됩니다. 새로운 기기에서 로그인만 하시면 이전의 모든 기록을 그대로 확인하실 수 있습니다.'
            },
        ]
    }
}

export default function FAQPage() {
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
                        자주 묻는 질문
                    </Typography>
                    <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.95 }}>
                        BeautyHub 이용에 궁금한 점이 있으신가요?
                        <br />
                        자주 묻는 질문들을 모아 답변해 드립니다.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
                {Object.entries(faqCategories).map(([categoryKey, category]) => (
                    <Box key={categoryKey} sx={{ mb: 6 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <Chip label={category.title} color="primary" sx={{ fontWeight: 600 }} />
                            <Typography variant="caption" color="text.secondary">
                                {category.items.length}개 질문
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            {category.items.map((item, index) => (
                                <Accordion key={index} disableGutters sx={{ '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px !important' }}>
                                    <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                                            {item.q}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                            {item.a}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Container>
        </Box>
    )
}
