package com.swamp_portal.webapp.iot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.iot.IotClient;
import software.amazon.awssdk.services.iot.model.ConfirmTopicRuleDestinationRequest;
import software.amazon.awssdk.services.iot.model.UpdateTopicRuleDestinationRequest;
import software.amazon.awssdk.services.iot.model.TopicRuleDestinationStatus;

@RestController
@RequestMapping("/iot")
public class IotConfirmationController {

    private final IotClient iot;
    private final RestTemplate restTemplate = new RestTemplate();

    public IotConfirmationController(@Value("us-east-1") String region) {
        this.iot = IotClient.builder().region(Region.of(region)).build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmDestination(@RequestBody ConfirmPayload body) {
        try {
            // Prefer enableUrl confirmation if provided
            if (body.getEnableUrl() != null && !body.getEnableUrl().isBlank()) {
                restTemplate.getForObject(body.getEnableUrl(), String.class);
            } else if (body.getConfirmationToken() != null && !body.getConfirmationToken().isBlank()) {
                iot.confirmTopicRuleDestination(
                        ConfirmTopicRuleDestinationRequest.builder()
                                .confirmationToken(body.getConfirmationToken())
                                .build()
                );
            } else {
                return ResponseEntity.badRequest().body("Missing enableUrl or confirmationToken");
            }

            // Enable the destination
            if (body.getArn() != null && !body.getArn().isBlank()) {
                iot.updateTopicRuleDestination(
                        UpdateTopicRuleDestinationRequest.builder()
                                .arn(body.getArn())
                                .status(TopicRuleDestinationStatus.ENABLED)
                                .build()
                );
            }

            return ResponseEntity.ok("Destination confirmed and enabled");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error confirming destination: " + e.getMessage());
        }
    }
}