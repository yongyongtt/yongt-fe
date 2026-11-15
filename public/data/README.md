# 용인시 행정동 경계

사용자가 제공한 `screen-map/screen-map/yongin-dong.geojson`을 원본 그대로 복사했다. 38개 Polygon의 경위도 좌표, 행정동 코드, 이름, 구, 중심점을 포함한다.

API `/api/dashboard/map`의 `regionCode`와 GeoJSON `properties.code`를 연결한다. 브라우저는 이 파일을 한 번 읽어 Web Mercator로 투영하고 화면 비율에 맞춘다. 점수·기간 데이터와 독립적으로 캐시한다. 경계 자료가 실패하면 가상 지도로 대체하지 않는다.
