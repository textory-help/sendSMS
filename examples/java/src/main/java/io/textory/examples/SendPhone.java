package io.textory.examples;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Send an SMS via paired phone (global). */
public class SendPhone {

  private static final String BASE_URL = "https://openapi.textory.io";
  private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

  public static void main(String[] args) throws Exception {
    String apiKey = System.getenv("TEXTORY_API_KEY");
    if (apiKey == null || apiKey.isBlank()) {
      System.err.println("export TEXTORY_API_KEY=sk_live_...");
      System.exit(1);
    }

    ObjectMapper mapper = new ObjectMapper();
    String body = mapper.writeValueAsString(Map.of(
        "clientId", UUID.randomUUID().toString(),
        "contents", "Hi {{name}}, your verification code is 917043.",
        "recipients", List.of(
            Map.of("phoneNumber", "+14155551234", "name", "Alice")
        )
    ));

    OkHttpClient client = new OkHttpClient();
    Request request = new Request.Builder()
        .url(BASE_URL + "/openapi/v1/messages/phone")
        .header("Authorization", "Bearer " + apiKey)
        .post(RequestBody.create(body, JSON))
        .build();

    try (Response response = client.newCall(request).execute()) {
      String responseBody = response.body() == null ? "" : response.body().string();
      if (!response.isSuccessful() && response.code() != 409) {
        System.err.println("❌ " + response.code() + ": " + responseBody);
        System.exit(1);
      }
      System.out.println("✅ " + responseBody);
    }
  }
}
