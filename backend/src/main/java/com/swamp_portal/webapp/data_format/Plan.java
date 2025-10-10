package com.swamp_portal.webapp.data_format;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Plan {

    @JsonProperty("mid_plan")  private PlanBlock midPlan;
    @JsonProperty("sub1_plan") private PlanBlock sub1Plan;
    @JsonProperty("sub2_plan") private PlanBlock sub2Plan;

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PlanBlock {
        private Header header;
        private List<Path> paths; // each path has poses[]
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Header {
        private Stamp stamp;
        @JsonProperty("frame_id") private String frameId;
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Stamp {
        private long sec;
        private int  nanosec;
        public Instant toInstant() { return Instant.ofEpochSecond(sec, nanosec); }
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Path {
        private Header header;
        private List<PoseStamped> poses;
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PoseStamped {
        private Header header;
        private Pose pose;
        public Instant getInstant() {
            return (header != null && header.getStamp() != null)
                    ? header.getStamp().toInstant()
                    : Instant.EPOCH;
        }
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Pose {
        private Position position;
        private Orientation orientation;
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Position { private double x, y, z; }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Orientation { private double x, y, z, w; }
}