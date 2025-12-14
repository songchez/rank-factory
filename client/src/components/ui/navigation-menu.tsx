import * as React from "react";
import { cn } from "@/lib/utils";

type NavProps = React.HTMLAttributes<HTMLElement>;
type NavItemProps = React.LiHTMLAttributes<HTMLLIElement>;
type NavLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean };

export const NavigationMenu = React.forwardRef<HTMLElement, NavProps>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn("relative inline-flex items-center", className)} {...props} />
  )
);
NavigationMenu.displayName = "NavigationMenu";

export const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
);
NavigationMenuList.displayName = "NavigationMenuList";

export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("list-none", className)} {...props} />
  )
);
NavigationMenuItem.displayName = "NavigationMenuItem";

export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-30 mt-2 min-w-[200px] rounded-md border border-black/10 bg-white p-3 shadow-md",
        className
      )}
      {...props}
    />
  )
);
NavigationMenuContent.displayName = "NavigationMenuContent";

export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn("relative block rounded-md px-3 py-2 text-sm transition-all after:absolute after:left-0 after:bottom-1 after:h-[2px] after:w-0 after:bg-foreground after:transition-all after:duration-200 hover:after:w-full", className)}
      {...props}
    >
      {children}
    </a>
  )
);
NavigationMenuLink.displayName = "NavigationMenuLink";

export const navigationMenuTriggerStyle = (className?: string) =>
  cn(
    "inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all",
    className
  );
