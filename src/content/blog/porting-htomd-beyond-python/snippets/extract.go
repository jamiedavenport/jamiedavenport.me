package main

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/jamiedavenport/htomd/go"
)

func main() {
	url := "https://tailwindcss.com/blog/" +
		"tailwind-is-joining-shopify"

	response, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		log.Fatal(response.Status)
	}

	html, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}
	markdown, err := htomd.Convert(string(html), htomd.Options{})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(markdown)
}
