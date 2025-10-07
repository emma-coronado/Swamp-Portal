package com.swamp_portal.webapp.db;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
@Profile("!local")
public class DynamoProdConfig {
    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.create();
    }
}
