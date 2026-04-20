# Database Schema

The backend uses MongoDB with Mongoose models for Learning Management System (LMS) data.

## Core Design

### Role Enum

- `role`: `admin`, `instructor`, `student`

### Shared Timestamps

- Models use `timestamps: true`, which automatically maintains `createdAt` and `updatedAt`.

## Collections and Purpose

1. `users`
- Stores all platform users.
- Includes role, email uniqueness, and password hash.

2. `courses`
- Stores courses created by instructors.
- References `users._id` through `instructorId`.

3. `modules`
- Stores course modules/sections.
- References `courses._id`.

4. `lessons`
- Stores lesson content in modules.
- References `modules._id`.

5. `quizzes`
- Reserved collection in readiness checks.
- Not yet modeled in API routes.

6. `enrollments`
- Reserved collection in readiness checks.
- Not yet modeled in API routes.

## Notes

- MongoDB creates collections automatically on first write.
- Uniqueness for user email is enforced by the `users.email` unique index.
