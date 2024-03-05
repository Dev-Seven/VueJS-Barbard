# api

## 1.0.8

### Patch Changes

- 13b0d1d: fix(apps/api): nhanhitem deprecated url
- Updated dependencies [06a15b8]
  - core@0.1.3
  - data@0.1.2

## 1.0.7

### Patch Changes

- Updated dependencies [dc7e507]
- Updated dependencies [ec77dfa]
  - core@0.1.2
  - data@0.1.2

## 1.0.6

### Patch Changes

- 0a32856: feat(apps/api): affiliate functions migration to core pkg
- Updated dependencies [0a32856]
  - core@0.1.1
  - data@0.1.1

## 1.0.5

### Patch Changes

- b0ab052: fix(apps/api): fix fnb types when closing order

## 1.0.4

### Patch Changes

- b1db6f9: refactor(apps/api): integrate with POS
- Updated dependencies [b1db6f9]
  - @barbaard/types@0.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [ade8555]
  - @barbaard/types@0.0.3

## 1.0.2

### Patch Changes

- 33010fc: feat(apps/api): cron run 4.00am to pull data from marketman

## 1.0.1

### Patch Changes

- 9d4b2e5: fix(apps/api): atomic CheckAffiliate function
- 50f7b60: Affiliate functions
- 23da591: fix: nhanh payload fix, adding depotId

## 1.0.0

### Major Changes

- 9e99fa61: replace sendinblue sdk with brevo sdk

### Patch Changes

- 89f07438: Better logging for /WPnotification: which event is going to be updated
- 8a169f4c: fix onUserUpdate function auth error logs
- 61b03b7c: fix: conditional error in checkOtp

## 0.3.3

### Patch Changes

- 3bba01ce: Handle nested cases when mapping from DTO to DAO
- eaa80fd2: Better handling of user search by wpid, phone, booklyUserId

## 0.3.2

### Patch Changes

- a8a2255: fix: check absence of user instead of existence
- 16d7676: feat: uncomment addCustomerLostTags

## 0.3.1

### Patch Changes

- bc14a6a: feat: log more informative message when auth doc is not found
- b51b8f5: fix(apps/api): deployment with isolate

## 0.3.0

### Minor Changes

- 6c27644: implement DTO

## 0.2.0

### Minor Changes

- 542d932: New BarbaardUser Type

### Patch Changes

- 3a37169: fix: remove connecta query
- 92129c2: Hotfix/wp customer update
- c78e848: Hotfix/functions deploy
- Updated dependencies [542d932]
  - @barbaard/types@0.0.2

## 0.2.0

### Minor Changes

- 0efd1e3: refactor: BBD-43 cloud function for duplicate users
- 1dbf42e: refactor: BBD-752 pull MarketMan items

### Patch Changes

- 6bb6761: Fix: Broken package resolution in Jest for @barbaard/types

## 0.1.2

### Patch Changes

- 4089371: fix: hanoi id == 4 || id = 1

## 0.1.1

### Patch Changes

- 7414f3f: - fix: "main" config in package.json for @barbaard/types; now functions can work with emulators
  - ci: update deploy scripts for functions in `apps/api`
- Updated dependencies [7414f3f]
  - @barbaard/types@0.0.1

## 0.1.0

### Minor Changes

- 23928d3: refactor: BBD-748 import Nhanh items cloud function

## 0.0.4

### Patch Changes

- d0a9b53: fix: BBD-744 use of items subcollection in register cloud function

## 0.0.3

### Patch Changes

- eec2257: fix: force conversion number to number (if it's string)

## 0.0.2

### Patch Changes

- 9780ca5: SKU fix

## 0.0.1

### Patch Changes

- 9d924cf: fix: staffAny parsing
