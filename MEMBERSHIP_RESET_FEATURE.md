# Membership Reset Feature Documentation

## Overview
The Membership Reset feature allows administrators to manage member subscriptions with flexible options to cancel, suspend, or restart memberships. This feature provides better control over membership lifecycle management.

## Features

### Three Reset Actions

#### 1. **Cancel Membership**
- **Purpose**: Permanently cancel a membership
- **Effects**:
  - Sets membership status to "cancelled"
  - Resets `amountPaid` to 0
  - Updates member status to "inactive"
  - Adds cancellation note

#### 2. **Suspend/Freeze Membership**
- **Purpose**: Temporarily pause a membership
- **Effects**:
  - Sets membership status to "cancelled"
  - Updates member status to "inactive"
  - Keeps payment information intact
  - Can be reactivated later
  - Adds suspension note

#### 3. **Restart Membership**
- **Purpose**: Reset membership dates and start fresh
- **Effects**:
  - Calculates new start date (today)
  - Calculates new end date (based on original duration)
  - Resets `amountPaid` to 0
  - Sets status to "pending" (awaiting payment)
  - Keeps member status as "active"
  - Adds restart note

## Technical Implementation

### API Endpoint
**Route**: `POST /api/memberships/[id]/reset`

**Request Body**:
```json
{
  "action": "cancel" | "suspend" | "restart",
  "notes": "Optional notes about the action"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Membership cancelled successfully",
  "membership": {
    // Updated membership object
  }
}
```

**Error Responses**:
- `404`: Membership not found
- `404`: Member not found
- `400`: Invalid reset action
- `500`: Server error

### React Hook
**Location**: `/hooks/use-membership.ts`

**Usage**:
```typescript
import { useResetMembership } from "@/hooks/use-membership";

const resetMutation = useResetMembership();

resetMutation.mutateAsync({
  id: "membershipId",
  action: "cancel", // or "suspend" or "restart"
  notes: "Optional notes"
});
```

### UI Component
**Location**: `/components/membership/reset-membership-dialog.tsx`

**Props**:
```typescript
interface ResetMembershipDialogProps {
  membershipId: string;
  memberName: string;
  children?: React.ReactNode;
}
```

**Usage**:
```tsx
<ResetMembershipDialog
  membershipId={membership._id}
  memberName={member.name}
>
  <Button>Reset Membership</Button>
</ResetMembershipDialog>
```

## User Interface

### Access Points

1. **Fee Management Page** (`/dashboard/fees`)
   - Actions dropdown in each membership row
   - "Reset Membership" option

2. **Members Page** (`/dashboard/members`)
   - Actions dropdown in each member row
   - "Reset Membership" option

### Dialog Interface

The reset dialog provides:
- Radio button selection for reset action
- Visual icons for each action type
- Descriptive text explaining each action's effects
- Optional notes field for documentation
- Confirmation button (color-coded based on action severity)

### Visual Feedback

- **Success Toast**: Displays confirmation message
- **Error Toast**: Shows error with retry suggestion
- **Loading State**: Shows spinner during processing
- **Auto-refresh**: Invalidates queries to refresh data

## Database Changes

### Membership Model Updates

| Field | Cancel | Suspend | Restart |
|-------|--------|---------|---------|
| `status` | "cancelled" | "cancelled" | "pending" |
| `amountPaid` | 0 | unchanged | 0 |
| `startDate` | unchanged | unchanged | today |
| `endDate` | unchanged | unchanged | today + duration |
| `notes` | updated | updated | updated |

### Member Model Updates

| Field | Cancel | Suspend | Restart |
|-------|--------|---------|---------|
| `status` | "inactive" | "inactive" | "active" |

## Use Cases

### 1. Member Requests Cancellation
**Action**: Cancel
- Member wants to permanently stop their membership
- Refund has been processed (if applicable)
- Need to close the account

### 2. Member Takes a Break
**Action**: Suspend
- Member traveling for extended period
- Medical leave
- Temporary financial constraints
- Plans to return later

### 3. Member Returns After Expiration
**Action**: Restart
- Expired membership needs reactivation
- Want to maintain same plan duration
- Reset payment cycle
- Keep member in system with fresh start

## Integration Points

### Pages Updated
1. `/app/dashboard/fees/page.tsx` - Fee management
2. `/app/dashboard/members/page.tsx` - Member list

### Query Invalidation
After reset, the following queries are invalidated:
- `["memberships"]` - Membership list
- `["members"]` - Member list
- `["member", membershipId]` - Individual member

## Security Considerations

1. **Authentication**: Protected by Clerk middleware
2. **Authorization**: All `/dashboard/*` routes require authentication
3. **Validation**: Server-side validation of action type
4. **Error Handling**: Comprehensive error catching and user feedback

## Future Enhancements

Potential improvements:
1. Add role-based permissions (only admins can cancel)
2. Email notifications to members on status changes
3. Suspension duration tracking (auto-reactivate after X days)
4. Refund calculation and processing
5. Activity log/audit trail for membership changes
6. Bulk reset operations
7. Scheduled reactivation for suspended memberships

## Testing Recommendations

### Manual Testing Checklist
- [ ] Cancel active membership
- [ ] Cancel pending membership
- [ ] Suspend active membership
- [ ] Restart expired membership
- [ ] Verify member status updates
- [ ] Verify payment amounts reset correctly
- [ ] Test with different membership types
- [ ] Verify toast notifications
- [ ] Check query invalidation and refresh

### Edge Cases
- Membership already cancelled
- Member not found
- Invalid membership ID
- Network errors during operation
- Concurrent updates

## Troubleshooting

### Common Issues

**Issue**: "Membership not found"
- **Solution**: Verify membership ID is correct and membership exists

**Issue**: Member status not updating
- **Solution**: Check query invalidation, refresh browser cache

**Issue**: Dates not calculating correctly for restart
- **Solution**: Verify membership type duration is set correctly

**Issue**: Dialog not closing after success
- **Solution**: Check toast notifications and error console

## Code Files Reference

```
├── app/
│   ├── api/
│   │   └── memberships/
│   │       └── [id]/
│   │           └── reset/
│   │               └── route.ts          # API endpoint
│   └── dashboard/
│       ├── fees/
│       │   └── page.tsx                  # Fee management UI
│       └── members/
│           └── page.tsx                  # Member list UI
├── components/
│   └── membership/
│       └── reset-membership-dialog.tsx   # Reset dialog component
└── hooks/
    └── use-membership.ts                  # React Query hook
```

## License
Part of the Muscle Unit Gym Management System

