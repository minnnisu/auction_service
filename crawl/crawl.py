import requests
from bs4 import BeautifulSoup
from lxml import html
import json

products = []

def crawl(url) :
    # 웹 페이지 다운로드
    response = requests.get(url)

    # 다운로드가 성공했는지 확인
    if response.status_code == 200:
        # BeautifulSoup을 사용하여 HTML 파싱
        tree = html.fromstring(response.text)

        for i in range(1,80):
            # XPath를 사용하여 원하는 요소 선택
            productUrlA = tree.xpath(f'//*[@id="__next"]/div/main/div[1]/div[2]/ul/li[{i}]/a')
            titleH2 = tree.xpath(f'//*[@id="__next"]/div/main/div[1]/div[2]/ul/li[{i}]/a/div[2]/h2')
            priceDiv = tree.xpath(f'//*[@id="__next"]/div/main/div[1]/div[2]/ul/li[{i}]/a/div[2]/div[1]')
            imgUrlImg = tree.xpath(f'//*[@id="__next"]/div/main/div[1]/div[2]/ul/li[{i}]/a/div[1]/img')
            

            if productUrlA and titleH2 and priceDiv and imgUrlImg:
                productUrl = productUrlA[0].get('href')
                
                title = titleH2[0].text_content().strip()
                
                price = priceDiv[0].text_content().strip()
                price = price.replace("원", "")
                price = price.replace(",", "")
                
                imgUrl = imgUrlImg[0].get('src')
                print(f'{productUrl}, {title}, {price} {imgUrl}')

                product = {"productUrl": productUrl, "title":title, "price": price, "imgUrl":imgUrl}
                products.append(product)
            else:
                print("해당하는 요소를 찾을 수 없습니다.")
    else:
        print('웹 페이지를 다운로드하는데 실패했습니다. 상태 코드:', response.status_code)

for i in range(1,126):
    # 크롤링할 웹 페이지 URL
    url = f'https://web.joongna.com/search?page={i}&category=7'
    crawl(url)
    
# 딕셔너리를 JSON 형식으로 변환하여 파일에 저장 (ensure_ascii=False 추가)
json_data = json.dumps(products, indent=2, ensure_ascii=False)

# 파일에 쓰기 (encoding='utf-8' 추가)
with open("crawl/product/product.json", "w", encoding='utf-8') as json_file:
    json_file.write(json_data)

print("JSON 데이터가 파일에 저장되었습니다.")


