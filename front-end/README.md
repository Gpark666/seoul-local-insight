# 지역 생활정보 서비스 프런트엔드

팀원이 구현한 화면과 서비스 연계 소스입니다. 본인은 PM·시스템 설계·백엔드를 담당하고 후배 팀원의 프런트 개발을 지도·지원했습니다.

날씨·인구·지도 화면으로 구성되며, 공통 지역 상태는 `src/providers/RegionDataProvider.tsx`에서 관리합니다. 지도는 브라우저 네이버 JavaScript API를 사용하고 지역 검색은 Expo 서버 API인 `src/app/api/search+api.ts`를 거칩니다.

[프로젝트 소개](../README.md) · [설치와 실행](../docs/setup.md) · [역할 구분](../docs/contribution_scope.md)
