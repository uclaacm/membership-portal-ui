# Repeated Events API (`/app/api/v1/event/repeated`)

This document describes the **repeated event group** endpoints implemented under:

- Base route: `/app/api/v1/event`
- Repeated routes: `/app/api/v1/event/repeated`, `/app/api/v1/event/repeated/:eventGroupId`

Repeated events are stored as **multiple `Event` rows** (each with its own `uuid`) that share a single **`eventGroupId`** (UUID). This enables:

- Per-instance edits via existing single-event routes (`PATCH/DELETE /event/:uuid`)
- Group-wide edits/deletes or “this instance and future” edits/deletes via `/repeated`

## Event JSON shape

In requests, event data is passed as:

```json
{
  "event": {
    "committee": "Hack",
    "cover": "https://example.com/cover.png",
    "thumb": "https://example.com/thumb.png",
    "title": "My Event",
    "description": "Optional (nullable)",
    "location": "Boelter Hall",
    "eventLink": "https://example.com/rsvp",
    "startDate": "2026-05-01T18:00:00.000Z",
    "endDate": "2026-05-01T20:00:00.000Z",
    "attendanceCode": "CODE-EXAMPLE",
    "attendancePoints": 1
  }
}
```

Notes:

- `eventGroupId` is **not** accepted from clients in `event` bodies. It is assigned by the server for repeated groups.
- For repeated groups, each instance must have a **unique** `attendanceCode` (enforced by DB uniqueness). The server generates distinct codes per instance when creating a series.
- Validation errors use the shared express-validator handler response (`success: false`, `errors: [...]`) while successful responses use `{ "error": null, ... }`.

## Recurrence JSON shape

For `POST /repeated`, recurrence is passed as:

```json
{
  "recurrence": {
    "frequency": "daily",
    "seriesEndDate": "2026-06-01T00:00:00.000Z"
  }
}
```

Supported values:

- `frequency`: `"daily" | "weekly" | "monthly"`
- `seriesEndDate`: ISO-8601 date/time string; **must be on or after** `event.startDate`

Monthly rule:

- Instances repeat on the **same day-of-month** as the first instance (clamped to the last day for short months; e.g. Jan 31 → Feb 28/29).

## Scope contract (group update/delete)

The group endpoints accept an optional scope:

- `scope: "all"` (default): affects **all** instances in the group
- `scope: "fromInstance"`: affects the anchor instance and any instances whose `startDate >= anchor.startDate`
  - Requires `fromUuid` (must belong to this `eventGroupId`)

Example:

```json
{
  "scope": "fromInstance",
  "fromUuid": "c2d8a9c2-40a6-4d62-9f68-6f1e51e4f2c2"
}
```

## Endpoints

### `POST /app/api/v1/event/repeated`

Create a new repeated event group (creates multiple `Event` rows).

**Auth**

- Requires **admin or officer**.
- Non-admin officers must be able to manage the `event.committee`.

**Request body**

```json
{
  "event": { "...": "see Event JSON shape" },
  "recurrence": {
    "frequency": "weekly",
    "seriesEndDate": "2026-05-15T18:00:00.000Z"
  }
}
```

**Success response (200)**

```json
{
  "error": null,
  "eventGroupId": "2b9b3f28-0c27-4b45-9b5a-bc8c87a1c7b6",
  "events": [
    {
      "uuid": "2f7a7f4d-5d3f-4c3b-a4d3-3f22d4c7a8c1",
      "eventGroupId": "2b9b3f28-0c27-4b45-9b5a-bc8c87a1c7b6",
      "organization": "ACM",
      "committee": "Hack",
      "cover": "https://example.com/cover.png",
      "title": "My Event",
      "description": "Series",
      "location": "Boelter Hall",
      "eventLink": "https://example.com/rsvp",
      "startDate": "2026-05-01T18:00:00.000Z",
      "endDate": "2026-05-01T20:00:00.000Z",
      "attendanceCode": "SERIES-20260501-0-2b9b3f",
      "attendancePoints": 1
    }
  ]
}
```

### `GET /app/api/v1/event/repeated/:eventGroupId`

List all event instances in a repeated group (sorted by `startDate` ascending).

**Auth**

- Any non-pending user (same as normal event listing); includes attendanceCode only for admin/officer.

**Request**

- `:eventGroupId` must be a UUID.

**Success response (200)**

```json
{
  "error": null,
  "events": [ /* Event public objects */ ]
}
```

### `PATCH /app/api/v1/event/repeated/:eventGroupId`

Batch update events in a repeated group.

**Auth**

- Requires **admin or officer**.
- Officers must be able to manage the committees of the affected events.

**Request body**

```json
{
  "scope": "all",
  "event": {
    "location": "New location",
    "cover": "https://example.com/new.png"
  }
}
```

Or “this instance and future”:

```json
{
  "scope": "fromInstance",
  "fromUuid": "c2d8a9c2-40a6-4d62-9f68-6f1e51e4f2c2",
  "event": {
    "location": "New location"
  }
}
```

**Success response (200)**

```json
{
  "error": null,
  "events": [ /* updated Event public objects */ ]
}
```

### `DELETE /app/api/v1/event/repeated/:eventGroupId`

Batch delete events in a repeated group.

**Auth**

- Requires **admin or officer**.
- Officers must be able to manage the committees of the affected events.

**Request body**

```json
{ "scope": "all" }
```

Or “this instance and future”:

```json
{
  "scope": "fromInstance",
  "fromUuid": "c2d8a9c2-40a6-4d62-9f68-6f1e51e4f2c2"
}
```

**Success response (200)**

```json
{
  "error": null,
  "numDeleted": 3
}
```

## Related single-instance routes

You can still operate on a single event instance directly using the existing routes:

- `PATCH /app/api/v1/event/:uuid`
- `DELETE /app/api/v1/event/:uuid`

These affect only that one row (even if it has an `eventGroupId`).
