# Shared UI Components Kit

This directory contains the shared UI kit for the SecuGuard platform. Use these components to maintain a consistent, premium design language.

## Button
Renders a styled button with hover and active states.
- `variant` (string): 'primary' (default) or 'secondary'. Primary uses a vibrant gradient; secondary uses a glassmorphism border.
- `className` (string): Additional CSS classes.
- `children` (node): The button content.

## Card
A glassmorphism container panel used for content blocks, forms, and lists.
- `className` (string): Additional CSS classes.
- `children` (node): The card content.

## StatusBadge
Displays a small pill badge with colors matching the status.
- `status` (string): e.g. 'published', 'draft', 'archived', 'completed', 'in_progress', 'overdue'.
