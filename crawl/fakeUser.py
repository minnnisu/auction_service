from faker import Faker
import json
import re

ko_fake = Faker('ko_KR')  # 'ko_KR' 로써 한국어로 설정
en_fake = Faker() 
used_nicknames = set()  # 중복된 닉네임을 추적하기 위한 집합(set)
used_usernames = set()  # 중복된 아이디를 추적하기 위한 집합(set)

def generate_unique_username():
    while True:
        # 새로운 아이디 생성
        new_username = en_fake.user_name()

        # 생성된 아이디가 이미 사용된 것인지 확인
        if new_username not in used_usernames:
            # 사용되지 않은 경우, 아이디를 추가하고 반환
            used_usernames.add(new_username)
            return new_username

def generate_unique_nickname():
    while True:
        # 새로운 닉네임 생성
        new_nickname = en_fake.first_name()

        # 생성된 닉네임이 이미 사용된 것인지 확인
        if new_nickname not in used_nicknames:
            # 사용되지 않은 경우, 닉네임을 추가하고 반환
            used_nicknames.add(new_nickname)
            return new_nickname
        
phone_number_pattern = re.compile(r'^01([016789])-?(\d{3,4})-?(\d{4})$')
def generate_valid_phone_number():
    while True:
        # 가짜 전화번호 생성
        new_phone_number = ko_fake.phone_number()

        # 생성된 전화번호가 정규표현식에 맞는지 확인
        match = phone_number_pattern.match(new_phone_number)
        if match:
            return new_phone_number

# 이메일 도메인을 @example.com으로 변경하는 함수
def generate_valid_email():
    email = en_fake.email()
    domain_pattern = re.compile(r'@(.+)$')
    email_with_fixed_domain = re.sub(domain_pattern, '@example.com', email)
    return email_with_fixed_domain


users = []

for i in range(500):
    # 아이디
    username = generate_unique_username()

    # 영어와 숫자를 포함한 8자의 가짜 비밀번호 생성
    password = en_fake.password(length=8, special_chars=False, digits=True, upper_case=True, lower_case=True)
    password += "@"

    # 이름
    name = ko_fake.name()

    # 닉네임
    nickname = generate_unique_nickname()

    # 전화번호
    phone_number = generate_valid_phone_number()

    # 이메일
    email = generate_valid_email()

    # 생성된 데이터 출력
    print(f"아이디: {username}")
    print(f"비밀번호: {password}")
    print(f"이름: {name}")
    print(f"닉네임: {nickname}")
    print(f"전화번호: {phone_number}")
    print(f"이메일: {email}")

    
    users.append({"id": username, 
                  "password": password, 
                  "checkedPassword": password, 
                  "username":name, 
                  "nickname":nickname, 
                  "telephone":phone_number, 
                  "email":email})


# 딕셔너리를 JSON 형식으로 변환하여 파일에 저장 (ensure_ascii=False 추가)
json_data = json.dumps(users, indent=2, ensure_ascii=False)

# 파일에 쓰기 (encoding='utf-8' 추가)
with open("crawl/user/user.json", "w", encoding='utf-8') as json_file:
    json_file.write(json_data)

print("JSON 데이터가 파일에 저장되었습니다.")
