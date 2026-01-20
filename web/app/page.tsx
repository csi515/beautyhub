import { Metadata } from 'next'
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack } from '@mui/material'
import { CheckCircle, Calendar, Users, DollarSign, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import PublicHeader from './components/PublicHeader'
import PublicFooter from './components/PublicFooter'

export const metadata: Metadata = {
  title: 'BeautyHub - 피부관리샵 전용 고객 관리 시스템',
  description: '1인 피부관리샵부터 중소규모 뷰티샵까지. 예약 관리, 고객 정보, 재무 관리를 한 곳에서. 자신의 샵 이름으로 설정하고 바로 사용하세요.',
  keywords: '피부관리샵, CRM, 고객 관리, 예약 시스템, 재무 관리, 뷰티 비즈니스, 샵 관리',
}

const features = [
  {
    icon: Calendar,
    title: '스마트 예약 관리',
    description: '고객 예약을 쉽게 관리하고, 일정을 한눈에 파악하세요. 알림 기능으로 노쇼를 방지하고 고객 만족도를 높입니다.'
  },
  {
    icon: Users,
    title: '통합 고객 관리',
    description: '고객의 방문 이력, 구매 내역, 선호 서비스를 한 곳에서 관리하세요. 맞춤형 서비스 제공으로 재방문율을 높입니다.'
  },
  {
    icon: DollarSign,
    title: '재무 관리',
    description: '매출, 지출을 자동으로 기록하고 분석하세요. 실시간 재무 현황으로 비즈니스 의사결정을 빠르게 내립니다.'
  },
  {
    icon: Package,
    title: '제품 재고 관리',
    description: '판매 제품과 시술 패키지를 효율적으로 관리하세요. 재고 현황을 실시간으로 파악하고 적시에 보충합니다.'
  },
  {
    icon: TrendingUp,
    title: '매출 분석 대시보드',
    description: '일/월/연 단위 매출 추이를 시각화된 차트로 확인하세요. 데이터 기반 의사결정으로 매출을 극대화합니다.'
  },
  {
    icon: CheckCircle,
    title: '간편한 사용',
    description: '복잡한 설정 없이 바로 시작할 수 있습니다. 직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다.'
  },
]

const benefits = [
  '현장의 목소리를 담은 직관적인 예약 시스템',
  '고객별 시술 히스토리 무제한 기록',
  '터치 몇 번으로 끝나는 투명한 정산 관리',
  '내 샵 이름으로 운영하는 맞춤형 브랜딩',
]

export default function LandingPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />

      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, sm: 8, md: 12 },
          px: { xs: 1.5, sm: 2, md: 3 },
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: '1200px' }, position: 'relative', zIndex: 1, width: '100%' }}>
            <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack spacing={{ xs: 2, sm: 3 }}>
                  <Typography 
                    variant="h1" 
                    component="h1" 
                    fontWeight={800} 
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                      lineHeight: 1.2,
                      mb: 1
                    }}
                  >
                    성공하는 뷰티샵을 위한
                    <br />
                    가장 든든한 비즈니스 파트너
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95, 
                      lineHeight: 1.7,
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.125rem' }
                    }}
                  >
                    복잡한 운영은 시스템에 맡기고, 원장님은 오직 고객에게만 집중하세요.
                    BeautyHub는 1인 샵 원장님이 겪는 운영의 번거로움을 가장 잘 이해합니다.
                    예약 누락 걱정 없는 스마트 일정관리부터 데이터 기반의 매출 분석까지,
                    성장하는 뷰티 비즈니스의 시작을 함께합니다.
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    sx={{ mt: { xs: 2, sm: 3 } }}
                  >
                    <Button
                      component={Link}
                      href="/signup"
                      variant="contained"
                      size="large"
                      fullWidth={false}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        minHeight: { xs: '48px', md: '52px' },
                        px: { xs: 4, md: 6 },
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      무료로 시작하기
                    </Button>
                    <Button
                      component={Link}
                      href="/features"
                      variant="outlined"
                      size="large"
                      fullWidth={false}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        minHeight: { xs: '48px', md: '52px' },
                        px: { xs: 4, md: 6 },
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        fontWeight: 600,
                        '&:hover': { 
                          borderColor: 'rgba(255,255,255,0.8)', 
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                    >
                      자세히 알아보기
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'left', md: 'center' }, mt: { xs: 4, md: 0 } }}>
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                      mb: 3
                    }}
                  >
                    성장하는 원장님들의 이유 있는 선택
                  </Typography>
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    {benefits.map((benefit, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: { xs: 'flex-start', md: 'center' },
                          gap: { xs: 1.5, sm: 2 },
                          textAlign: 'left'
                        }}
                      >
                        <CheckCircle 
                          size={24} 
                          style={{ 
                            flexShrink: 0,
                            marginTop: '2px'
                          }} 
                        />
                        <Typography 
                          variant="body1"
                          sx={{
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            lineHeight: 1.6
                          }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth={false} sx={{ py: { xs: 6, sm: 8, md: 10 }, px: { xs: 1.5, sm: 2, md: 3 }, maxWidth: { xs: '100%', md: '1200px' }, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700} 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              샵 운영에 필요한 모든 것
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              불필요한 기능은 덜어내고 핵심에만 집중했습니다
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { 
                        transform: { xs: 'none', md: 'translateY(-8px)' },
                        boxShadow: { xs: 2, md: 6 }
                      },
                      cursor: { xs: 'default', md: 'pointer' }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Box sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <Icon size={24} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom
                        sx={{
                          fontSize: { xs: '1.125rem', md: '1.25rem' },
                          mb: 1.5
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        lineHeight={1.7}
                        sx={{
                          fontSize: { xs: '0.875rem', md: '0.9375rem' }
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Container>

        {/* Why Section */}
        <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, sm: 8, md: 10 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: '1200px' }, width: '100%' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700} 
              textAlign="center" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                mb: 1
              }}
            >
              BeautyHub와 함께 성장에 집중하세요
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              textAlign="center" 
              sx={{ 
                mb: { xs: 4, md: 6 },
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              전국 수많은 원장님들이 BeautyHub와 함께 비즈니스를 키워가고 있습니다
            </Typography>

            <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={{ xs: 2.5, sm: 3 }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        mb: 1.5
                      }}
                    >
                      1. 피부관리샵에 최적화된 기능
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      lineHeight={1.8}
                      sx={{
                        fontSize: { xs: '0.9375rem', md: '1rem' }
                      }}
                    >
                      일반적인 CRM과 달리, 피부관리샵의 실제 운영 환경을 반영하여 설계되었습니다.
                      시술 패키지 관리, 고객별 피부 타입 기록, 제품 재고 관리 등 피부관리샵에 꼭 필요한 기능들을 제공합니다.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        mb: 1.5
                      }}
                    >
                      2. 클라우드 기반 실시간 동기화
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      lineHeight={1.8}
                      sx={{
                        fontSize: { xs: '0.9375rem', md: '1rem' }
                      }}
                    >
                      데이터는 안전하게 클라우드에 저장되며, 어떤 기기에서든 실시간으로 동기화됩니다.
                      PC, 태블릿, 스마트폰 어디서나 접속하여 고객 정보를 확인하고 예약을 관리할 수 있습니다.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={{ xs: 2.5, sm: 3 }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        mb: 1.5
                      }}
                    >
                      3. 쉬운 사용법, 빠른 학습
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      lineHeight={1.8}
                      sx={{
                        fontSize: { xs: '0.9375rem', md: '1rem' }
                      }}
                    >
                      복잡한 매뉴얼이 필요 없습니다. 직관적인 인터페이스로 누구나 10분이면 기본 기능을 익힐 수 있습니다.
                      별도의 교육 없이도 바로 업무에 활용할 수 있습니다.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        mb: 1.5
                      }}
                    >
                      4. 합리적인 가격
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      lineHeight={1.8}
                      sx={{
                        fontSize: { xs: '0.9375rem', md: '1rem' }
                      }}
                    >
                      소규모 샵도 부담 없이 시작할 수 있는 가격 정책을 제공합니다.
                      기본 기능은 무료로 사용하고, 필요한 고급 기능만 선택하여 이용할 수 있습니다.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, textAlign: 'center', px: { xs: 1.5, sm: 2, md: 3 } }}>
          <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: '768px' }, width: '100%' }}>
            <Typography 
              variant="h3" 
              fontWeight={700} 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                mb: 1
              }}
            >
              지금 바로 시작하세요
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              지금 바로 무료로 시작하세요
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ maxWidth: { xs: '100%', sm: 500 }, mx: 'auto' }}
            >
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                fullWidth={true}
                sx={{ 
                  minHeight: { xs: '48px', md: '52px' },
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  px: 4 
                }}
              >
                무료로 시작하기
              </Button>
              <Button
                component={Link}
                href="/features"
                variant="outlined"
                size="large"
                fullWidth={true}
                sx={{ 
                  minHeight: { xs: '48px', md: '52px' },
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 600,
                  px: 4 
                }}
              >
                기능 둘러보기
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      <PublicFooter />
    </Box>
  )
}
