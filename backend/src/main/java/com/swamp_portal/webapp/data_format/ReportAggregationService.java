package com.swamp_portal.webapp.data_format;

import com.swamp_portal.webapp.data_format.Report.Point;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ReportAggregationService {

    // role -> plan buffer (future only; keeps newest if all past)
    private final Map<String, ExpiringBuffer<TravelPoint>> planBuffers = new ConcurrentHashMap<>();
    // role -> new_reports (latest seen from report_stats)
    private final Map<String, Integer> newReports = new ConcurrentHashMap<>();
    // role -> most recent avg deviation (from last 60s window)
    private final Map<String, Double> avgPerRole = new ConcurrentHashMap<>();

    private ExpiringBuffer<TravelPoint> buf(String role) {
        return planBuffers.computeIfAbsent(role, r -> new ExpiringBuffer<>());
    }

    /* ----------------- REPORT INGEST (unchanged behavior) ----------------- */

    public void ingestReport(Report r) {
        if (r == null) return;

        if (r.getReportStats() != null) {
            r.getReportStats().forEach((role, count) -> {
                if (role != null && count != null) newReports.put(role, count);
            });
        }

        // Insert plan points (no orientation in Report)
        handleReportRole(r.getSub0Role(), r.getSub0Plan());
        handleReportRole(r.getSub1Role(), r.getSub1Plan());
        handleReportRole(r.getSub2Role(), r.getSub2Plan());
    }

    private void handleReportRole(String role, List<Point> plan) {
        if (role == null || plan == null || plan.isEmpty()) return;
        List<TravelPoint> converted = new ArrayList<>(plan.size());
        for (Point p : plan) {
            Instant ts = p.getTimestamp();
            converted.add(new TravelPoint(
                    ts, p.getX(), p.getY(), p.getZ(),
                    null, null, null, null // no orientation in Report
            ));
        }
        buf(role).addAll(converted);
    }

    /** Optional: compute avg_deviation after ingesting a Report */
    public void applyAvgDeviationFromReport(Report r) {
        if (r == null) return;
        computeAvgForRole(r.getSub0Role(), r.getSub0Plan(), r.getSub0History(), r.getSnapshotSentTime());
        computeAvgForRole(r.getSub1Role(), r.getSub1Plan(), r.getSub1History(), r.getSnapshotSentTime());
        computeAvgForRole(r.getSub2Role(), r.getSub2Plan(), r.getSub2History(), r.getSnapshotSentTime());
    }

    private void computeAvgForRole(String role, List<Point> plan, List<Point> hist, double snapTime) {
        if (role == null || plan == null || hist == null) return;
        double start = snapTime - 60.0;

        Map<Double, Point> planByT = new HashMap<>();
        for (Point p : plan) if (p.getT() >= start && p.getT() <= snapTime) planByT.put(p.getT(), p);

        double sum = 0.0; int n = 0;
        for (Point h : hist) {
            if (h.getT() >= start && h.getT() <= snapTime) {
                Point p = planByT.get(h.getT());
                if (p != null) {
                    double dx = p.getX() - h.getX();
                    double dy = p.getY() - h.getY();
                    double dz = p.getZ() - h.getZ();
                    sum += Math.sqrt(dx*dx + dy*dy + dz*dz);
                    n++;
                }
            }
        }
        double avg = (n == 0) ? 0.0 : (sum / n);
        avgPerRole.put(role, avg);
    }

    /* ----------------- PLAN INGEST (NEW) ----------------- */

    private final Map<String, java.time.Instant> lastPlanStamp = new ConcurrentHashMap<>();

    public void ingestPlan(Plan plan) {
        if (plan == null) return;
        handlePlanBlock("mid",  plan.getMidPlan());
        handlePlanBlock("sub1", plan.getSub1Plan());
        handlePlanBlock("sub2", plan.getSub2Plan());
    }

    private void handlePlanBlock(String role, Plan.PlanBlock block) {
        if (role == null || block == null) return;

        Instant planStamp = Instant.EPOCH;
        if (block.getHeader() != null && block.getHeader().getStamp() != null) {
            planStamp = block.getHeader().getStamp().toInstant();
        }

        Instant prev = lastPlanStamp.get(role);
        if (prev != null && !planStamp.isAfter(prev)) {
            // Older or same plan version → ignore
            return;
        }

        // Flatten poses → TravelPoint list
        List<TravelPoint> pts = new ArrayList<>();
        if (block.getPaths() != null) {
            for (Plan.Path path : block.getPaths()) {
                if (path == null || path.getPoses() == null) continue;
                for (Plan.PoseStamped ps : path.getPoses()) {
                    if (ps == null || ps.getPose() == null || ps.getPose().getPosition() == null) continue;
                    var ts  = ps.getInstant();
                    var pos = ps.getPose().getPosition();
                    var ori = ps.getPose().getOrientation();
                    pts.add(new TravelPoint(
                            ts,
                            pos.getX(), pos.getY(), pos.getZ(),
                            (ori != null ? ori.getX() : null),
                            (ori != null ? ori.getY() : null),
                            (ori != null ? ori.getZ() : null),
                            (ori != null ? ori.getW() : null)
                    ));
                }
            }
        }

        if (!pts.isEmpty()) {
            // Replace buffer contents atomically with the new plan
            buf(role).replaceAll(pts);
            lastPlanStamp.put(role, planStamp);
        }
    }

    /* ----------------- BUILD FRONTEND SHAPE ----------------- */

    /** Streamdata for frontend. Includes orientation when present in buffers. */
    public Map<String, Object> buildStreamdataWithAvg() {
        Map<String, Object> out = new LinkedHashMap<>();
        List<Map<String, Object>> subs = new ArrayList<>();

        out.put("num_subs", planBuffers.size());

        List<String> roles = new ArrayList<>(planBuffers.keySet());
        Collections.sort(roles);

        for (String role : roles) {
            List<TravelPoint> tp = planBuffers.get(role).snapshot();

            List<Map<String, Object>> travelPlan = new ArrayList<>(tp.size());
            for (TravelPoint p : tp) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("timestamp", p.getTimestamp().toEpochMilli());
                entry.put("position", Map.of("x", p.getX(), "y", p.getY(), "z", p.getZ()));

                // Include orientation iff available
                if (p.getOx() != null && p.getOy() != null && p.getOz() != null && p.getOw() != null) {
                    entry.put("orientation", Map.of(
                            "x", p.getOx(), "y", p.getOy(),
                            "z", p.getOz(), "w", p.getOw()
                    ));
                }
                travelPlan.add(entry);
            }

            Map<String, Object> subObj = new LinkedHashMap<>();
            subObj.put("name", role); // we only have role labels here
            subObj.put("new_reports", newReports.getOrDefault(role, 0));
            subObj.put("role", role);
            subObj.put("travel_plan", travelPlan);
            subObj.put("avg_deviation", avgPerRole.getOrDefault(role, 0.0));

            subs.add(subObj);
        }

        out.put("Subs", subs);
        out.put("Events", List.of()); // Plan has no events
        return out;
    }
}