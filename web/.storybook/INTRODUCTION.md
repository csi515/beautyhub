# Storybook 사용 가이드

## 개요

이 Storybook은 프로젝트의 모든 UI 컴포넌트를 문서화하고 테스트하는 데 사용됩니다.

## 핵심 원칙

### 1. 모바일 우선 (Mobile First)

모든 컴포넌트는 모바일 화면을 기준으로 설계되었습니다.

- 최소 터치 타겟: 44px
- 모바일 뷰포트 프리셋: iPhone SE, iPhone Pro, Galaxy S
- 반응형 디자인: xs → sm → md → lg

### 2. 공통 컴포넌트 사용

**중요**: Storybook에 없는 컴포넌트는 사용할 수 없습니다.

- 모든 UI는 반드시 Storybook에 정의된 컴포넌트를 사용
- 임의 Button / Card / Input / Margin / 색상 생성 금지
- Storybook에 없는 UI가 필요하면 먼저 Storybook에 컴포넌트 추가

### 3. 일관성 유지

- 동일한 UI는 항상 동일하게 보임
- 페이지별 임의 스타일 정의 금지
- 공통 컴포넌트를 통한 일관된 디자인

## 컴포넌트 상태

각 컴포넌트는 최소한 다음 상태를 포함합니다:

- **기본 상태**: 일반적인 사용 예시
- **로딩 상태**: 데이터 로딩 중 표시
- **빈 상태**: 데이터가 없을 때 표시
- **에러 상태**: 오류 발생 시 표시 (해당되는 경우)
- **모바일 뷰**: 모바일 화면에서의 모습

## Interaction 테스트

주요 컴포넌트는 Interaction 테스트를 포함합니다:

- Button: 클릭 이벤트, 로딩 상태 전환
- Modal: 열기/닫기, 외부 클릭 처리
- DataTable: 페이지네이션 클릭, 정렬 헤더 클릭
- Input: 입력, 포커스, 에러 상태

## 접근성 (A11y)

모든 컴포넌트는 접근성을 고려하여 설계되었습니다:

- 키보드 네비게이션 지원
- ARIA 라벨 제공
- 포커스 관리
- 스크린 리더 호환

## 사용 방법

### 컴포넌트 찾기

좌측 사이드바에서 컴포넌트를 찾을 수 있습니다:
- `UI/Button`: 버튼 컴포넌트
- `UI/Card`: 카드 컴포넌트
- `UI/Input`: 입력 컴포넌트
- `UI/Modal`: 모달 컴포넌트
- `UI/DataTable`: 데이터 테이블 컴포넌트
- `UI/PageHeader`: 페이지 헤더 컴포넌트

### 뷰포트 테스트

상단 툴바의 뷰포트 선택기를 사용하여 다양한 화면 크기에서 테스트할 수 있습니다:
- iPhone SE (375x667)
- iPhone Pro (390x844)
- Galaxy S (360x800)

### Controls 사용

각 스토리의 Controls 패널에서 props를 실시간으로 변경하여 컴포넌트를 테스트할 수 있습니다.

## 개발 워크플로우

1. **새 컴포넌트 추가 시**:
   - 먼저 Storybook에 컴포넌트 추가
   - 모든 상태 (기본, 로딩, 빈, 에러) 구현
   - 모바일 뷰 확인
   - Interaction 테스트 추가 (해당되는 경우)

2. **기존 컴포넌트 수정 시**:
   - Storybook에서 변경사항 확인
   - 모든 스토리가 정상 작동하는지 확인
   - 모바일 뷰에서 레이아웃 깨짐 확인

3. **페이지에서 사용 시**:
   - Storybook에 있는 컴포넌트만 사용
   - MUI 컴포넌트 직접 import 금지 (hooks, theme API는 예외)

## 빌드 및 배포

```bash
# Storybook 개발 서버 실행
npm run storybook

# Storybook 정적 빌드
npm run build-storybook
```

빌드 산출물은 `storybook-static/` 디렉토리에 생성되며, `.gitignore`에 포함되어 있습니다.
