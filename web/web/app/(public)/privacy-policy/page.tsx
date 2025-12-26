import { Metadata } from 'next'
import { Box, Container, Typography, Paper } from '@mui/material'

export const metadata: Metadata = {
    title: '개인정보처리방침 - BeautyHub',
    description: 'BeautyHub의 개인정보처리방침입니다. 이용자의 개인정보 보호를 위한 정책을 확인하세요.',
}

export default function PrivacyPolicyPage() {
    return (
        <Box>
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: { xs: 8, md: 10 },
                textAlign: 'center'
            }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                        개인정보처리방침
                    </Typography>
                    <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.95 }}>
                        BeautyHub는 이용자의 개인정보를 소중하게 생각하며,
                        <br />
                        안전하게 보호하기 위해 최선을 다하고 있습니다.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, border: '1px solid #eee' }}>
                    <Typography variant="body1" paragraph>
                        BeautyHub 운영팀(이하 '회사')은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령을 준수하며, 이용자의 개인정보 보호를 위해 다음과 같은 처리방침을 수립 공개합니다. 이 방침은 2024년 1월 1일부터 시행됩니다.
                    </Typography>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            1. 개인정보의 수집 및 이용 목적
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            회사는 다음의 목적을 위해 개인정보를 수집하고 이용합니다. 수집된 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        </Typography>
                        <ul style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 가입 의사 확인, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 가입 횟수 제한, 분쟁 조정을 위한 기록 보존, 불만 처리 등 민원 처리, 고지사항 전달</li>
                            <li>서비스 제공: CRM 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 요금 결제 및 정산</li>
                            <li>마케팅 및 광고 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여 기회 제공, 접속 빈도 파악, 회원의 서비스 이용에 대한 통계</li>
                        </ul>
                    </Box>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            2. 수집하는 개인정보의 항목
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.
                        </Typography>
                        <ul style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                            <li>수집 항목: 이름, 로그인ID(이메일), 비밀번호, 휴대전화번호, 상호명, 주소</li>
                            <li>자동 수집 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                        </ul>
                    </Box>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            3. 개인정보의 처리 및 보유 기간
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
                        </Typography>
                        <ul style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                            <li>회원 가입 및 관리: 회원 탈퇴 시까지 (다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                            <li>재화 또는 서비스 제공: 재화·서비스 공급 완료 및 요금 결제·정산 완료 시까지</li>
                        </ul>
                    </Box>

                    {/* ... 더 많은 조항들 ... */}

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            9. 개인정보 처리방침의 변경
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            이 개인정보 처리방침은 2024년 1월 1일부터 적용됩니다. 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}
