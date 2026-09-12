from urllib.request import urlopen

from htomd import convert

url = (
    "https://tailwindcss.com/blog/"
    "tailwind-is-joining-shopify"
)

with urlopen(url) as response:
    html = response.read().decode("utf-8")

markdown = convert(html)
print(markdown, end="")
