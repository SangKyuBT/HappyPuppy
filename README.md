<h2>소개</h2>
<a href="http://54.180.93.116/">배포중인 웹</a> 입니다.<br>
Vue js와 Node js를 공부 하면서 견주들을 위한 웹 어플리케이션을 만들어 보았습니다.<br><br>

* list item 1
    * list item 1-1
        * list item 2-1
    * list item 1-2


<h2>간략한 설명</h2>
해당 프로젝트는 Vue Cli를 이용하여 생성한 웹팩을 run build한 프로젝트로 express 환경을 사용하였습니다.<br>
멀티미디어 플랫폼으로 멀티미디어 업로드 및 동영상 스트리밍, 이미지 추출 기능을 제공합니다.<br>
보안 토큰 및 암호기능으로 관련 지식이 부족하나 보안에 신경섰습니다.<br>
Vue js의 자세한 정보를 확인하고 싶으시다면 <a href="https://github.com/SangkyuGoodboyYesDoitsgoi/HappyPuppy-vue">여기</a>를 클릭하세요.<br><br>

프로젝트의 대략적인 사용 기술의 버전은 다음과 같습니다.<br>
node 12.14.1<br>
npm 6.13.4<br>
vue/cli 4.1.2<br>
mysql 5.7.30<br>
aws(ec2, rds, s3)<br>
api : 네이버 로그인, 카카오맵<br>
사용 모듈은 package.json를 참고하세요.<br>
Vue js의 모듈 정보는 <a href="https://github.com/SangkyuGoodboyYesDoitsgoi/HappyPuppy-vue/blob/master/package.json">여기</a>를 클릭하세요. <br><br>

<h2>알림</h2>
테스트 하시는 본인의 aws-s3, aws-rds-mysql이 필요합니다.<br>
mysql을 꼭 aws-rds를 이용할 필요는 없습니다. 로컬에 설치된 mysql도 가능합니다.
단, 테스팅 환경이 로컬이 아니라면 외부 접속을 허용해야합니다.<br>
테스트하는 본인의 AWS-S3의 버킷을 퍼블릭 객체로 설정하지 마십시오. 서버 사이드에서 요청하여 응답합니다.<br>
네이버 로그인을 테스트해보고 싶으시면 되도록 <a href="http://54.180.93.116/">배포중인 웹</a>에서 권장합니다. 로컬에서해도 배포중인 웹으로 리다이렉트 됩니다.<br><br>

<h2>실행 전</h2><br>
1. 권한이 없는 명령어로 config, resverImg 디렉토리를 생성하세요.<br>
2. config 디렉토리에 하단의 파일들을 생성합니다. config 디렉토리 내의 파일은 보안에 주의하세요.<br>
aws_config.json

	{
	    "accessKeyId": "<your aws acessKeyId>",	
	    "secretAccessKey": "<your aws accessKey>",	
	    "region": "<your aws region>"	
	}
	
db_config.json

	{
	    "host" : "<your mysql host>",	
	    "port" : <3306(default)>,	
	    "user" : "<your user>",   	
	    "password": "<your password>",	
	    "database": "<your database>",	
	    "connectionLimit": 30	
	}


mail_config.json

	{
	    "service" : "gmail",	
	    "auth" : {
		"user" : "<your gmail>",		
		"pass" : "<yout gmail password>"		
	    }
	}


3. 구글의 보안 수준이 낮음 앱 엑세스를 허용하세요. https://myaccount.google.com/lesssecureapps <br>
4. 로컬에서의 실행이 아니라면 구글의 내 구글 계정에 대한 엑세스를 허용하세요.https://accounts.google.com/DisplayUnlockCaptcha <br>
5. 포함된 db_create.txt의 내용으로 테이블을 생성하세요. <br>

<h2>실행</h2>
npm install<br>
npm start<br>
localhost:3000으로 접속<br>

<h2>업데이트 예정</h2>
시간이 허락된다면 Tyepscript 주입, 라이브스트리밍 구현 예정입니다.<br>

감사합니다.
