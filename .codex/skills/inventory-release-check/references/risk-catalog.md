# Risk Catalog

Blocking:
- Secret credentials committed to git.
- Unauthenticated destructive routes.

High:
- Route definitions diverge from cached routes.
- Permission middleware mismatch with seeders.

Medium:
- Duplicate component files differing only by path case.
- Leftover debug statements (`dd`, noisy `console.log`).

Low:
- Inconsistent naming style that does not affect runtime.
