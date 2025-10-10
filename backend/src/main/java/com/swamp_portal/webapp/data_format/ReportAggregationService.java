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

    // role -> plan buffer (future points only; always keeps newest if all past)
    private final Map<String, ExpiringBuffer<Point>> planBuffers = new ConcurrentHashMap<>();
    // role -> new_reports (latest seen from report_stats)
    private final Map<String, Integer> newReports = new ConcurrentHashMap<>();

    private ExpiringBuffer<Point> buf(String role) {
        return planBuffers.computeIfAbsent(role, r -> new ExpiringBuffer<>());
    }

    /** Ingest exactly one Report (no Plan/Events here). */
    public void ingestReport(Report r) {
        if (r == null) return;

        // update per-role new_reports
        if (r.getReportStats() != null) {
            r.getReportStats().forEach((role, count) -> {
                if (role != null && count != null) newReports.put(role, count);
            });
        }

        // helper to ingest role+plan+history
        handleRole(r.getSub0Role(), r.getSub0Plan(), r.getSub0History(), r.getSnapshotSentTime());
        handleRole(r.getSub1Role(), r.getSub1Plan(), r.getSub1History(), r.getSnapshotSentTime());
        handleRole(r.getSub2Role(), r.getSub2Plan(), r.getSub2History(), r.getSnapshotSentTime());
    }

    private void handleRole(String role, List<Point> plan, List<Point> history, double snapTime) {
        if (role == null) return;
        if (plan != null && !plan.isEmpty()) buf(role).addAll(plan);
        // history is only used to compute avg_deviation on demand; we don’t store it
    }

    /** Build frontend payload (Streamdata). */
    public Map<String, Object> buildStreamdata() {
        Map<String, Object> out = new LinkedHashMap<>();
        List<Map<String, Object>> subs = new ArrayList<>();

        // num_subs = how many roles currently tracked
        out.put("num_subs", planBuffers.keySet().size());

        // For deterministic order
        List<String> roles = new ArrayList<>(planBuffers.keySet());
        Collections.sort(roles);

        for (String role : roles) {
            List<Point> tp = planBuffers.get(role).snapshot(); // already pruned to future / keep ≥1

            // Convert plan points -> travel_plan items the frontend expects
            List<Map<String, Object>> travelPlan = new ArrayList<>();
            for (Point p : tp) {
                Map<String, Object> pl = new LinkedHashMap<>();
                pl.put("timestamp", toMillis(p.getTimestamp()));
                Map<String, Object> pos = Map.of("x", p.getX(), "y", p.getY(), "z", p.getZ());
                pl.put("position", pos);

                // orientation unavailable in Report → omit it here.
                // Frontend may default to identity if missing, or we’ll fill it once Plan payload provides it.

                travelPlan.add(pl);
            }

            Map<String, Object> subObj = new LinkedHashMap<>();
            subObj.put("name", role); // we only have the role in Report; no distinct ID present
            subObj.put("new_reports", newReports.getOrDefault(role, 0));
            subObj.put("role", role);
            subObj.put("travel_plan", travelPlan);
            subObj.put("avg_deviation", 0); // computed below if history available in the most recent report

            subs.add(subObj);
        }

        out.put("Subs", subs);
        out.put("Events", List.of()); // Reports do not include events; keeping empty for now
        return out;
    }

    // === Optional helper to compute avg_deviation from a Report ===
    // Call this right after ingestReport(...) if you want to embed the metric now.
    public void applyAvgDeviationFromReport(Report r) {
        if (r == null) return;

        // Build per-role: plan points and history points indexed by (epoch-seconds.nanoseconds as double)
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

        // stash into a transient map we add into buildStreamdata output:
        avgPerRole.put(role, avg);
    }

    private final Map<String, Double> avgPerRole = new ConcurrentHashMap<>();

    /** Let buildStreamdata include the most recent avg_deviation if computed. */
    public Map<String, Object> buildStreamdataWithAvg() {
        Map<String, Object> doc = buildStreamdata();
        @SuppressWarnings("unchecked")
        List<Map<String,Object>> subs = (List<Map<String,Object>>) doc.get("Subs");
        for (Map<String,Object> s : subs) {
            String role = (String) s.get("role");
            if (avgPerRole.containsKey(role)) s.put("avg_deviation", avgPerRole.get(role));
        }
        return doc;
    }

    private static long toMillis(Instant i) { return i.toEpochMilli(); }
}
