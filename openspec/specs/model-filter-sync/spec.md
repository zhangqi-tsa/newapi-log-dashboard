## ADDED Requirements

### Requirement: ModelDimension page synchronizes filterToken from URL parameters
The ModelDimension page SHALL synchronize the `filterToken` state with the URL `token` query parameter when the URL changes.

#### Scenario: User navigates from UserSummary with token parameter
- **WHEN** the user clicks a user in UserSummary and navigates to `/model?token=test-user`
- **THEN** the ModelDimension page SHALL set `filterToken` to `"test-user"`
- **AND** the ModelDimension page SHALL fetch data filtered by `token_name="test-user"`
- **AND** the displayed data SHALL only include records for that specific user

### Requirement: ModelDimension page handles empty token parameter
The ModelDimension page SHALL clear the `filterToken` filter when the URL `token` parameter is absent or empty.

#### Scenario: User navigates to /model without token parameter
- **WHEN** the user navigates to `/model` without a `token` query parameter
- **THEN** the ModelDimension page SHALL set `filterToken` to an empty string
- **AND** the ModelDimension page SHALL display all users' model dimension data

### Requirement: StatsCards display data for the filtered user
The stats cards (total requests, total tokens) on the ModelDimension page SHALL display statistics calculated only from the filtered dataset.

#### Scenario: Filtered view shows correct statistics
- **WHEN** the ModelDimension page displays data filtered by `token_name`
- **THEN** the stats cards SHALL show totals calculated from the filtered API response
- **AND** the displayed numbers SHALL match the sum of the visible table rows
