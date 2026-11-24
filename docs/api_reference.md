# API 명세

## 백엔드 엔드포인트

| 메서드 | 경로 | 기능 |
|---|---|---|
| GET | /health | status: ok 반환 |
| GET | /api/v1/weather/current | 좌표 기준 관측·시간별·일별·중기 날씨 |
| GET | /api/v1/population/nearby | 반경 내 측정지역 인구와 혼잡도 |

날씨·인구의 `latitude`는 -90~90, `longitude`는 -180~180 범위의 필수 숫자입니다.

## 인구 조회 옵션

| 쿼리 | 기본값 | 허용 범위 | 단위 |
|---|---:|---|---|
| radius_m | 3000 | 1~20000 | m |
| limit | 5 | 1~20 | 개 |

날씨·인구 공통 화면은 5km·8개를 요청합니다. 지도 시설별 혼잡도 마커는 1.5km·1개, 선택 장소 상세는 1.5km·5개를 요청한 뒤 가까운 지역을 선택합니다. 프런트의 요청값과 백엔드 기본값은 구분합니다.

## 날씨 응답

최상위는 `latitude`, `longitude`, `grid_x`, `grid_y`, `current`, `hourly`, `daily`, `weekly`입니다.

- current: 관측 시각, 기온, 습도, 풍속, 풍향, 체감온도, 날씨 상태
- hourly: 예보 시각, 기온, 습도, 풍속, 날씨 상태
- daily: 날짜, 최저·최고 기온, 날씨 상태
- weekly: 날짜, 날씨 상태, 최저·최고 기온, 강수확률, 원천 구분

자료가 없는 수치는 모델에서 nullable로 처리합니다. 날짜·시간은 직렬화된 날짜 또는 시각 값으로 전달합니다.

## 인구 응답

최상위는 요청 좌표, `radius_m`, `requested_at`, `items`이며, 각 항목은 `area_code`, `area_name`, `latitude`, `longitude`, `distance_m`, `population_min`, `population_max`, `congestion_level`, `congestion_message`, `measured_at` 등을 포함합니다.

혼잡도 내부 상태는 `relaxed`, `normal`, `slightly_crowded`, `crowded`, `unavailable`입니다. 반경 내 기준 장소가 없으면 빈 `items`를 반환합니다.

## 오류 처리

- 422: 쿼리 누락·범위 위반 또는 유효하지 않은 입력
- 502: 외부 데이터 요청·응답 처리 실패. 인구는 전부 실패한 경우 오류로 처리

## 프런트 서버의 검색 API

`GET /api/search?query=검색어`는 Expo 서버 라우트입니다. 네이버 APIHub의 지역 검색을 먼저 요청하고 실패하면 기존 네이버 지역 검색 API로 대체 요청합니다. 응답의 `items`에는 명칭·주소·도로명 주소·지도 좌표가 포함됩니다.

이 경로는 FastAPI가 제공하는 엔드포인트가 아니며 Expo 웹 서버에서 함께 실행됩니다.
