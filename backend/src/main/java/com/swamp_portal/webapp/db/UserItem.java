package com.swamp_portal.webapp.db;

import lombok.Getter;
import lombok.Setter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

@DynamoDbBean
public class UserItem {
    @Setter
    private String username;
    @Getter
    @Setter
    private String passwordHash;

    @DynamoDbPartitionKey
    public String getUsername() {
        return username;
    }
}
