import { Metadata } from 'next'
import { Box, Container, Typography, Paper } from '@mui/material'

export const metadata: Metadata = {
    title: '이용약관 - BeautyHub',
    description: 'BeautyHub 서비스 이용약관입니다. 서비스 이용 조건 및 절차를 확인하세요.',
}

export default function TermsOfServicePage() {
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
                        이용약관
                    </Typography>
                    <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, opacity: 0.95 }}>
                        BeautyHub 서비스 이용에 관한 약관입니다.
                        <br />
                        투명하고 공정한 서비스 이용을 위해 꼭 확인해주세요.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, border: '1px solid #eee' }}>
                    <Typography variant="body1" paragraph>
                        이 약관은 BeautyHub 운영팀(이하 '회사')이 제공하는 CRM 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                    </Typography>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            1. 목적
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            이 약관은 회사가 제공하는 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </Typography>
                    </Box>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            2. 용어의 정의
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                        </Typography>
                        <ul style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                            <li>"서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 BeautyHub CRM 및 관련 제반 서비스를 의미합니다.</li>
                            <li>"회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                            <li>"아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 말합니다.</li>
                            <li>"비밀번호"라 함은 회원이 부여 받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 말합니다.</li>
                        </ul>
                    </Box>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            3. 약관의 게시와 개정
                        </Typography>
                        <ul style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.5rem' }}>
                            <li>회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                            <li>회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                            <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
                        </ul>
                    </Box>

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            4. 이용계약의 성립
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                            이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                        </Typography>
                    </Box>

                    {/* ... 더 많은 조항들 ... */}

                    <Box component="section" sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            11. 분쟁의 해결
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            회사와 회원은 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 하여야 합니다. 제1항의 규정에도 불구하고 분쟁으로 인하여 소송이 제기될 경우 동 소송은 회사의 본사 소재지를 관할하는 법원의 관할로 합니다.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}
