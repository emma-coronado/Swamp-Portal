package com.swamp_portal.webapp.data_format;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class TravelPoint implements Timestamped {
    private final Instant timestamp;
    private final double x, y, z;
    // orientation is optional; null means “not provided”
    private final Double ox, oy, oz, ow;

    @Override public Instant getTimestamp() { return timestamp; }
}