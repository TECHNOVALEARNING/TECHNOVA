from rembg import remove
from PIL import Image

input_path = r"C:\Users\user\.gemini\antigravity-ide\brain\ecc890a4-b3c2-4031-8515-3fa4c2944692\.user_uploaded\media_1787850417323.jpg"
output_path_assets = r"c:\Users\user\Downloads\TECHNOVA\src\assets\technova-apps-mobile.png"
output_path_public = r"c:\Users\user\Downloads\TECHNOVA\public\technova-apps-mobile.png"

input_image = Image.open(input_path)
output_image = remove(input_image)

output_image.save(output_path_assets)
output_image.save(output_path_public)

print("AI Background removal complete! Phone perfectly isolated.")
