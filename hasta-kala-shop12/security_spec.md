# Security Specification for Hasta-Kala Shop

## Data Invariants
1. A Product must always be created with a `vendorId` that matches the authenticated user.
2. A Sale must reference a `vendorId` that matches the authenticated user and a `productId` from their collection.
3. Users can only read and write their own data.
4. Suggestions and ChatMessages are strictly private to the vendor.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Resource Poisoning**: Use a 2KB string as a `productId`.
3. **Price Manipulation**: Create a product with a negative price.
4. **Orphaned Sale**: Create a sale referencing a non-existent productId.
5. **Unauthorized Access**: Attempt to read another user's products.
6. **Cross-Vendor Update**: Vendor A attempts to delete Vendor B's sale.
7. **Pillaging Suggestions**: Attempt to list suggestions for a matching userId without being signed in.
8. **Shadow Field Injection**: Add `isAdmin: true` to a user profile update.
9. **Quantity Overflow**: Setting product quantity to a massive number.
10. **Historical Tampering**: Attempting to change `soldAt` timestamp of an existing sale.
11. **Email Spoofing**: Signed in with unverified email attempting sensitive operations.
12. **Fake AI Message**: User attempts to write a message with `role: 'assistant'`.

## Test Runner (Draft Rules Test)
See `DRAFT_firestore.rules` and implementation logic for verification.
