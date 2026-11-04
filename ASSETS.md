# 이미지 자산

시드니 히어로는 실제 Sydney Harbour Bridge 야경 사진이며, 다른 도시를 선택해도 브랜드를 대표하는 시드니 이미지로 유지됩니다. 이미지 검색 결과의 원본을 프로젝트 public/images에 복사했습니다.

- `sydney-harbour.jpg`: Unsplash, “Sydney harbour bridge illuminated at night with city lights”. 수집 URL: https://files.manuscdn.com/search-media/310519664031595324/pKfey5m2F2LE9pLL2ZQ8iN/XYzpsSwAsrWhgbZn5v9sUb.jpg . 출처 카탈로그: https://unsplash.com/s/photos/sydney-night
- `lounge.jpg`: “Sip In Style At Washington, D.C.'s Stunning New Bars”, 실내 분위기를 보여주는 예시 이미지. https://files.manuscdn.com/search-media/310519664031595324/pKfey5m2F2LE9pLL2ZQ8iN/9gE7fFUWyYQNSS4X5nQiqm.jpg
- `cocktail-bar.jpg`: “Ghislaine Viñas Co-Designs Andra Hem, a Chic Bar and Hotel”, 실내 분위기를 보여주는 예시 이미지. https://files.manuscdn.com/search-media/310519664031595324/pKfey5m2F2LE9pLL2ZQ8iN/rAbQhkMWYn8PMgD3dzshhY.jpg
- `late-night.jpg`: DLR Group, “Momentum KC Signature Lounge”, 실내 분위기를 보여주는 예시 이미지. https://files.manuscdn.com/search-media/310519664031595324/pKfey5m2F2LE9pLL2ZQ8iN/iKsBK2TkuBGd4FEB3kuBvK.jpg
- `rooftop.jpg`: Visit West Hollywood, “11 Ritzy Hotel Lounges in West Hollywood”, 실내 분위기를 보여주는 예시 이미지. https://files.manuscdn.com/search-media/310519664031595324/pKfey5m2F2LE9pLL2ZQ8iN/S74Y2mu7vS3a6WRGZ5wcnE.jpg

업체 명칭과 장소 정보는 허구의 샘플입니다. 실내 이미지가 호주의 실제 등록 업체 사진인 것처럼 표현하지 않습니다. 프로덕션 출시 시 업체 제공 사진 또는 상업 사용 권한이 확인된 이미지로 교체해야 합니다. 이 Day 1 버전은 공개 배포하지 않고 미리보기로 전달합니다.

## Day 4 mock-card interiors

Two fictional architectural interior illustrations were requested for the wellness and retail mock cards. They contain no people or explicit products and do not represent actual businesses. The website uses their managed asset paths directly: wellness spa at `/manus-storage/async-images/dBDTeZ7i189CNhrX2hrKRh/image-1.webp`, and discreet lifestyle boutique at `/manus-storage/async-images/dBDTeZ7i189CNhrX2hrKRh/image-2.webp`.

These assets are delivered to managed storage, not the originally requested local file identifiers. Existing nightlife thumbnails retain the Day 1 image sources documented above.

## Day 10 — Social brand asset

`public/icons/brand-social.png` is a 512×512 PNG re-encoding of the existing `public/icons/icon.svg` artwork. No new text, labels, photography or place depiction was added. Local-route social metadata uses the actual publication origin for this asset only when that origin is explicitly configured.

## Day 17 — Editorial visuals

The Sydney blog reuses the actual harbour photograph at `/manus-storage/sydney-harbour_4909edcf.jpg`. The Melbourne safety guide reuses the Day 4 fictional boutique illustration at `/manus-storage/async-images/dBDTeZ7i189CNhrX2hrKRh/image-2.webp` and explicitly captions it as illustrative, not a photograph of a Melbourne business. Article venue-card thumbnails retain their existing demonstration captions and image provenance.

## Day 18 — Dynamic OG artwork

The `/api/og` renderer reuses `public/icons/icon.svg` as an embedded HB mark and `public/fonts/inter-4.ttf` as its local Inter 800 typeface. The artwork is deterministic React/Satori source in `components/OgImageCard.tsx`; no third-party venue photo, newly generated AI illustration or caller-provided remote image is included. Test PNGs under ignored `audit-results/day18/` are evidence only, not separate production assets.
