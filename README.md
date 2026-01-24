This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Next.js**: 15.5.9
- **React**: 19.2.3
- **TypeScript**: ^5
- **Tailwind CSS**: v4 (with `@tailwindcss/postcss`)
- **Shadcn UI**: ^3.6.3
- **Radix UI**: ^1.4.3
- **Lucide React**: ^0.562.0

## Prerequisites

- Node.js 24.1+ (recommended)
- npm, yarn, pnpm, or bun

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tailwind CSS v4 Configuration

This project uses **Tailwind CSS v4** with the new PostCSS plugin approach:

- **PostCSS Config**: `postcss.config.mjs` uses `@tailwindcss/postcss` plugin
- **CSS Import**: `app/globals.css` imports Tailwind with `@import "tailwindcss"`
- **Theme Configuration**: Custom theme variables are defined in `@theme inline` block

The project uses **webpack** (default) instead of Turbopack for better compatibility with Tailwind CSS v4.

## Features

### UserMenu Component

The UserMenu component is a dropdown menu for user profile management that appears in the sidebar footer. It supports permission-based menu visibility using cookies.

#### Configuration

Menu items are configured in `lib/user-menu-config.json`:

```json
{
  "menuItems": [
    {
      "id": "profile",
      "label": "Profile",
      "icon": "UserIcon",
      "permission": "user.profile.view",
      "variant": "default"
    },
    {
      "id": "settings",
      "label": "Settings",
      "icon": "SettingsIcon",
      "permission": "system.settings.view",
      "variant": "default"
    }
  ],
  "logoutItem": {
    "id": "logout",
    "label": "ออกจากระบบ",
    "icon": "LogOutIcon",
    "permission": "auth.logout",
    "variant": "destructive"
  }
}
```

#### Permission Format

Permissions follow the format: `Module.scope.actions`

Examples:
- `user.profile.view` - View user profile
- `system.settings.view` - View system settings
- `bi.sales.view` - View sales in BI module

#### Cookie Setup

The UserMenu reads permissions from a cookie. Set the cookie with the following format:

**Comma-separated string:**
```
permissions=user.profile.view,system.settings.view,bi.sales.view
```

**JSON array:**
```
permissions=["user.profile.view","system.settings.view","bi.sales.view"]
```

#### Usage

```tsx
import { UserMenu } from "@/components/user-menu"

<UserMenu
  name="superadmin"
  email="isawa.mac@gmail.com"
  avatarSrc="/path/to/avatar.jpg"
  avatarFallback="SA"
  permissionsCookieName="permissions" // Optional, defaults to "permissions"
/>
```

#### Behavior

- Menu items (Profile, Settings) are only visible if the user has the corresponding permission in the cookie
- Logout is always visible (no permission check required)
- The component automatically polls the cookie every second to detect permission changes
- If no permissions are found in the cookie, only the logout option will be displayed

#### Adding New Menu Items

1. Edit `lib/user-menu-config.json`
2. Add a new menu item with:
   - `id`: Unique identifier
   - `label`: Display text
   - `icon`: Icon name from lucide-react (must be added to `iconMap` in `components/user-menu.tsx`)
   - `permission`: Permission string in `Module.scope.actions` format
   - `variant`: "default" or "destructive"

3. Add the icon to the `iconMap` in `components/user-menu.tsx`:

```tsx
const iconMap: Record<string, LucideIcon> = {
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  YourNewIcon, // Add here
}
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── app-sidebar.tsx   # Main sidebar component
│   └── user-menu.tsx     # User menu dropdown component
├── lib/                  # Utility functions and configs
│   ├── utils.ts          # Utility functions (cookie helpers)
│   └── user-menu-config.json  # Menu configuration
└── hooks/                # Custom React hooks
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
