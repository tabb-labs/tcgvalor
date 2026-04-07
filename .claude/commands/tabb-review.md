# Tabb Review

Run `git diff origin/main...HEAD` and perform a thorough code review using only that diff output — do not read any files from the codebase. Focus only on TypeScript and React source files — ignore config files, lock files, migrations, and CI files.

Evaluate against the following criteria:

## Clean Code

- Names (types, functions, variables) clearly communicate intent without needing comments
- Functions do one thing; no hidden side effects
- No dead code, commented-out code, or unnecessary complexity

## Dependency Injection

- Dependencies are injected, not constructed internally
- Abstractions are used at boundaries where testability or flexibility matters — but not over-abstracted for types that will never need substitution
- Injection is done at the right level (don't pass deps through several layers just to reach a leaf)

## SOLID

- **Single Responsibility**: each module/function has one reason to change
- **Open/Closed**: behavior can be extended without modifying existing code
- **Liskov Substitution**: implementations honor the contracts of the interfaces they satisfy
- **Interface Segregation**: types and interfaces are focused; no bloated contracts that force irrelevant implementation
- **Dependency Inversion**: high-level modules depend on abstractions, not concretions

## DRY vs WET

- Shared logic is extracted when the concepts are genuinely the same thing
- Incidental similarity (same code, different meaning) is NOT extracted — duplication across unrelated boundaries is acceptable
- No premature abstraction: helpers exist because they're used in multiple places, not in anticipation of future reuse

## Code Efficiency

- No redundant work (repeated computations, unnecessary allocations, avoidable network calls)
- No O(n²) patterns where O(n) would do
- No unnecessary type conversions or intermediate values

## TypeScript Best Practices

- Types are precise — no unnecessary `any`, `as unknown as`, or unsafe casts
- `null` and `undefined` are handled explicitly; no silent propagation
- `async/await` used correctly; no floating promises
- Error handling is intentional — errors are caught at the right level, not silently swallowed
- Access boundaries respected — internals not unnecessarily exported
- React hooks follow the rules of hooks; dependencies arrays are correct
- Side effects in `useEffect` are cleaned up where necessary

## Output Format

For each file reviewed, list findings grouped by severity:

**Critical** — likely bug, security risk, or serious design violation
**Warning** — clear improvement needed, but not immediately harmful
**Suggestion** — minor improvement or style note

If a file has no findings, say so explicitly. End with a brief overall summary of the health of the code.
