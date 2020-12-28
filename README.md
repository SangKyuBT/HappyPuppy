# HappyPuppy
소개 ( http://54.180.93.116 프록시는 nginx로 구성되어 있습니다.)
vue js와 node js를 공부 하면서 견주들을 위한 웹 어플리케이션을 만들어 보았습니다.
해당 프로젝트는 멀티미디어 플랫폼입니다. (멀티미디어 업로드, 동영상 스트리밍, 이미지 추출)
PDF 파일 생성(vuejs에서 동작함으로 자세한 사항은 해당 url를 방문하세요)

간략한 설명
해당 프로젝트는 vue cli를 이용하여 생성한 웹팩을 run build한 프로젝트입니다.
VUE JS의 자세한 정보를 확인하고 싶으시다면 해당 url를 방문하세요. <a href="https://github.com/SangkyuGoodboyYesDoitsgoi/HappyPuppy-vue">Here</a>

프로젝트의 대략적인 사용 기술과 버전은 다음과 같습니다.
node 12.14.1
npm 6.13.4
vue/cli 4.1.2
mysql 5.7.30
aws(ec2, rds, s3)
api : 네이버 로그인(추출 : 이메일, 이름), 카카오맵
사용 모듈은 package.json를 참고하세요.
Vue js의 사용 라이브러리는 해당 url를 방문하세요.

알림
테스트 하시는 본인의 aws-s3, aws-rds-mysql이 필요합니다.
mysql이 꼭 aws-rds를 이용할 필요는 없습니다. 로컬에 설치된 mysql도 가능합니다.
단, 테스팅 환경이 로컬이 아니라면 Mysql이 로컬이라면 외부접속을 허용해야합니다.
AWS-S3의 버킷을 퍼블릭 객체로 설정하지 마십시오. 서버에서 요청하여 응답합니다.
네이버 로그인은 배포중인 웹으로 리다이렉트 됩니다.

실행 전
1. config, resverImg 디렉토리를 생성하세요.
** resverImg는 권한 명령어를 사용하지 않고 디렉토리를 생성하세요. 
2. config 디렉토리에 하단의 파일들을 생성합니다. config 디렉토리내의 파일 정보는 보안에 유의하세요.
db_config.json => 당신의 mysql 정보
{
    "accessKeyId": "<your aws acessKeyId>",
    "secretAccessKey": "<your aws accessKey>",
    "region": "ap-northeast-2"
}
aws_config.json => 당신의 aws 정보
{
    "host" : "<your mysql host>",
    "port" : <3306(default)>,
    "user" : "<your user>",   
    "password": "<your password>",
    "database": "<your database>",
    "connectionLimit": 30
}
mail_config.json => 당신의 구글
{
    "service" : "gmail",
    "auth" : {
        "user" : "<your gamil>",
        "pass" : "<yout gamil password>"
    }
}

구글의 보안 수준이 낮음 앱 엑세스를 허용하세요.
https://myaccount.google.com/lesssecureapps

로컬에서의 실행이 아니라면 구글의 내 구글 계정에 대한 엑세스를 허용하세요.
https://accounts.google.com/DisplayUnlockCaptcha

포함된 db_create.txt의 내용으로 테이블을 생성하세요.
당신의 database에 입력하여 테이블을 생성하세요

실행
npm install (사용하는 Shap모듈 설치에서 error가 발생한다면 npm 및 nodejs 버전을 확인하세요.)
npm start
localhost:3000으로 접속

업데이트 예정
시간이 허락된다면 라이브스트리밍을 구현하겠습니다.

감사합니다.
