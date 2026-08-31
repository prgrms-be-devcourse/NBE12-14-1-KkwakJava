# ☕ Coffee Order System
> 사용자의 간편한 카페 메뉴 주문과 관리자의 상품·주문 관리를 제공하는 카페 메뉴 주문 웹 애플리케이션입니다.

## 📖 서비스 소개
* **고객:** 실시간으로 판매 중인 원두 목록을 확인하고 간편하게 주문을 생성 및 관리합니다.
* **관리자 / 배송 담당자:** 상품 등록/수정/삭제 및 일일 배송 마감(전날 14시~당일 14시) 기준에 따른 발송 대상 주문을 관리합니다.

## 👥 멤버
<table>
  <tr>
    <th colspan="5" align="center">풀스택 (Frontend / Backend)</th>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/sowon11.png" width="100" height="100" /></td>
    <td align="center"><img src="https://github.com/jkidse14.png" width="100" height="100" /></td>
    <td align="center"><img src="https://github.com/seul43.png" width="100" height="100" /></td>
    <td align="center"><img src="https://github.com/GibGui.png" width="100" height="100" /></td>
    <td align="center"><img src="https://github.com/cheeerry0.png" width="100" height="100" /></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/sowon11">강소원</a></td>
    <td align="center"><a href="https://github.com/jkidse14">백한비</a></td>
    <td align="center"><a href="https://github.com/seul43">이슬</a></td>
    <td align="center"><a href="https://github.com/GibGui">홍승연</a></td>
    <td align="center"><a href="https://github.com/cheeerry0">황희리</a></td>
  </tr>
</table>

## ⚙ 기술 스택
### ✏️ 프론트엔드
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="50" height="50"/><br>Typescript | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="50" height="50"/><br>React | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" width="50" height="50"/><br>Next.js | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="50" height="50"/><br>Tailwind CSS |
| :---: | :---: | :---: | :---: |
* **Language:** Typescript
* **Framework:** Next.js, React
* **Styling:** Tailwind CSS

### 🛠 백엔드
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" width="50" height="50"/><br>Java | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" width="50" height="50"/><br>Spring Boot | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/junit/junit-original.svg" width="50" height="50"/><br>JUnit 5 |
| :---: | :---: | :---: |
* **Language:** Java-25
* **Framework:** Spring Boot-4.1.1, Spring Data Jpa
* **Test:** Junit5

### 📦 인프라 & 도구
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" width="50" height="50"/><br>Git | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" width="50" height="50"/><br>GitHub | <img src="https://h2database.com/html/images/h2-logo-2.png" width="50" height="50"/><br>H2 Database |
| :---: | :---: | :---: |
* **Database:** H2 Database
* **VCS / Tools:** Git, GitHub

## 📌 핵심 기능
* **API 명세:** [Notion API 명세서 바로가기](https://app.notion.com/p/API-Mock-Server-3c715a01205482979be981a67c995fa1?source=copy_link)

### 👤 고객
* **상품 조회 및 주문:** 판매 중인 원두 상품 목록을 확인하고 장바구니에 담아 주문할 수 있습니다.
* **비회원 주문:** 별도 회원가입 없이 이메일 · 우편번호 · 주소만 입력하면 주문이 생성됩니다.
* **주문 조회:** 주문 완료 후 입력한 이메일로 배송 현황 페이지(`/delivery?email=...`)에서 본인 주문을 확인할 수 있습니다.

### 🛠 관리자
* **상품 관리:** 원두 상품을 등록 · 수정 · 삭제할 수 있습니다.
* **배송 관리:** 이메일로 특정 고객의 배송 내역을 검색하거나 전체 배송 내역을 조회하고, 배송 완료 여부를 한눈에 확인할 수 있습니다.
* **주문 병합 조회:** 한 고객이 같은 배송 주기 내 여러 번 주문해도, 배송 관리 화면에서는 이메일 · 배송일 기준으로 하나의 배송 건으로 병합되어 표시됩니다.

## 🗄 데이터베이스 구조 (ERD)
<img width="738" height="376" alt="ERD-java" src="https://github.com/user-attachments/assets/3add81bf-19d4-47d1-a500-895e10473404" />

## 🤝 우리가 협업하는 법
* 결정은 다 같이
* 비난 없는 의사소통
* 설명은 핵심만
* 공적인 회의는 존댓말 사용
