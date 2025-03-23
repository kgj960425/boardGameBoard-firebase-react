# Firebase 연습 react 보드게임 [익스플로딩 키튼]

## react 셋팅

1) node.js 설치 
2) terminal에서 npm create vite@lastest (프로젝트명) - vite의 마지막 버전으로 (프로젝트명) 폴더 안에 react 프로젝트 폴더 생성 ex) npm create vite@lastest beardgameboard 
3) npm install -g firebase-tools 
4) npm install vite
5) firebase login
6) firebase init
   PS C:\Users\user\IdeaProjects\boardGameBoard-firebase-react> firebase init

   ######## #### ########  ######## ########     ###     ######  ########
   ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
   ######    ##  ########  ######   ########  #########  ######  ######
   ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
   ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

C:\Users\user\IdeaProjects\boardGameBoard-firebase-react

Before we get started, keep in mind:

* You are initializing within an existing Firebase project directory

? Are you ready to proceed? Yes
? Which Firebase features do you want to set up for this directory? Press Space to select features, then Enter to confirm your choices. Firestore:
Configure security rules and indexes files for Firestore, Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action
deploys

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

i  Using project boardgameboard-35ea9 (BoardGameBoard)

=== Firestore Setup

Firestore Security Rules allow you to define how and when to allow
requests. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore Rules? firestore.rules
? File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console? No

Firestore indexes allow you to perform complex queries while
maintaining performance that scales with the size of the result
set. You can keep index definitions in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore indexes? firestore.indexes.json
? File firestore.indexes.json already exists. Do you want to overwrite it with the Firestore Indexes from the Firebase Console? No

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? build
? Configure as a single-page app (rewrite all urls to /index.html)? No
? Set up automatic builds and deploys with GitHub? No
+  Wrote build/404.html
+  Wrote build/index.html

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

+  Firebase initialization complete!

(주의)   
1) command not found의 경우 아직 node의 npm 명령어를 인식 못한 경우 - vscode 및 노트북 껏다 켜기
2) 허가되지 않은 스크립트 입니다의 경우 - Powershell 검색 - 우클릭 - 관리자 권한으로 실행한 뒤 Set-ExecutionPolicy Unrestricted 입력해서 실행정책 변경

## firebase 셋팅
무료 spark 요금제로 사용하는 기능.

Hosting - 버전, 도메인, 베타 채널 관리.
athentication - 인증
Cloud Firestore - DB
Analytics - 앱 사용 이력 적재 및 분석
Cloud Messaging (FCM) 인증과 연계 하여 계정 찾기 및 알림.

# 조코딩과 https://kmuhan-study.tistory.com/2 을 참고하였다

1) npm install firebase
2) npm install -g firebase-tools
3) firebase login
4) firebase init

##  build를 하면 자동으로 deploy 배포까지

1) .github/workflows/firebase-deploy.yml 파일생성 
2) 
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main  # main 브랜치에 push하면 실행

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18  # 사용하는 Node.js 버전에 맞게 변경

      - name: Install dependencies
        run: npm install  # yarn 사용하면 `yarn install`

      - name: Build project
        run: npm run build  # Vite 사용하면 `npm run build`

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
        env:
          FIREBASE_CLI_EXPERIMENTS: webframeworks

3) Firebase에서 서비스 계정 키 생성
Firebase Console로 이동
프로젝트 설정 → 서비스 계정 탭으로 이동
Firebase Admin SDK → 새 비공개 키 생성 클릭
다운로드된 JSON 파일을 열어서 내용을 복사

4) GitHub Secrets에 등록
GitHub Repository → Settings → Secrets and variables → Actions 이동
New repository secret 클릭
Name: FIREBASE_SERVICE_ACCOUNT
Value: JSON 내용 전체 붙여넣기
저장

5) GitHub Actions 동작 확인
main 브랜치에 push
git add .
git commit -m "자동 배포 테스트"
git push origin main

GitHub → Actions 탭에서 Deploy to Firebase Hosting 워크플로우 실행 확인
성공하면 Firebase에서 배포된 상태 확인









