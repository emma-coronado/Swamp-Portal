package com.swamp_portal.webapp.controllers;

import com.swamp_portal.webapp.AdminGuard;
import com.swamp_portal.webapp.SessionService;
import com.swamp_portal.webapp.data_format.Report;
import com.swamp_portal.webapp.data_format.ReportAggregationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@RestController
public class StreamController {
    private Object LastJSON = "{}";
    private final Set<SseEmitter> clients = new CopyOnWriteArraySet<>();
    private final SessionService sessions;
    private final AdminGuard admin;
    public StreamController(SessionService sessions, AdminGuard admin, ReportAggregationService reportAggregationService) {
        this.sessions = sessions;
        this.admin = admin;
        LastJSON = "";
        this.svc = reportAggregationService;
    }

    /**
     * Call this API to subscribe to SSE events.
     * @param lastEventID
     * @return
     */
    @GetMapping(value = "/api/stream", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public SseEmitter stream(@RequestHeader(value="Last-Event-ID", required=false) String lastEventID, HttpServletRequest req) {

        String user = sessions.getUser(req);
        if (user == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Login Required!"
            );
        }

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
        broadcast(LastJSON);
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

    @PostMapping(value = "/api/send", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void send(@RequestBody Object json, HttpServletRequest req) {
        admin.requireAdmin(req);
        LastJSON = json;
        broadcast(json);
    }

//    private final ReportBufferService reportBufferService;

    private final ReportAggregationService svc;

    @PostMapping(value = "/iot/report", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> publish_report(@RequestBody Report report, HttpServletRequest req) {
        admin.requireAdmin(req);
        svc.ingestReport(report);
        svc.applyAvgDeviationFromReport(report);
        LastJSON = svc.buildStreamdataWithAvg();
        broadcast(LastJSON);
        return ResponseEntity.accepted().build();
    }

}