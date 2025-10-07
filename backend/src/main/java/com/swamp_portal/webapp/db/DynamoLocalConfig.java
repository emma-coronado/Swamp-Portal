package com.swamp_portal.webapp.db;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClientBuilder;

import java.net.URI;

@Configuration
@Profile("local")
public class DynamoLocalConfig {
    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.builder()
                .endpointOverride(URI.create("http://localhost:9000"))
                .region(Region.US_EAST_1)
                .credentialsProvider(
                        StaticCredentialsProvider.create(AwsBasicCredentials.create("dummy","dummy"))
                ).build();
    }
}