## 카드게임 기본 기능
- 하스스톤, 덱 범위 내에서 마우스 올리면 확대 및 강조 애니메이션, 드래그 끌기 - 제출, [확인] 버튼은 없도록 하자
- 고양이 사진. 많은 고양이 사진
- 숙련자 룰 5자 모으면 다시 더미에서 카드 가져오기 룰
- 확장팩으로 좀비 키튼이 있다.
- 비슷한 게임으로 머핀 게임이 있다.세계 유랑 방방 곡곡, 타코 캣 고트 치즈 피자,순위는 실리카우!,듀오 미니, 카운트업, 라마,,꼼짝마,트러플 셔플,포토제닉,스컬킹,꼬치의 달인











# PSM 모의 면담 과제

```text
모의 면담 과제 Back End 프로젝트 입니다.

PSM(공정안전보고서)

Spring Boot : 2.7.18
```

##

## 프로젝트 구조
- 이 프로젝트는 Spring Boot, Gradle로 구성되었습니다.
```
- 피키지 별 역할

├─api                           # 포털 API
├─constants                     # Enum 등 포털 내부 상수 값
├─exception                     # 포털 에러 핸들링
├─model                         # JPA, Mybatis mapper 등 데이터 처리 객체
├─modules                       # 특정 도메인에 따르지 않는 모듈 기능 (이 프로젝트에는 외부 API 호출 기능만 있다.)
├─spring                        # Security 설정, 데이터 소스 설정 등 프로젝트 기본 설정
└─utils                         # 각종 util 기능

```

## 빌드 및 서버실행
```bash
# 각 모듈의 폴더에서 gradlew bootJar 실행
gradlew bootJar

# build/lis/[모듈].jar 생성확인
# 서버실행 [환경]부분에는 dev, prod 각 개발 환경이 들어감
java -jar -Dspring.profiles.active=[환경] build/lib/[모듈].jar
```
```text
1. 배포 profile
  1) 로컬: local-profile
  2) 개발: dev-profile
  3) 운영: prod-profile
```

## 네이밍 컨벤션
```text
1. Java
  1) 기본적으로 CamelCase를 사용합니다.
    불가피한 경우 snake_case 사용을 허용합니다. ex) 외부 모듈로 부터 받아온 데이터 etc

  2) Controller, Service 에서 사용하는 Method 명 Prefix는 각 기능에 맞춰
    view (or search, retrieve), create, update, delete 를 사용합니다.
    get은 Getter와 혼동되어 가독성을 떨어트릴 수 있으므로 사용하지 않습니다.
```


## JPA 가이드
### 1. 개요
```text
  1) 기본 CUD는 가능한 JPA를 사용합니다.
    테이블 구조변경에 의한 영향도를 낮춰 관리 포인트를 줄이기 위함입니다.

    - CUD를 Mybatis로 작성할 경우 변경 시 쿼리를 하나하나 찾아가며 수정해야 하는 번거로움이 있고,
    - Tool의 전체 수정 기능을 사용할 경우 개발자가 집중력을 잃게 되면 사고로 이어질 위험이 있습니다.

  2) Read는 간단한 기능이라면 JPA나 Querydsl을 사용하고, 복잡한 통계 쿼리의 경우 Mybatis 를 사용합니다.
    - JPA Repository의 query method는 간편하지만 아래와 같은 경우 가독성이 떨어지므로 Mybatis를 사용합니다.
      * query의 인자(컬럼)이 4개 이상인 경우
      * query의 인자가 3개 이상이면서 order by 조건이 2개 이상인 경우

  3) JPA의 Entity는 DB Table의 분신입니다.
    DB구조를 사용자에게 노출하는 것은 보안상 위험한 로직입니다.
    Entity를 직접 사용자에게 Response로 사용하지 않습니다.
```


### 2. CUD 예시
#### 1) create
```java
  public ResponseDto createEntity(RequestDto reqDto) {
    Entity entity = repository.save(new Entity(reqDto)); // new or builder 사용
    return new ResponseDto(entity);
  }
```

#### 2) update
```java
  @Transactional
  public ResponseDto updateEntity(long id, RequestDto reqDto) {
    Entity entity = repository.findById(id)
        .orElseThrow(() -> new Exception(("객체를 찾지 못했습니다. 같은 메세지")));

    // @Transactional 를 걸어두고 Entity 정보를 변경하면 JPA가 감지하여 DB정보를 Update 해줍니다.
    // 방법1) setter를 통해 하나씩 값 입력합니다.
    //     변경하려는 값이 소수일 때 유용합니다.
    entity.setValue1(reqDto.getValue1());
    entity.setValue2(reqDto.getValue2());

    // 방법2) entity 내부에 update 같은 Method를 만들어 여러 값을 변환해줍니다.
    //     변경하려는 값이 너무 많아 Service의 가독성을 해친다 판단될 때 유용합니다.
    entity.update(value1, value2);

    return new ResponseDto(entity);
  }
```

