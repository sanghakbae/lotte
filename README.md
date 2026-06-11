# 🍀 행운 로또 · Lucky Lotto

로또 6/45 번호 생성기 웹앱. 완전 랜덤 추첨과 **최근 20년 통계 기반 인기 번호 조합**을 제공하고,
생성한 번호를 Firebase Firestore에 저장·조회할 수 있습니다.

> ⚠️ 로또는 매 회차 완전 무작위 추첨입니다. 과거 통계가 미래 당첨 확률을 높이지 않습니다. **재미로만** 이용하세요.

## ✨ 기능

- **🎲 완전 랜덤** — 1~45 중 6개를 균등 무작위로 추첨
- **🔥 인기 TOP10 조합** — 최근 20년간 1등에 가장 많이 포함된 10개 번호로 조합 생성
  - 각 번호가 **1등에 포함된 횟수**를 함께 표시
- **🏆 최근 당첨번호** — 최근 1등 당첨번호 10회를 회차·날짜·보너스볼과 함께 표시 (왼쪽 패널)
- **☁️ 저장 / 기록** — 생성한 번호를 Firestore에 저장하고, 타임스탬프와 함께 자동으로 목록화 (오른쪽 패널)
- **📅 통계 업데이트 표시** — 데이터가 마지막으로 갱신된 날짜 노출
- **다크 테마 · 100% 반응형** — 데스크톱 3단 레이아웃, 모바일에서는 세로로 깔끔하게 적층
- **KoPub World 돋움체** 적용

## 🗂 구성

| 파일 | 설명 |
|---|---|
| `index.html` | 단일 파일 웹앱 (UI + Firebase 연동, 외부 의존성은 CDN) |
| `refresh_top10.mjs` | 최근 20년 통계(TOP10 + 포함 횟수)와 최근 당첨번호를 재집계해 `index.html`을 갱신 |
| `.github/workflows/weekly-refresh.yml` | 매주 월요일 자동 갱신 워크플로 |

## 🔁 매주 월요일 자동 갱신

로또는 매주 토요일 추첨됩니다. 워크플로가 **매주 월요일 00:00 UTC(09:00 KST)** 에 실행되어:

1. 최신 당첨 데이터를 받아옵니다 (출처: [smok95/lotto](https://github.com/smok95/lotto))
2. 전주 1등 번호를 포함해 **최근 20년 통계를 재집계**합니다
3. `index.html`의 `TOP10`·`RECENT_WINS`·`LAST_UPDATED`를 갱신합니다
4. 변경이 있으면 `github-actions[bot]`이 자동 커밋·푸시합니다

수동 실행: GitHub **Actions 탭 → Weekly TOP10 & Recent Wins Refresh → Run workflow**
또는 로컬에서:

```bash
node refresh_top10.mjs   # 파일만 갱신 (git 작업 없음)
```

## 🔥 Firebase (Firestore)

- 프로젝트: `lotte-d9e9a`
- 컬렉션: `lotto_games`
- 문서 스키마 (Firestore는 중첩 배열을 지원하지 않아 게임을 맵으로 감쌈):

```jsonc
{
  "games": [ { "nums": [3, 6, 12, 18, 33, 45] }, ... ],
  "count": 5,
  "mode": "random | popular",
  "source": "web",
  "createdAt": <serverTimestamp>
}
```

- 보안 규칙: `lotto_games`에 대해 읽기·생성 공개, 수정·삭제 차단

## 🚀 로컬 실행

별도 빌드가 없습니다. 파일을 브라우저로 열면 됩니다.

```bash
open index.html        # macOS
```

## 🔐 보안 주의

- 웹 `apiKey`는 클라이언트에 노출되는 공개 값이라 그 자체로는 위험하지 않습니다.
- **Firebase Admin SDK 서비스 계정 키는 절대 커밋하지 마세요.** `.gitignore`로 `*firebase-adminsdk*.json`, `admin_*.mjs` 등을 차단합니다.

## 🛠 기술 스택

- 순수 HTML/CSS/JS (프레임워크 없음)
- Firebase JS SDK v10 (Firestore)
- GitHub Actions (주간 자동 갱신)
- KoPub World Dotum 웹폰트
