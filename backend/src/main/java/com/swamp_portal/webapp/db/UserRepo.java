package com.swamp_portal.webapp.db;

import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PutItemEnhancedRequest;

@Repository
public class UserRepo {
    private final DynamoDbTable<UserItem> table;
    public UserRepo(DynamoDbTable<UserItem> table) {
        this.table = table;
    }
    public boolean createUser(String username, String passwordHash) {
        UserItem item = new UserItem();
        item.setUsername(username);
        item.setPasswordHash(passwordHash);
        try {
            table.putItem(PutItemEnhancedRequest.builder(UserItem.class)
                    .item(item)
                    .conditionExpression(
                            Expression.builder()
                                    .expression("attribute_not_exists(#u)")
                                    .putExpressionName("#u","username")
                                    .build())
                            .build()
                    );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public UserItem get(String username) {
        return table.getItem(Key.builder().partitionValue(username).build());
    }
}
