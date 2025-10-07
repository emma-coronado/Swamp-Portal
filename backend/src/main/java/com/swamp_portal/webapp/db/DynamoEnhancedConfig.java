package com.swamp_portal.webapp.db;


import org.springframework.context.annotation.*;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
public class DynamoEnhancedConfig {
    @Bean
    public DynamoDbEnhancedClient enhanced(DynamoDbClient base) {
        return DynamoDbEnhancedClient.builder().dynamoDbClient(base).build();
    }

    @Bean
    public DynamoDbTable<UserItem> usersTable(DynamoDbEnhancedClient enhanced) {
        return enhanced.table("Users", TableSchema.fromBean(UserItem.class));
    }
}