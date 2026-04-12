#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "time.h"

// --- ตั้งค่า Wi-Fi ---
const char* ssid     = "Nongyut";
const char* password = "YEARYOYO111";

// --- ตั้งค่าเวลา (NTP) ---
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7 * 3600; // Thailand GMT+7
const int   daylightOffset_sec = 0;

// --- ตั้งค่า Lovable Cloud Edge Function ---
const char* edgeFunctionURL = "https://fvvhmdqwhihglgbqrojk.supabase.co/functions/v1/ingest";
const char* anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dmhtZHF3aGloZ2xnYnFyb2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5Njg2NDQsImV4cCI6MjA5MTU0NDY0NH0.eGxAIr_jZHHPiEvt3ascKE45ZyXWEGhIHVktFZc42uE";

#define MIC_PIN 34
#define SAMPLES 300

float minRMS = 12.5; 
float maxRMS = 150.0;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

unsigned long lastUpload = 0;
const unsigned long uploadInterval = 5000; // ส่งข้อมูลทุก 5 วินาที

void setup() {
  Serial.begin(115200);

  // เชื่อมต่อ WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  // ตั้งค่าเวลาให้ตรงกับไทย
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (true);
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
}

void uploadToCloud(float db, String status) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(edgeFunctionURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", anonKey);
  http.addHeader("Authorization", String("Bearer ") + anonKey);

  // สร้าง JSON payload
  String json = "{\"db_level\":" + String(db, 1) + ",\"status\":\"" + status + "\"}";

  int httpCode = http.POST(json);
  if (httpCode > 0) {
    Serial.print("☁️ Upload OK: ");
    Serial.println(http.getString());
  } else {
    Serial.print("❌ Upload failed: ");
    Serial.println(http.errorToString(httpCode));
  }
  http.end();
}

void loop() {
  long offset = 0;
  for (int i = 0; i < SAMPLES; i++) {
    offset += analogRead(MIC_PIN);
  }
  offset /= SAMPLES;

  long sum = 0;
  for (int i = 0; i < SAMPLES; i++) {
    int val = analogRead(MIC_PIN) - offset;
    sum += val * val;
    delayMicroseconds(200);
  }

  float rms = sqrt(sum / (float)SAMPLES);
  float db = (rms - minRMS) * (70.0 - 20.0) / (maxRMS - minRMS) + 20.0;
  if (db < 20) db = 20;
  if (db > 70) db = 70;

  // --- ดึงเวลาปัจจุบัน ---
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
  }

  // --- กำหนด Status ---
  String status = "";
  if (db < 35) status = "Quiet";
  else if (db < 55) status = "Normal";
  else status = "Loud";

  // --- Serial Monitor ---
  Serial.println("-------------------------");
  Serial.print("1. Noise: "); Serial.print((int)db); Serial.println(" dB");
  Serial.print("2. Status: "); Serial.println(status);
  Serial.print("3. Date and time: "); 
  Serial.println(&timeinfo, "%d/%m/%Y %H:%M:%S");
  Serial.println("-------------------------");

  // --- แสดงบน OLED ---
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(&timeinfo, "%d/%m/%Y %H:%M:%S");

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.print("dB: "); display.print((int)db);

  display.setTextSize(1);
  display.setCursor(0, 50);
  display.print("Status: "); display.print(status);
  
  display.display();

  // --- ☁️ ส่งข้อมูลขึ้น Cloud ทุก 5 วินาที ---
  if (millis() - lastUpload >= uploadInterval) {
    uploadToCloud(db, status);
    lastUpload = millis();
  }

  delay(1000);
}
