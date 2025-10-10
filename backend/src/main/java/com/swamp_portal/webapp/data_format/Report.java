package com.swamp_portal.webapp.data_format;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.*;

@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Report {
    @JsonProperty("report_id")          private long reportId;
    @JsonProperty("identity_of_sender") private long identityOfSender;
    @JsonProperty("identity_role")      private String identityRole;
    @JsonProperty("report_stats")       private Map<String,Integer> reportStats;
    @JsonProperty("snapshot_sent_time") private double snapshotSentTime;

    @JsonProperty("sub0_role")          private String sub0Role;
    @JsonProperty("sub1_role")          private String sub1Role;
    @JsonProperty("sub2_role")          private String sub2Role;

    @JsonProperty("sub0_plan")          private List<Point> sub0Plan;
    @JsonProperty("sub1_plan")          private List<Point> sub1Plan;
    @JsonProperty("sub2_plan")          private List<Point> sub2Plan;

    @JsonProperty("sub0_history")       private List<Point> sub0History;
    @JsonProperty("sub1_history")       private List<Point> sub1History;
    @JsonProperty("sub2_history")       private List<Point> sub2History;

    @JsonProperty("logged_dwell_time")  private long loggedDwellTime;
    @JsonProperty("master_epoch")       private long masterEpoch;
    @JsonProperty("slot")               private int slot;

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Point implements Timestamped {
        @JsonProperty("t") private double t;
        @JsonProperty("x") private double x;
        @JsonProperty("y") private double y;
        @JsonProperty("z") private double z;

        @Override public Instant getTimestamp() {
            long secs  = (long)Math.floor(t);
            long nanos = Math.round((t - secs) * 1_000_000_000d);
            if (nanos >= 1_000_000_000L) { secs += 1; nanos -= 1_000_000_000L; }
            return Instant.ofEpochSecond(secs, nanos);
        }
    }
}