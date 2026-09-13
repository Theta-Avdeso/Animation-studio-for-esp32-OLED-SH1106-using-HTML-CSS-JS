#include <WiFi.h>
#include <WebServer.h> //library needed for the web server
#include <Adafruit_GFX.h>
#include <Adafruit_SH1106.h> //oled library

// ESP32 pins for OLED
#define SDA 12
#define SCL 14

Adafruit_SH1106 display(SDA,SCL);

// this is the webserver made by the ESP32 webserver library. The ssid and password can be changed
const char* ssid = "Theta";
const char* password = "12345678";

WebServer server(80);

// animation variables used in logic of void loop() {}
int frame;
int cycle=0;
uint8_t frames[5][1024];

uint8_t packet[1025];
size_t Bytes = 0;

void setup() {
  Serial.begin(115200);
  //OLED setup
  Wire.begin(SDA,SCL);
  display.begin(SH1106_SWITCHCAPVCC,0x3C);
  display.clearDisplay();
  display.display();

  //packet opening
  memset(packet,0,sizeof(packet));
  frame= packet[0];
  for (int i=0; i<1024; i++) {
    frames[frame-1][i] = packet[i+1];
  }
  Serial.println(frame);
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid,password);
  server.enableCORS(true);

  server.on("/frame",HTTP_OPTIONS,Options);
  server.on("/frame",HTTP_POST,Request,Receive);
  server.begin();
}

void loop() { //cycles through the frames
  server.handleClient();
  display.clearDisplay();
  display.drawBitmap(0,0,frames[cycle],128,64,WHITE);
  display.display();
  delay(20);
  cycle=cycle+1;
  if (cycle==5) {
    cycle =0;
  }
}

void Receive() {//fetches the data sent by
  HTTPRaw& raw = server.raw();
  if (raw.status == RAW_START) {
    Bytes=0;
  }else if (raw.status == RAW_WRITE) {
    size_t Copy = raw.currentSize;
    if (Bytes + Copy > 1025) {
      Copy = 1025-Bytes;
    }
    memcpy(packet + Bytes, raw.buf, Copy);
    Bytes = Bytes + Copy;
  }else if (raw.status == RAW_ABORTED) {
    Bytes=0;
  }

}

void Request() {//sends a request for the packet
    if (Bytes == 1025) {
        frame = packet[0];

        if (frame >= 1 && frame <= 5) {
            for (int i = 0; i < 1024; i++) {
                frames[frame - 1][i] = packet[i + 1];
            }

            server.send(200, "text/plain", "Frame received");
        }
    }
}

void Options() {//in case of CORS
  server.enableCORS(true);
  server.send(204);
}
