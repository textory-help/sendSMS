// Send an SMS via paired phone (global).
//   export TEXTORY_API_KEY=sk_live_...
//   go run send_phone.go
package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const baseURL = "https://openapi.textory.io"

func uuidV4() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	s := hex.EncodeToString(b)
	return fmt.Sprintf("%s-%s-%s-%s-%s", s[0:8], s[8:12], s[12:16], s[16:20], s[20:32])
}

func main() {
	apiKey := os.Getenv("TEXTORY_API_KEY")
	if apiKey == "" {
		fmt.Fprintln(os.Stderr, "export TEXTORY_API_KEY=sk_live_...")
		os.Exit(1)
	}

	payload := map[string]any{
		"clientId": uuidV4(),
		"contents": "Hi {{name}}, your verification code is 917043.",
		"recipients": []map[string]string{
			{"phoneNumber": "+14155551234", "name": "Alice"},
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", baseURL+"/openapi/v1/messages/phone", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintln(os.Stderr, "❌ network:", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 && resp.StatusCode != 409 {
		fmt.Fprintf(os.Stderr, "❌ HTTP %d\n%s\n", resp.StatusCode, respBody)
		os.Exit(1)
	}
	fmt.Println("✅", string(respBody))
}
