# 📚 Canvas API Notes

## Authentication
- Uses API token in header: `Authorization: Bearer <token>`
- Token generated via Canvas user settings

## Assignments Endpoint
- URL: `https://<your-canvas-instance>/api/v1/courses/:course_id/assignments`
- Returns JSON array of assignments
- Key fields:
  - `name`
  - `due_at`
  - `html_url`

## Filtering
- Can filter by `due_at`, `overdue`, `bucket` params