#### 3) delete
```java
  public void deleteEntity(long id) {
    repository.deleteById(id);
  }
```

## api parameter Validation 가이드
```text
@Validated
public class Controller {
    public void controllerMethod(@RequestBody @Valid Dto dto) {}

    public class Dto {
        @NotBlank // 등 알맞는 어노테이션 사용
        private String sample;
    }
}
```
## 페이징 처리 가이드

```text
1. 화면에 반환하기 위한 페이징 객체는 항상 BasePagingDto를 상속받아 사용한다.
2. 페이징을 위한 데이터 조회는 JPA가 아닌 Mybatis로 한다.
```

### 1. BasePagingDto
```java
@Getter
@Setter
@NoArgsConstructor
public class BasePagingDto extends BaseDto {
    private int PageIndex;
    private int PageSize;
    private int totalPage;
    private long totalElements;

    @JsonIgnore
    public void setPagingInfos(Page<?> page) {
        this.setPageIndex(page.getNumber());
        this.setPageSize(page.getSize());
        this.setTotalPage(page.getTotalPages());
        this.setTotalElements(page.getTotalElements());
    }
}

```

### 2.페이징 객체 예시
```java
@Getter
@Setter
public class UserPagingDto extends BasePagingDto {

    private List<UserDto> users;

    public UserPagingDto(Page<UserDto> usersPage) {
        this.users = usersPage.getContent();
        super.setPagingInfos(usersPage);
    }
}

```

### 3. 페이징 처리 Service Method 예시
```java
public UserPagingDto searchUserAll(int pageIndex, int pageSize, String searchWord) {
    // 페이지 인덱스와 사이즈를 받아 Pageable 객체 생성
    Pageable pageable = PageRequest.of(pageIndex, pageSize);

    // 검색 대상 total count 조회
    int total = userMapp.countTotalSearchUser(searchWord);

    // offset, size, searchword 등을 통해 List 검색
    List<UserDto> users =
            userMapp.searchClientUser(pageable.getOffset(), pageable.getPageSize(), searchWord, langCd);

    Page<UserDto> usersPage = new PageImpl<>(users, pageable, total);

    // 정의된 페이징 객체 반환
    return new UserPagingDto(usersPage);
}
```

## Git 가이드
### 1. Branch 전략
```text
prod               운영서버 배포 Branch, develop 이외의 브랜치 생성 금지
  └─ dev           개발서버 배포 Branch
    └─ feature     개발자가 기능 개발하기 위한 Branch, 네이밍ex) feature/{화면}_{기능 또는 대략적인 설명}_{닉네임} (협의 후 변경 가능)
    └─ fix
    └─ bugfix
```

### 2. Merge request
```text
1. MR 작성 전
  1) 리팩토링
  2) 필요없는 주석 정리
  3) 테스트

2. MR 작성 후
  1) 코드 리뷰 진행 후 1명 이상에게 Approve 받은 뒤 Merge
  2) 코드 리뷰 시 생성된 Issue는 가능하면 Issue 제기자가 조치되었음을 확인 후 Resorve 하도록 합니다.
```

## 외부 API 호출 가이드
```java
@GetMapping("/test")
public ResponseEntity<?> test() {

    // API 호출을 위한 기본 정보를 생성 합니다.
    BaseApiRequestInfoDto requestInfoDto =
            BaseApiRequestInfoDto.builder()
                    // 호출 서비스 url
                    .baseUrl("https://swapi.dev/api/")
                    // 호출 api path
                    .apiPath("people/1/")
                    // 호출 http method
                    .httpMethod(HttpMethod.GET)
                    .build();

    /*
     * @param requestInfo
     * @param queryParams (query param이 없다면 NULL)
     * @param requestValue (GET 요청시 NULL)
     * @param responseDtoClass (응답 DTO class)
     */
    Mono<StarwarsDto> questionResponseMono =
            genAiApiCallDecorator.callGenAiApiRequest(requestInfoDto, null, null, StarwarsDto.class);

    StarwarsDto result = questionResponseMono.block();

    return ResponseEntity.ok(result);
}
```



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
