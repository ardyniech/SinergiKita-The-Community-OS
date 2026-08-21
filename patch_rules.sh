#!/bin/bash
cat << 'INNER_EOF' > firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ---------------------------------------------------------
    // Helper Functions
    // ---------------------------------------------------------
    function isSignedIn() {
      return request.auth != null;
    }
    
    function hasUserData() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isSuperAdmin() {
      return isSignedIn() && (
        (request.auth.token.keys().hasAll(['admin']) && request.auth.token.admin == true) ||
        (hasUserData() && getUserData().role == 'superadmin')
      );
    }
    
    function isAdmin() {
      return isSignedIn() && (
        isSuperAdmin() || 
        (hasUserData() && getUserData().role in ['admin', 'ketua', 'bendahara', 'sekretaris'] && getUserData().isApproved == true)
      );
    }

    function isMemberOf(tenantId) {
      return isSignedIn() &&
             hasUserData() &&
             getUserData().tenantId == tenantId &&
             (getUserData().isApproved == true || getUserData().role == 'superadmin');
    }

    function isMemberOfNoApproval(tenantId) {
      return isSignedIn() &&
             hasUserData() &&
             getUserData().tenantId == tenantId;
    }
    
    function isValidId(id) {
      return id is string && id.size() <= 128;
    }

    // ---------------------------------------------------------
    // Global Safety Net
    // ---------------------------------------------------------
    match /{document=**} {
      allow read, write: if isSuperAdmin();
    }

    // ---------------------------------------------------------
    // Tenants
    // ---------------------------------------------------------
    match /tenants/{tenantId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && (isSuperAdmin() || request.auth.uid == request.resource.data.ownerId);
      allow update: if isSignedIn() && (isSuperAdmin() || request.auth.uid == resource.data.ownerId);
      allow delete: if isSuperAdmin();
    }

    // ---------------------------------------------------------
    // Users (Fixed N1 & N2)
    // ---------------------------------------------------------
    match /users/{userId} {
      // Read: self, or same tenant if admin or regular user (N2 fix: explicit tenant checks)
      allow read, list: if isSignedIn() && (
        request.auth.uid == userId || 
        (hasUserData() && resource.data.tenantId == getUserData().tenantId) ||
        resource.data.email == request.auth.token.email
      );
      
      // Create: User can only create their own doc. Must NOT be superadmin. (N1 fix)
      allow create: if request.auth.uid == userId
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.role in ['member','admin','ketua','bendahara','sekretaris']
        && request.resource.data.keys().hasOnly(['uid','email','displayName','photoURL','tenantId','role','isApproved', 'address', 'phoneNumber', 'createdAt', 'status', 'tenantName'])
        && (request.resource.data.tenantId is string || request.resource.data.tenantId == null);
      
      // Update: User can update their own non-sensitive fields. Admin can update within same tenant. (N1/N2 fix)
      allow update: if isSignedIn() && (
        (request.auth.uid == userId && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['displayName','photoURL','tenantId', 'address', 'phoneNumber', 'tenantName']) &&
         request.resource.data.role == resource.data.role &&
         request.resource.data.isApproved == resource.data.isApproved) ||
        (isAdmin() && hasUserData() && resource.data.tenantId == getUserData().tenantId && request.resource.data.tenantId == resource.data.tenantId &&
         request.resource.data.role in ['member','admin','ketua','bendahara','sekretaris'] &&
         (request.auth.uid != userId || !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isApproved'])))
      );

      allow delete: if isSignedIn() && (
        resource.data.email == request.auth.token.email ||
        (isAdmin() && hasUserData() && resource.data.tenantId == getUserData().tenantId)
      );
    }
INNER_EOF
