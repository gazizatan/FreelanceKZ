# TODO: Full Stack Authentication and Profile Implementation

## Backend Updates ✅
- [x] 1. Update app.py with new API endpoints:
  - [x] GET /api/users/me - Get current user profile
  - [x] PUT /api/users/me - Update user profile
  - [x] POST /api/profile/education - Add education
  - [x] DELETE /api/profile/education/<id> - Delete education
  - [x] POST /api/profile/experience - Add work experience
  - [x] DELETE /api/profile/experience/<id> - Delete work experience
  - [x] GET /api/profile/<user_id> - Get user profile with education/experience
  - [x] POST/DELETE /api/profile/skills - Add/remove skills
  - [x] Auto-create freelancer profile on registration
  - [x] Fixed eGov register to accept phone as fallback

## Frontend Updates ✅
- [x] 2. Updated AuthContext to use backend API
- [x] 3. Updated SignUp.tsx to save user to database
- [x] 4. Updated Profile.tsx to:
  - [x] Fetch user data from backend
  - [x] Display education and work experience
  - [x] Add forms to add education
  - [x] Add forms to add work experience
  - [x] Add/remove skills functionality
- [x] 5. Updated EgovCallback.tsx to use backend registration
- [x] 6. Added eGov callback route in server/index.ts
- [x] Updated egovAuth.ts with better configuration

## How eGov Authentication Works:
1. User clicks "Sign up with eGov.kz" on SignUp page
2. Frontend redirects to eGov.kz OAuth page with client_id and redirect_uri
3. User authenticates on eGov.kz with their government ID
4. eGov.kz redirects back to `/auth/egov/callback?code=xxx`
5. Frontend server catches this and redirects to the React callback page
6. EgovCallback.tsx processes the code and calls backend API
7. Backend exchanges code for tokens and gets user info
8. User is registered in MongoDB and logged in
9. User is redirected to complete their profile

## Testing
- [ ] 7. Verify eGov login works (requires real eGov credentials)
- [ ] 8. Verify profile data saves to database (requires MongoDB)

