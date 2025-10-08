package com.swamp_portal.webapp.db;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
@Profile("!local")
public class DynamoProdConfig {

    @Bean
    public DynamoDbClient dynamoDbClient() {
        String region = System.getenv("AWS_REGION");
        String accessKey = System.getenv("AWS_ACCESS_KEY_ID");
        String secretKey = System.getenv("AWS_SECRET_ACCESS_KEY");
        String sessionToken = System.getenv("AWS_SESSION_TOKEN");

        if (region == null) {
            region = "us-east-1";
        }

        if (accessKey == null || secretKey == null || sessionToken == null)
            throw new RuntimeException("Missing one or more AWS Credentials!");

        return DynamoDbClient
                .builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsSessionCredentials.create(accessKey, secretKey, sessionToken)
                ))
                .build();
    }
}
