from PIL import Image, ImageFilter
import numpy as np
from collections import deque

img_path = r"C:\Users\user\.gemini\antigravity-ide\brain\ecc890a4-b3c2-4031-8515-3fa4c2944692\.user_uploaded\media_1787850417323.jpg"
img = Image.open(img_path).convert("RGBA")
arr = np.array(img)
h, w, c = arr.shape

# Let's inspect the phone contour
# The background is a soft light gradient (R ~ 230-255, G ~ 235-255, B ~ 230-255)
# The phone frame has dark metallic colors or distinct shadow
# Let's build a flood fill from all 4 borders to detect background pixels accurately

visited = np.zeros((h, w), dtype=bool)
is_bg = np.zeros((h, w), dtype=bool)

# Start queue with all border pixels
queue = deque()
for y in range(h):
    queue.append((y, 0))
    queue.append((y, w - 1))
    visited[y, 0] = True
    visited[y, w - 1] = True
for x in range(w):
    queue.append((0, x))
    queue.append((h - 1, x))
    visited[0, x] = True
    visited[h - 1, x] = True

# Helper to check if pixel is background gradient (light pastel, low saturation)
def is_bg_color(r, g, b):
    # Check brightness and difference
    # Phone edges are either dark titanium/grey frame or dark bezel
    # Background is very bright (R > 215, G > 220, B > 220)
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    return brightness > 215

while queue:
    y, x = queue.popleft()
    r, g, b, _ = arr[y, x]
    
    if is_bg_color(r, g, b):
        is_bg[y, x] = True
        
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

# Mask: 0 for bg, 255 for foreground
alpha_mask = np.where(is_bg, 0, 255).astype(np.uint8)

# Convert to Image and apply a slight feather / antialiasing
mask_img = Image.fromarray(alpha_mask, mode="L")
mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=0.7))

# Apply alpha mask
arr[:, :, 3] = np.array(mask_img)

out_img = Image.fromarray(arr, mode="RGBA")
out_path = r"c:\Users\user\Downloads\TECHNOVA\src\assets\technova-apps-mobile.png"
out_img.save(out_path, "PNG")

public_path = r"c:\Users\user\Downloads\TECHNOVA\public\technova-apps-mobile.png"
out_img.save(public_path, "PNG")

print("Saved transparent PNG successfully!")
