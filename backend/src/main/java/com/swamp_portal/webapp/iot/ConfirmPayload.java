package com.swamp_portal.webapp.iot;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ConfirmPayload {
    private String arn;
    private String confirmationToken;
    private String enableUrl;
    private String messageType;
}