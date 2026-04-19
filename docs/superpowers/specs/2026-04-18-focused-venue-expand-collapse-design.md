# FocusedVenueControlBox — Expand/Collapse Design

**Date:** 2026-04-18

## Problem

The FocusedVenueControlBox is always fully expanded. On mobile, where the component is used most, it takes up significant vertical space even when the user only needs to glance at scrape/insert counts. An expand/collapse toggle would let users compact the box when they don't need to interact with the venue list.

## Solution

Add an `isExpanded` boolean state (default `true`). The header row becomes a clickable toggle target. A chevron (▲/▾) next to the title indicates the current state and available action. The middle section (venue list + surrounding separators) mounts/unmounts based on `isExpanded`. The switch is wrapped to stop click propagation so it remains fully independent.

## Behavior Rules

| Condition | Chevron/title click | Switch |
|---|---|---|
| Expanded, idle | Collapses | Normal (disabled if no venues) |
| Collapsed, idle | Expands | Normal (disabled if no venues selected — same as always; venues selected before collapsing remain selected) |
| `isLocked` (scrape running) | No-op — disabled | Normal (disabled by existing logic) |

- Venue selection is only possible in expanded state (list is hidden when collapsed — not a special rule, just a consequence of the list being unmounted)
- Collapsing while venues are selected is allowed — `selectedVenues` state is preserved; re-expanding restores the selection
- A scrape cannot be accidentally disrupted by collapsing — the chevron/title click is a no-op when `isLocked`

## Contracted State

Visible: header (title + chevron + subtitle + switch) → separator → footer (SCRAPE / INSERT counts)

Hidden: first separator, venue list, second separator

## Toggle Control

- **Chevron:** `▲` when expanded, `▾` when collapsed — inline after the title text, styled `var(--dark)`, `cursor: pointer`
- **Click target:** entire `controlHeader` div (large mobile target)
- **Locked appearance:** when `isLocked`, `cursor: default` on the header; chevron color stays `var(--dark)` (no hover effect)
- **Switch isolation:** switch wrapped in `<div onClick={e => e.stopPropagation()}>` to prevent header click from firing when the switch is tapped

## Files Changed

| File | Change |
|---|---|
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` | Add `isExpanded` state, conditional render of middle section, clickable header, chevron, switch wrapper |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` | Add `.headerClickable` (cursor pointer, hover subtle bg), `.headerLocked` (cursor default, no hover), `.chevron` |

## No Animation

Height transition is out of scope. Expand/collapse is an instant show/hide. Transition can be added later if desired.
