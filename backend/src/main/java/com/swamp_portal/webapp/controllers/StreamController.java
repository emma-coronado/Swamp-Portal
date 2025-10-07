package com.swamp_portal.webapp.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.util.MimeType;

import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@RestController
@RequestMapping("/api")
public class StreamController {
    private final Set<SseEmitter> clients = new CopyOnWriteArraySet<>();

    /**
     * Call this API to subscribe to SSE events.
     * @param lastEventID
     * @return
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestHeader(value="Last-Event-ID", required=false) String lastEventID) {
        SseEmitter emitter = new SseEmitter(0L);
        clients.add(emitter);

        emitter.onTimeout(() -> clients.remove(emitter));
        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onError(err -> clients.remove(emitter));

        // Attempt Conneciton
        try {
            emitter.send(SseEmitter.event().name("Hello")
                    .id(String.valueOf(Instant.now().toEpochMilli()))
                    .data("connection successful!"));
        } catch (IOException err) {
            // do nothing :)
        }
        return emitter;
    }

    /**
     * call this method to broadcast new data to subscribed pages
     * @param payload data to send
     */
    public void broadcast(Object payload) {
        clients.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .id(String.valueOf(Instant.now().toEpochMilli()))
                        .data(payload));
            } catch (IOException err) {
                emitter.complete();
            }
        });
    }

    @PostMapping(value = "/send")
    public void send(@RequestBody String text) {
        broadcast(text);
    }
}