# 설치와 실행

이 문서는 보관 소스의 실행 구성을 정리합니다. 외부 API 인증과 허용 도메인 설정은 사용하는 계정 환경에 맞춰 준비합니다. 공개 정리 과정에서는 원격 API를 실제 호출하지 않았습니다.

## 필요한 설정

| 위치 | 설정 | 목적 |
|---|---|---|
| back-end/.env | KMA_APIHUB_AUTH_KEY | 기상청 APIHub 인증 |
| back-end/.env | SEOUL_API_KEY | 서울시 실시간 인구 인증 |
| back-end/.env | CORS_ORIGINS | 프런트 출처 목록, 쉼표로 구분 |
| front-end/.env | EXPO_PUBLIC_API_BASE_URL | FastAPI 주소 |
| front-end/.env | EXPO_PUBLIC_NAVER_MAP_CLIENT_ID | 브라우저 지도 클라이언트 식별자 |
| front-end/.env | NAVER_SEARCH_CLIENT_ID, NAVER_SEARCH_CLIENT_SECRET | Expo 서버의 네이버 검색 인증 |

각 폴더의 `.env.example`을 복사해 로컬 `.env`를 만듭니다. 검색 secret은 서버용 `NAVER_SEARCH_CLIENT_SECRET`에 설정합니다. 원본 코드의 대체 변수 이름이 있어도 예시에서는 검색 secret에 공개 접두사를 사용하지 않습니다.

## 백엔드

원본 실행 흔적은 Python 3.12이며 의존성은 `back-end/requirements.txt`에 보관했습니다. 프로젝트 루트에서:

```powershell
cd back-end
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

환경변수는 백엔드 현재 작업 폴더의 `.env`에서 읽습니다. 서버 실행 후 `/health`, `/docs`에서 상태와 OpenAPI 문서를 확인할 수 있습니다. 실제 날씨·인구 호출에는 유효한 인증과 외부 연결이 필요합니다.

## 프런트 웹

별도 터미널에서:

```powershell
cd front-end
npm ci
npx expo start --web
```

`package.json`에는 Expo 54·React 19·React Native Web 구성이 기록돼 있습니다. 지도는 JavaScript 지도 SDK와 브라우저 위치 정보를 사용합니다. `app.json`의 웹 출력은 `server`이며 `/api/search`를 함께 제공하는 구성입니다.

## 기준 장소 재생성

기존 `back-end/data/seoul_realtime_landmarks.json`으로 서비스가 기준 좌표를 읽습니다. 재생성이 필요하면 `back-end`에서 아래 명령을 사용합니다.

```powershell
python scripts/build_seoul_realtime_landmarker.py --help
```

스크립트는 기본 XLSX 입력과 네이버 검색 인증을 사용합니다. 단독 실행 스크립트가 요구하는 환경변수는 실행 셸에서 먼저 설정합니다. 조회 옵션에 따라 외부 API를 호출하므로 기존 결과와 미해결 항목을 비교해 반영합니다.
